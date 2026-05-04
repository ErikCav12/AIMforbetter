/* AIM Course Builder wizard
 * Page-scoped: only loaded by pages/course-builder.html.
 * Deterministic L4: every reactive branch traces back to inputs via a published rubric.
 * Stand-in copies are tagged in MODULE_LIBRARY.placeholder = true so we can later swap them.
 */
(function () {
    'use strict';

    /* ────────────────────────────────────────────
     * Configuration
     * ──────────────────────────────────────────── */

    const TOTAL_STEPS = 6;

    // Pillar weights per audience. Sourced from pages/course-builder.html notes.
    const PILLAR_WEIGHTS = {
        juniors:  { C: 0.70, G: 0.10, B: 0.20 },
        managers: { C: 0.20, G: 0.70, B: 0.10 },
        mixed:    { C: 0.40, G: 0.35, B: 0.25 },
        culture:  { C: 0.30, G: 0.30, B: 0.40 },
    };

    const AUDIENCE_LABELS = {
        juniors:  'early-career / Gen Z',
        managers: 'managers',
        mixed:    'a mixed audience',
        culture:  'culture-wide teams',
    };

    const FORMAT_LABELS = {
        'in-person': 'in-person',
        'hybrid':    'hybrid',
        'remote':    'remote',
    };

    // Concerns -> objective codes that get a +30% boost when concern is scored ≥3.
    const CONCERNS_BOOSTS = {
        'cb-concern-trust':      ['C1', 'C2'],
        'cb-concern-security':   ['C3', 'G4'],
        'cb-concern-jobs':       ['B1', 'B2'],
        'cb-concern-compliance': ['G3', 'G4', 'G5'],
        'cb-concern-thinking':   ['B3', 'C2'],
    };
    const BOOST_MULTIPLIER = 1.30;
    const BOOST_THRESHOLD  = 3;

    // Industry-specific pulse-check openers. Stand-ins; real tool replaces with LLM-generated copy
    // grounded in actual company / sector research.
    const INDUSTRY_OPENERS = {
        tech:       'Anonymous live poll on the room\'s current AI habits — most tech teams are surprised when they see how many colleagues are quietly running production prompts in personal accounts.',
        finance:    'Anonymous live poll on the room\'s current AI habits — financial services teams typically discover a wide gap between what the policy says and what people actually do.',
        prof:       'Anonymous live poll on the room\'s current AI habits — professional services teams often find AI is already in client deliverables before the firm has a position on it.',
        healthcare: 'Anonymous live poll on the room\'s current AI habits — healthcare and life sciences teams usually surface a sharp split between research-side and patient-facing comfort with AI.',
        public:     'Anonymous live poll on the room\'s current AI habits — public sector teams often surface a gap between formal guidance and individual workarounds.',
        retail:     'Anonymous live poll on the room\'s current AI habits — retail and consumer teams typically find AI has crept into marketing copy faster than anyone realised.',
        media:      'Anonymous live poll on the room\'s current AI habits — media and marketing teams almost always find some AI-generated copy has already shipped, attributed or otherwise.',
        manu:       'Anonymous live poll on the room\'s current AI habits — manufacturing and engineering teams typically split between cautious shop-floor and adventurous design office.',
        education:  'Anonymous live poll on the room\'s current AI habits — education teams often discover staff and student use diverge sharply, with neither side openly disclosing.',
        other:      'Anonymous live poll on the room\'s current AI habits — sets a baseline for the day and surfaces where the room actually is, rather than where they say they are.',
    };

    // Closing-commitment templates, keyword-routed from the "Why" freetext.
    // First match wins; the empty keyword array catches everything else.
    const COMMITMENT_TEMPLATES = [
        {
            keywords: ['spot', 'catch', 'nonsense', 'slop', 'wrong', 'hallucinat', 'mistake', 'accura'],
            title:    'Three things I\'ll catch on Monday',
            desc:     '30 min · Each person commits to three specific kinds of AI failure they will actively look for in the next week. Written, public, specific.',
        },
        {
            keywords: ['review', 'check', 'junior', 'manage', 'oversee', 'sign-off', 'sign off'],
            title:    'Three review habits I\'ll keep',
            desc:     '30 min · Each manager commits to three review habits they will keep for AI-assisted work — what they read, what they ask, what they push back on.',
        },
        {
            keywords: ['compliance', 'regulation', 'policy', 'legal', 'risk', 'audit'],
            title:    'Three boundaries I\'ll enforce',
            desc:     '30 min · Each person commits to three AI-use boundaries they will actively enforce in their team — what is in scope, what is out, who decides edge cases.',
        },
        {
            keywords: ['transparent', 'hide', 'disclose', 'honest', 'open', 'mention'],
            title:    'Three conversations I\'ll have',
            desc:     '30 min · Each person commits to three conversations about AI they will have this fortnight — with a manager, a peer, and a junior. Specific names.',
        },
        {
            keywords: ['confidence', 'own', 'judgement', 'judgment', 'ownership', 'account'],
            title:    'Three calls I\'ll own',
            desc:     '30 min · Each person commits to three decisions about AI-assisted work they will own this month — not delegate, not defer, own.',
        },
        {
            keywords: [], // default
            title:    'Three behaviours I\'ll start',
            desc:     '30 min · Three behaviours each person takes back to work on Monday. Written, public, specific.',
        },
    ];

    // Culture-word tone register classifier. Stand-in for the production LLM.
    const CULTURE_REGISTERS = {
        cautious: {
            keywords: ['cautious', 'careful', 'risk-averse', 'risk averse', 'conservative', 'measured', 'considered', 'thoughtful', 'deliberate'],
            intro:    'A measured day. We\'ll work at the pace that fits a {culture} culture — fewer surprises, more space to think things through. The agenda below reflects your priorities.',
        },
        fastMoving: {
            keywords: ['fast', 'fast-moving', 'fast moving', 'agile', 'startup', 'scrappy', 'rapid', 'aggressive', 'ambitious', 'high-growth', 'high growth'],
            intro:    'A high-tempo day. We\'ll keep the energy that fits a {culture} culture — quick rounds, sharp drills, no filler. The agenda below reflects your priorities.',
        },
        collaborative: {
            keywords: ['collaborative', 'collegial', 'team', 'team-first', 'open', 'inclusive', 'transparent', 'friendly', 'warm', 'supportive'],
            intro:    'A team-first day. We\'ll build on the {culture} culture you described — paired drills, shared cards, plenty of room for the room to talk. The agenda below reflects your priorities.',
        },
        formal: {
            keywords: ['formal', 'structured', 'hierarchical', 'professional', 'rigorous', 'disciplined', 'process-driven', 'process driven', 'corporate'],
            intro:    'A structured day. We\'ll match the {culture} culture you described — clear agenda, named outputs, defensible methods at every step. The agenda below reflects your priorities.',
        },
    };
    const DEFAULT_REGISTER_INTRO = 'A day designed around your priorities. The agenda below is built on the answers you gave — every module, activity and reflection traces back to something you told us.';

    // The 13 modules. Each maps 1:1 to a learning objective (C1..C5, G1..G5, B1..B3).
    // Activity copies are deliberately compact stand-ins (≤25 words) so Erik/Molly can replace
    // them incrementally without reflowing the wizard. Marked `placeholder: true` for the ones
    // that are not yet on the live modules.html.
    const MODULE_LIBRARY = {
        C1: {
            title: 'Where AI fails',
            pillar: 'C',
            overview: 'Plain-English explanation of hallucinations, drift, and why confident nonsense is the default, not the exception.',
            activities: {
                'in-person': 'Spot the Slop — team challenge to catch two AI fabrications hidden in five workplace statements. Stand-up vote per statement.',
                'hybrid':    'Spot the Slop — paired drill across the room and remote breakout rooms; teams submit votes via shared poll, debrief together.',
                'remote':    'Spot the Slop — breakout-room version, teams catch two fabrications hidden in five workplace statements, anonymous poll for results.',
            },
            reflections: {
                normal: 'Where did your team assume accuracy without checking? Captured on commitment cards.',
                sharp:  'Where did your team assume accuracy without checking — and what did that nearly cost you the last time?',
            },
            placeholder: false,
        },
        C2: {
            title: 'Due diligence toolkit',
            pillar: 'C',
            overview: 'Five validation techniques you can apply to any AI output in under 60 seconds — the questions, the tells, the source-checks.',
            activities: {
                'in-person': 'Paired validation drill using outputs you generate live in the session. Pairs trade outputs; faster pair gets the commitment card.',
                'hybrid':    'Paired validation drill in mixed in-person/remote pairs; outputs generated live, traded across the room and breakout rooms.',
                'remote':    'Paired validation drill in breakout rooms; outputs generated live and traded between rooms, results shared on a common doc.',
            },
            reflections: {
                normal: 'Which technique will you adopt first?',
                sharp:  'Which technique will you adopt first — and which one would have caught the AI mistake your team made most recently?',
            },
            placeholder: false,
        },
        C3: {
            title: 'Responsible boundaries',
            pillar: 'C',
            overview: 'Where AI use is in-scope, where it isn\'t, and how to tell the difference at speed — without slowing real work down.',
            activities: {
                'in-person': 'Boundary card-drop — five real workplace scenarios, three colour cards each (green/amber/red). Teams commit, then the room debates outliers.',
                'hybrid':    'Boundary vote — five real scenarios, three colour responses each, mixed in-person/remote vote, debate the outliers as one group.',
                'remote':    'Boundary vote — five real scenarios, three colour responses each via anonymous poll, breakout debate on the outliers.',
            },
            reflections: {
                normal: 'Where will your team hit the first hard boundary in the next month?',
                sharp:  'Where is your team about to cross a boundary they don\'t yet know exists?',
            },
            placeholder: true,
        },
        C4: {
            title: 'Right tool for the job',
            pillar: 'C',
            overview: 'Public vs approved internal vs deep-research tools — matching the right AI to the right task without falling into the default-to-ChatGPT trap.',
            activities: {
                'in-person': 'Five real scenarios, three tool options each. Teams vote and defend their pick to the room. Facilitator plays devil\'s advocate.',
                'hybrid':    'Five real scenarios, three tool options each. Mixed pairs vote and defend; debate runs across in-person and remote.',
                'remote':    'Five real scenarios, three tool options each. Breakout teams vote, defend their pick to the full room via shared screen.',
            },
            reflections: {
                normal: 'What\'s your team\'s current default tool? Is it the right one?',
                sharp:  'What\'s your team\'s current default tool — and where is it actively hurting your work without anyone admitting it?',
            },
            placeholder: false,
        },
        C5: {
            title: 'Working AI like a junior colleague',
            pillar: 'C',
            overview: 'Prompting, iteration, and treating AI as a structured working partner — what it\'s good at, what it\'s bad at, when to push back.',
            activities: {
                'in-person': 'Prompt-Off — teams race to get the most reliable answer to a tricky business question. Iteration history projected; room scores reliability.',
                'hybrid':    'Prompt-Off — teams race in mixed in-person/remote pairs, iteration history shared on a common screen, room scores reliability.',
                'remote':    'Prompt-Off — breakout teams race to get the most reliable answer; iteration history shared on a common doc, room scores reliability.',
            },
            reflections: {
                normal: 'What changed between the first and final prompt?',
                sharp:  'What changed between the first and final prompt — and what would your team\'s usual one-shot have missed?',
            },
            placeholder: false,
        },
        G1: {
            title: 'Review at speed',
            pillar: 'G',
            overview: 'How to review AI-assisted work fast — what to read first, what to ignore, where to spend the seconds you actually have.',
            activities: {
                'in-person': 'Stop-the-clock review drill. Each manager has 90 seconds per AI-assisted artefact, three artefacts back-to-back. Group debriefs the calls.',
                'hybrid':    'Stop-the-clock review drill in mixed pairs, 90 seconds each, three artefacts back-to-back, group debrief across the room.',
                'remote':    'Stop-the-clock review drill in breakout rooms, 90 seconds each, three artefacts back-to-back, group debrief on shared screen.',
            },
            reflections: {
                normal: 'Where is your team\'s review process slowest, and is that slowness adding value?',
                sharp:  'Where is your team\'s review process slowest — and is that slowness actually catching anything?',
            },
            placeholder: true,
        },
        G2: {
            title: 'Light-touch visibility',
            pillar: 'G',
            overview: 'How to see what your team is doing with AI without surveillance — visibility through habit, not control.',
            activities: {
                'in-person': 'Visibility design exercise — each manager drafts the one question they will ask in their next 1:1 to surface AI use without auditing.',
                'hybrid':    'Visibility design exercise — managers draft their question, swap with a peer (in-person or remote), refine. Best three shared with the room.',
                'remote':    'Visibility design exercise in breakout rooms — managers draft their question, peer-review it, share the best three with the full room.',
            },
            reflections: {
                normal: 'What signals would tell you something\'s off, before someone has to come and tell you?',
                sharp:  'What signals would tell you something\'s off — that you\'re currently not looking at?',
            },
            placeholder: true,
        },
        G3: {
            title: 'Accountable use across teams',
            pillar: 'G',
            overview: 'Consistency in how AI is used and disclosed across teams — making the standard live in conversations, not in a policy document.',
            activities: {
                'in-person': 'Consistency-card drill — three teams write their AI use rules, swap, then mark up each other\'s for gaps. Plenary picks the strongest set.',
                'hybrid':    'Consistency-card drill across mixed teams; rules drafted, swapped between in-person and remote, gaps marked, plenary picks strongest.',
                'remote':    'Consistency-card drill in breakout rooms — three teams write rules, swap, mark gaps, plenary picks the strongest set.',
            },
            reflections: {
                normal: 'Where are two teams in your org doing AI differently, and is that intentional?',
                sharp:  'Where are two teams in your org doing AI differently — and which one are you quietly worried about?',
            },
            placeholder: true,
        },
        G4: {
            title: 'Safe adoption',
            pillar: 'G',
            overview: 'How to bring new AI tools into the organisation without learning by incident — the questions to ask before, not after.',
            activities: {
                'in-person': 'Adoption gauntlet — teams pitch a new tool, the room plays risk officers, security, and end-users in turn. Pitch dies or survives.',
                'hybrid':    'Adoption gauntlet — mixed teams pitch, role-play split across in-person and remote, group decides if pitch survives.',
                'remote':    'Adoption gauntlet in breakout rooms — teams pitch, others role-play scrutiny, plenary decides if pitch survives.',
            },
            reflections: {
                normal: 'What\'s the next AI tool likely to land on your team, and who decides whether it lands safely?',
                sharp:  'What\'s the next AI tool likely to land on your team — and is the decision being made by someone who knows the risks?',
            },
            placeholder: true,
        },
        G5: {
            title: 'Innovate without breaking things',
            pillar: 'G',
            overview: 'Backing the right experiments and shutting down the wrong ones — without stifling the people who are genuinely trying to do better work.',
            activities: {
                'in-person': 'Bet/block exercise — three real innovation pitches, each manager calls bet/block/wait with reasoning. Group resolves disagreements live.',
                'hybrid':    'Bet/block exercise across mixed pairs — three pitches, calls made and defended across in-person and remote, disagreements resolved live.',
                'remote':    'Bet/block exercise in breakout rooms — three pitches, calls made and defended, disagreements resolved in plenary.',
            },
            reflections: {
                normal: 'What experiment is your team running that you should formally back, and what\'s one you should formally stop?',
                sharp:  'What experiment is your team running that you\'re tolerating but not really backing — and is that fair on the person running it?',
            },
            placeholder: true,
        },
        B1: {
            title: 'Transparent and responsible AI use',
            pillar: 'B',
            overview: 'Normalising open conversations about AI use in team-produced work — making disclosure the default, not the exception.',
            activities: {
                'in-person': 'Role-play — "Don\'t mention AI in the slide". A colleague asks you to hide AI use. What do you do? Pairs swap roles, group debriefs.',
                'hybrid':    'Role-play — "Don\'t mention AI in the slide". Mixed pairs across in-person and remote swap roles, group debriefs across both.',
                'remote':    'Role-play in breakout rooms — "Don\'t mention AI in the slide". Pairs swap roles, group debriefs in plenary.',
            },
            reflections: {
                normal: 'Where in your team would this conversation have landed differently today?',
                sharp:  'Where in your team would this conversation have landed differently today — and who would have been hurt by the silence?',
            },
            placeholder: false,
        },
        B2: {
            title: 'Shared expectations',
            pillar: 'B',
            overview: 'Establishing what good looks like — what the team agrees on about AI use, and what is left deliberately to individual judgement.',
            activities: {
                'in-person': 'Expectations canvas — each team drafts three "always", three "never", three "ask first". Walls compared, sharpest wording wins.',
                'hybrid':    'Expectations canvas drafted in mixed teams, shared across the room and breakout rooms, sharpest wording voted up.',
                'remote':    'Expectations canvas in breakout rooms — three "always", three "never", three "ask first" per team, plenary picks sharpest wording.',
            },
            reflections: {
                normal: 'Which of those nine statements would your team find hardest to live by?',
                sharp:  'Which of those nine statements is your team already breaking, and how would you know?',
            },
            placeholder: true,
        },
        B3: {
            title: 'Critical thinking by default',
            pillar: 'B',
            overview: 'How to keep judgement sharp when AI makes the easy answer always available — practical exercises for the room to leave with the habit, not just the idea.',
            activities: {
                'in-person': 'Disagree-with-the-AI drill — every team gets an AI answer they have to argue against, judged on evidence and structure, not contrarianism.',
                'hybrid':    'Disagree-with-the-AI drill in mixed pairs — AI answers argued against across in-person and remote, plenary judges the best.',
                'remote':    'Disagree-with-the-AI drill in breakout rooms — pairs argue against an AI answer, plenary judges based on evidence and structure.',
            },
            reflections: {
                normal: 'Where in this last week did you accept an AI answer you should have pushed back on?',
                sharp:  'Where in this last week did you accept an AI answer you should have pushed back on — and what made it easier not to?',
            },
            placeholder: true,
        },
    };

    // ────────────────────────────────────────────
    // DOM refs
    // ────────────────────────────────────────────

    const form          = document.getElementById('cb-form');
    const wizard        = document.getElementById('cb-wizard');
    const progressBar   = document.getElementById('cb-progress-bar');
    const progressLabel = document.getElementById('cb-progress-label');
    const backBtn       = document.getElementById('cb-back');
    const nextBtn       = document.getElementById('cb-next');
    const output        = document.getElementById('cb-output');
    const restartBtn    = document.getElementById('cb-restart');
    const intro         = document.getElementById('cb-intro-paragraph');
    const tailored      = document.getElementById('cb-agenda-tailored');
    const agendaHeading = document.getElementById('cb-agenda-heading');
    const agendaRows    = document.getElementById('cb-agenda-rows');

    if (!form || !wizard || !progressBar || !nextBtn || !backBtn || !output || !agendaRows) {
        // Safety net — if any of the wizard scaffolding is missing, abort silently rather than
        // throwing on an unrelated page. (course-builder.js is only ever loaded from the wizard
        // page, so this should never fire.)
        return;
    }

    let currentStep = 1;

    // ────────────────────────────────────────────
    // Validation
    // ────────────────────────────────────────────

    const OBJECTIVE_CODES = ['c1','c2','c3','c4','c5','g1','g2','g3','g4','g5','b1','b2','b3'];

    function isStepValid(step) {
        switch (step) {
            case 1: {
                const name = form['cb-company-name'].value.trim();
                const size = form.querySelector('input[name="cb-size"]:checked');
                const industry = form.querySelector('input[name="cb-industry"]:checked');
                return !!(name && size && industry);
            }
            case 2: {
                const audience = form.querySelector('input[name="cb-audience"]:checked');
                const culture = form['cb-culture-word'].value.trim();
                return !!(audience && culture);
            }
            case 3: {
                return !!form.querySelector('input[name="cb-format"]:checked');
            }
            case 4: {
                return Object.keys(CONCERNS_BOOSTS).every(
                    k => form.querySelector('input[name="' + k + '"]:checked')
                );
            }
            case 5: {
                return OBJECTIVE_CODES.every(
                    c => form.querySelector('input[name="cb-obj-' + c + '"]:checked')
                );
            }
            case 6: {
                return form['cb-why'].value.trim().length > 0;
            }
            default:
                return false;
        }
    }

    // ────────────────────────────────────────────
    // Navigation
    // ────────────────────────────────────────────

    function showStep(n) {
        const steps = wizard.querySelectorAll('.cb-step');
        steps.forEach(s => {
            const isActive = Number(s.dataset.step) === n;
            s.classList.toggle('is-active', isActive);
        });
        currentStep = n;
        updateProgress();
        updateNavButtons();
        // Scroll the wizard card into view so users don't lose context on long Likert steps.
        wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateProgress() {
        const percent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
        progressBar.style.width = percent + '%';
        progressLabel.textContent = 'Step ' + currentStep + ' of ' + TOTAL_STEPS;
    }

    function updateNavButtons() {
        backBtn.disabled = currentStep === 1;
        nextBtn.disabled = !isStepValid(currentStep);
        nextBtn.innerHTML = currentStep === TOTAL_STEPS ? 'See your day &rarr;' : 'Next &rarr;';
    }

    function next() {
        if (!isStepValid(currentStep)) return;
        if (currentStep < TOTAL_STEPS) {
            showStep(currentStep + 1);
        } else {
            submit();
        }
    }

    function back() {
        if (currentStep > 1) showStep(currentStep - 1);
    }

    // ────────────────────────────────────────────
    // Read form into a flat state object
    // ────────────────────────────────────────────

    function readState() {
        const get = name => {
            const el = form.querySelector('input[name="' + name + '"]:checked');
            return el ? el.value : null;
        };
        const concerns = {};
        Object.keys(CONCERNS_BOOSTS).forEach(k => {
            concerns[k] = Number(get(k)) || 0;
        });
        const objectives = {};
        OBJECTIVE_CODES.forEach(c => {
            objectives[c.toUpperCase()] = Number(get('cb-obj-' + c)) || 0;
        });
        return {
            companyName: form['cb-company-name'].value.trim(),
            size: get('cb-size'),
            industry: get('cb-industry'),
            audience: get('cb-audience'),
            cultureWord: form['cb-culture-word'].value.trim(),
            format: get('cb-format') || 'in-person',
            concerns,
            objectives,
            why: form['cb-why'].value.trim(),
        };
    }

    // ────────────────────────────────────────────
    // Scoring rubric: pillarWeight × likertScore × concernsBoost
    // ────────────────────────────────────────────

    function buildBoostSet(concerns) {
        const boosted = new Set();
        Object.keys(CONCERNS_BOOSTS).forEach(key => {
            if (concerns[key] >= BOOST_THRESHOLD) {
                CONCERNS_BOOSTS[key].forEach(code => boosted.add(code));
            }
        });
        return boosted;
    }

    function scoreObjectives(state) {
        const weights = PILLAR_WEIGHTS[state.audience] || PILLAR_WEIGHTS.mixed;
        const boosted = buildBoostSet(state.concerns);
        return Object.keys(state.objectives).map(code => {
            const likert = state.objectives[code];
            const pillar = code[0]; // C / G / B
            const pillarWeight = weights[pillar] || 0;
            const boost = boosted.has(code) ? BOOST_MULTIPLIER : 1;
            const score = pillarWeight * likert * boost;
            return { code, pillar, likert, pillarWeight, boost, score };
        });
    }

    function pickTopFive(scored) {
        // Exclude objectives the customer rated as Very unimportant or Unimportant (1–2).
        // If <5 qualify, fill from the remainder (highest weighted score) so the day still has 5 modules.
        const qualifying = scored.filter(s => s.likert >= 3);
        const tiebreak = (a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.code.localeCompare(b.code); // deterministic: B-codes first, then C, then G
        };
        const sortedQualifying = qualifying.slice().sort(tiebreak);
        if (sortedQualifying.length >= 5) return sortedQualifying.slice(0, 5);
        const used = new Set(sortedQualifying.map(s => s.code));
        const fillers = scored
            .filter(s => !used.has(s.code))
            .slice()
            .sort(tiebreak)
            .slice(0, 5 - sortedQualifying.length);
        return sortedQualifying.concat(fillers);
    }

    // ────────────────────────────────────────────
    // Helpers for activity / reflection / commitment / industry / culture selection
    // ────────────────────────────────────────────

    function activityFor(moduleCode, format) {
        const mod = MODULE_LIBRARY[moduleCode];
        if (!mod) return '';
        return mod.activities[format] || mod.activities['in-person'];
    }

    // High-concern → sharper reflection variant.
    // A module's reflection sharpens if any concern that boosts that module is scored 4 (Strongly agree).
    function reflectionFor(moduleCode, state) {
        const mod = MODULE_LIBRARY[moduleCode];
        if (!mod) return '';
        const sharpening = Object.keys(CONCERNS_BOOSTS).some(key =>
            state.concerns[key] >= 4 && CONCERNS_BOOSTS[key].indexOf(moduleCode) !== -1
        );
        return sharpening ? mod.reflections.sharp : mod.reflections.normal;
    }

    function pickCommitment(why) {
        const lower = (why || '').toLowerCase();
        for (const tpl of COMMITMENT_TEMPLATES) {
            if (tpl.keywords.length === 0) return tpl;
            if (tpl.keywords.some(kw => lower.indexOf(kw) !== -1)) return tpl;
        }
        return COMMITMENT_TEMPLATES[COMMITMENT_TEMPLATES.length - 1];
    }

    function classifyCultureRegister(word) {
        const lower = (word || '').toLowerCase();
        for (const key of Object.keys(CULTURE_REGISTERS)) {
            const reg = CULTURE_REGISTERS[key];
            if (reg.keywords.some(kw => lower.indexOf(kw) !== -1)) return reg;
        }
        return null;
    }

    function industryOpener(industry) {
        return INDUSTRY_OPENERS[industry] || INDUSTRY_OPENERS.other;
    }

    // ────────────────────────────────────────────
    // Render output
    // ────────────────────────────────────────────

    // Fixed agenda timeline. Module slots are filled in render order from the top-five list.
    const AGENDA_TIMELINE = [
        { time: '09:00', kind: 'kickoff',  fixed: true,  module: 'Welcome & pulse check', desc: null /* filled per industry */ },
        { time: '09:30', kind: 'overview', moduleSlot: 0 },
        { time: '09:45', kind: 'activity', moduleSlot: 0 },
        { time: '10:15', kind: 'reflect',  moduleSlot: 0 },
        { time: '10:30', kind: 'break',    fixed: true,  module: 'Break',  desc: '15 min' },
        { time: '10:45', kind: 'overview', moduleSlot: 1 },
        { time: '11:00', kind: 'activity', moduleSlot: 1 },
        { time: '11:30', kind: 'reflect',  moduleSlot: 1 },
        { time: '11:45', kind: 'overview', moduleSlot: 2 },
        { time: '12:00', kind: 'activity', moduleSlot: 2 },
        { time: '12:30', kind: 'reflect',  moduleSlot: 2 },
        { time: '12:45', kind: 'break',    fixed: true,  module: 'Lunch',  desc: '45 min' },
        { time: '13:30', kind: 'overview', moduleSlot: 3 },
        { time: '13:45', kind: 'activity', moduleSlot: 3 },
        { time: '14:15', kind: 'reflect',  moduleSlot: 3 },
        { time: '14:30', kind: 'break',    fixed: true,  module: 'Break',  desc: '15 min' },
        { time: '14:45', kind: 'overview', moduleSlot: 4 },
        { time: '15:00', kind: 'activity', moduleSlot: 4 },
        { time: '15:30', kind: 'reflect',  moduleSlot: 4 },
        { time: '15:45', kind: 'kickoff',  fixed: true,  module: null, desc: null /* filled by commitment template */ },
    ];

    const KIND_LABEL = {
        kickoff:  'Kick-off',
        overview: 'Overview',
        activity: 'Activity',
        reflect:  'Reflection',
        break:    'Break',
    };

    function pillarTag(pillar) {
        const name = pillar === 'C' ? 'Capability' : pillar === 'G' ? 'Governance' : 'Behaviour';
        return '<span class="cb-agenda-pillar-tag cb-agenda-pillar-tag--' + pillar + '">' + name + '</span>';
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderAgenda(state, modules) {
        const commitment = pickCommitment(state.why);
        const opener = industryOpener(state.industry);
        const html = AGENDA_TIMELINE.map(slot => {
            const labelClass = 'cb-agenda-type cb-agenda-type--' + slot.kind;
            if (slot.fixed) {
                // Welcome opener — uses the industry pulse-check copy.
                if (slot.kind === 'kickoff' && slot.module === 'Welcome & pulse check') {
                    return row(slot.time, labelClass, slot.kind, 'Welcome &amp; pulse check', '30 min &middot; ' + escapeHtml(opener));
                }
                // Closing commitment — uses the keyword-routed template.
                if (slot.kind === 'kickoff' && slot.module === null) {
                    return row(slot.time, labelClass, 'Wrap-up', escapeHtml(commitment.title), escapeHtml(commitment.desc));
                }
                // Generic break / lunch.
                const desc = slot.desc ? escapeHtml(slot.desc) : '';
                return row(slot.time, labelClass, slot.kind, escapeHtml(slot.module), desc);
            }
            const mod = modules[slot.moduleSlot];
            if (!mod) return '';
            const modLib = MODULE_LIBRARY[mod.code];
            if (slot.kind === 'overview') {
                return row(
                    slot.time,
                    labelClass,
                    'Overview',
                    escapeHtml(modLib.title) + ' ' + pillarTag(modLib.pillar),
                    '15 min &middot; ' + escapeHtml(modLib.overview)
                );
            }
            if (slot.kind === 'activity') {
                return row(
                    slot.time,
                    labelClass,
                    'Activity',
                    null,
                    '30 min &middot; ' + escapeHtml(activityFor(mod.code, state.format))
                );
            }
            if (slot.kind === 'reflect') {
                return row(
                    slot.time,
                    labelClass,
                    'Reflection',
                    null,
                    '15 min &middot; ' + escapeHtml(reflectionFor(mod.code, state))
                );
            }
            return '';
        }).join('');
        agendaRows.innerHTML = html;
    }

    function row(time, labelClass, kind, moduleLine, desc) {
        const label = KIND_LABEL[String(kind).toLowerCase()] || kind;
        const moduleLineHtml = moduleLine
            ? '<span class="cb-agenda-module">' + moduleLine + '</span><br>'
            : '';
        return (
            '<div class="cb-agenda-row">' +
                '<span class="cb-agenda-time">' + time + '</span>' +
                '<div>' +
                    '<span class="' + labelClass + '">' + label + '</span> ' +
                    moduleLineHtml +
                    '<span class="cb-agenda-desc">' + (desc || '') + '</span>' +
                '</div>' +
            '</div>'
        );
    }

    function renderTailored(state) {
        const aud = AUDIENCE_LABELS[state.audience] || 'your team';
        const fmt = FORMAT_LABELS[state.format]  || 'in-person';
        tailored.textContent = 'Tailored for: ' + aud + ' · ' + fmt;
    }

    function renderIntro(state) {
        const reg = classifyCultureRegister(state.cultureWord);
        if (reg) {
            intro.textContent = reg.intro.replace('{culture}', state.cultureWord.toLowerCase());
        } else {
            intro.textContent = DEFAULT_REGISTER_INTRO;
        }
    }

    function renderHeading(state) {
        const company = state.companyName ? state.companyName : 'your team';
        agendaHeading.textContent = 'A day designed for ' + company;
    }

    // ────────────────────────────────────────────
    // Submit / restart
    // ────────────────────────────────────────────

    function submit() {
        const state = readState();
        const scored = scoreObjectives(state);
        const top = pickTopFive(scored);

        renderTailored(state);
        renderIntro(state);
        renderHeading(state);
        renderAgenda(state, top);

        // Hide the wizard card, reveal the output, scroll to it.
        wizard.style.display = 'none';
        output.classList.add('is-revealed');
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function restart() {
        form.reset();
        // Re-check the in-person default after reset (radio default attribute).
        const inPerson = form.querySelector('input[name="cb-format"][value="in-person"]');
        if (inPerson) inPerson.checked = true;
        output.classList.remove('is-revealed');
        wizard.style.display = '';
        showStep(1);
    }

    // ────────────────────────────────────────────
    // Wire up
    // ────────────────────────────────────────────

    form.addEventListener('change', updateNavButtons);
    form.addEventListener('input', updateNavButtons);
    backBtn.addEventListener('click', back);
    nextBtn.addEventListener('click', next);
    restartBtn.addEventListener('click', restart);

    // Allow Enter on a text/textarea field to advance, except inside the textarea on step 6
    // (where Enter inserts a newline).
    form.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        if (e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (isStepValid(currentStep)) next();
    });

    showStep(1);
})();
