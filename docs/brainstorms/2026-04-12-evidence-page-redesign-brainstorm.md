---
date: 2026-04-12
topic: evidence-page-redesign
---

# Evidence Page Redesign

## What We're Building

A complete restructure of `pages/evidence.html` from a "positive vs negative" pair-based layout into a **six-section narrative arc** that uses borrowed authority (PwC, KPMG, Deloitte, EY, LSE) to walk the reader from "AI is everywhere" through "and it's broken in ways nobody talks about" to "and the workforce is asking for help" — landing on a single CTA into Solutions & Methods.

The data comes from slides 5–10 of `Copy of AIM_Stats_v2.pdf.pptx.pdf`. The page becomes an argument, not a stats dashboard.

## Why This Approach

The current page is six pairs of stats with a "vs" divider, organised by topic. It reads as data display, not data storytelling. McKinsey-style consulting principles applied:

- **Action titles over topic titles** — every section H2 states the conclusion before showing the data
- **Hero stat per section** — one number per section gets visual emphasis to guide the eye
- **Strategic colour** — red is reserved for the single most damning stat in each section, not used as a section background, so it retains punch
- **Narrative arc** — six sections in deliberate order create rising tension that primes the reader for the CTA
- **Closing on action, not summary** — page ends with "see our solutions" not "here's another stat"

## Key Decisions

### Structure: 6 sections, narrative-ordered

| # | Eyebrow (topic) | H2 (action title) | Slide | Tone |
|---|---|---|---|---|
| 01 | AI USAGE IN THE WORKPLACE | **AI is already everywhere — and Gen Z is using it 4× more than anyone else** | 5 | Setup (blue/info) |
| 02 | THE ERROR RATE IN GENERATIVE AI | **For complex tasks, almost half of AI's answers are wrong** | 6 | Twist (red hero) |
| 03 | THE MISTAKES BEING MADE | **Two thirds don't verify AI's work. Most know it's already hurt them.** | 7 | Complication |
| 04 | THE LACK OF VISIBILITY ON AI USE | **AI use is invisible — especially among the workers most likely to use it** | 8 | Tension |
| 05 | THE SENSITIVE COMPANY INFORMATION LEAKS | **Confidential data is leaving the building, one prompt at a time** | 9 | Stakes |
| 06 | THE NEED AND DEMAND FOR AI MANAGEMENT TRAINING | **The workers most exposed are the ones asking for help** | 10 | Demand (gold/opportunity, not red) |

### Section 1: 3 rows (faithful to user brief)

- **Row 1**: "AI adoption is already high across the general working population" | 70% | ~1/3 | *Source: LSE 2025*
- **Row 2**: "AI adoption rates are growing quickly, and will continue to grow" | Doubled (in past 2 years) | 77% (employers reskilling by 2030) | *Sources: Gallup 2025 · WEF 2025*
- **Row 3**: "There is a strong bias for AI utilisation amongst Gen Z" | 4× | 54% vs 14% | *Sources: Wiingy 2025 · PwC 2025*

All blue. Hero stat: **4×** (Gen Z adoption multiplier — sets up the Section 4 callback).

### Section 2: 1 row, hero stat = 30–48%

- "AI models often generate incorrect or misleading information" | 9% (general) | **30–48%** (complex/reasoning) | *Source: AI Hallucinations Index 2025*

Hero stat is **30–48%** — the most damning single number on the page. Renders ~1.8× larger than the sibling 9%. This is the moment the reader realises AI isn't a polished tool.

### Section 3: 1 row, two stats compounded into one sentence

- "Without proper verification and due diligence, AI-generated errors are slipping through the net" | **66%** rely without verification → **56%** acknowledge mistakes have made it through | *Source: KPMG 2025*

Both numbers visible, but rendered as a single connected statement (the 56% only matters because the 66% set it up). Hero stat: **66%**.

### Section 4: 1 row with text-style first stat

- "AI use is also happening without clear visibility" | "**Pronounced among Gen Z professionals**" (text-style red bubble) | **Up to 62%** | *Source: Tech Monitor 2025 (verify publisher)*

Explicit callback to Section 1's 4× Gen Z stat: lead-in copy reads "You saw they use AI four times more. Now see what they don't tell you." Hero stat: **62%**.

### Section 5: 1 row, sources merged

- "Many individuals are inputting sensitive company information into publicly available AI systems" | 68% (personal accounts) | **57%** (input sensitive data) | *Source: Tech Monitor 2025*

Both stats from the same source. Hero stat: **57%**.

### Section 6: 1 row, NON-RED colour (gold or warm/blue)

- "The desire and requirement for structured training in responsible AI use is becoming increasingly clear" | "**Lowest scorers (41% success rate)**" at critical evaluation | **59%** of Gen Z want generative AI skills for career advancement | *Sources: EY 2024 · Deloitte 2025*

Tonal shift: this is where the page pivots from "problem" to "opportunity." Background and stat colour shift to gold/amber (or back to blue) to signal the change without saying it. Hero stat: **41%**.

### Visual treatment

- **Light blue** (`var(--blue-subtle)`) background, navy text: information stats (Section 1, the non-hero stats in 2–5)
- **Red** (`#fef5f5` background, `#c0392b` text): hero stats in Sections 2–5 only (one per section, ~5 red stats total across the page)
- **Gold/warm** (TBD exact value, e.g. `#faf3e8` background with `#8c6d2f` text): all of Section 6
- All stats keep the existing counter spinner animation
- Sources rendered as 11px italic grey text below each row, right-aligned, publication name hyperlinked (not the year)

### Page intro rewrite

Replace current intro with:

> **The case for AI training isn't an opinion. Six independent studies — from PwC, KPMG, Deloitte, EY, the LSE and others — show the same thing: AI adoption has outrun the skills to use it safely. Here's what they found.**

Frames the page as evidence (not opinion), establishes borrowed authority before showing any stat, signals structure ("here's what they found").

### Closing — replace the "1 in 3" punchline

Drop the existing navy `.evidence-punchline` block entirely. Replace with a single-sentence CTA:

> **The data is unambiguous. The skills aren't optional. Here's how AIM closes the gap →**
>
> [Button: See our solutions]

One line, one button, page ends. Reader moves into the funnel.

### Source citations (shortened)

| PDF citation | Display |
|---|---|
| Bridging the Generational AI Gap (LSE, 2025) | LSE 2025 |
| Gallup, 2025 | Gallup 2025 |
| AI Adoption to Transform Workforce... | WEF 2025 *(verify)* |
| Wiingy Research | Wiingy 2025 |
| PwC's Global Workforce Hopes and Fears 2025 | PwC 2025 |
| The Reality of AI Hallucinations 2025 | AI Hallucinations Index 2025 |
| KPMG Global Study, 2025 | KPMG 2025 |
| Employees Left Behind in Workplace AI Boom | Tech Monitor 2025 *(verify)* |
| Enterprise Employees Are Entering Sensitive Data... | Tech Monitor 2025 |
| Crucial AI literacy training needs (EY, 2024) | EY 2024 |
| Gen Zs and Millennials at Work (Deloitte, 2025) | Deloitte 2025 |

## Open Questions

- **Verify two source publishers from the URLs in the PDF**: "AI Adoption to Transform Workforce" (probably WEF — confirm) and "Employees Left Behind in Workplace AI Boom" (probably Tech Monitor — confirm).
- **Section 6 colour: gold vs blue** — gold reads as "opportunity/warmth," blue reads as "calm/factual." Pick at implementation time and eyeball in Chrome.
- **Does the existing scroll-reveal `slide-in-left/right` animation get reused or dropped?** Suggest dropping — they were for the "vs" pair layout. New rows can use the standard `.reveal` fade-up.
- **Is the existing `.contrast-pair` / `.stat-card--positive/negative` CSS deleted entirely, or kept as legacy?** Suggest delete — nothing else uses those classes.

## Next Steps

→ `/plan` for implementation details (markup restructure, new CSS classes, source URL verification, bundle regen, testing in Chrome)
