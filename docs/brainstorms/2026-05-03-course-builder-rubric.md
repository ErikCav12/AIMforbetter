---
date: 2026-05-03
topic: course-builder-rubric
---

# Course Builder — Scoring Rubric (preserved from internal mockup)

This doc preserves the design-rationale and scoring rubric that lived in the bottom of `pages/course-builder.html` while the wizard was an internal mockup. As of 2026-05-03 the wizard is being promoted to a client-facing tool and that block is being removed from the public page. The maths is preserved here.

## Two ways AI contributes to the output

- **Deterministic** — calculated from a scoring rubric we maintain. Same inputs always produce the same output. Used for module selection, pillar mix, activity templates, closing commitment, industry pulse-check.
- **Qualitative** — synthesised by an LLM against our modules knowledge base and the customer's own answers. Used for sector-specific case studies and culture-tuned phrasing in the production tool. In the mockup these are deterministic stand-ins.

## 01 — Who (Qualitative)

Company name + size + industry feed deep research over public sources (company website, LinkedIn, press, sector reports). The production tool pulls sector-specific risks, recent AI incidents in the industry, and example workflows where AI typically lands first — then weaves those examples into the demos, discussion prompts and case studies. A 200-person fintech gets different case studies than a 5,000-person manufacturer; both look hand-built. In the mockup the industry choice swaps the morning pulse-check opener using a small library of stand-in copies.

## 02 — Target audience (Deterministic)

Each audience maps to a default pillar weight via a fixed rubric:

- **Early-career / Gen Z:** 70% Capability, 20% Behaviour, 10% Governance
- **Managers:** 20% Capability, 70% Governance, 10% Behaviour
- **Mixed:** 40% Capability, 35% Governance, 25% Behaviour
- **Culture-wide:** 30% Capability, 30% Governance, 40% Behaviour

The one-word culture descriptor is bucketed into one of four tone registers (cautious, fast-moving, collaborative, formal) which tweaks the intro paragraph phrasing. In the production tool this is LLM-driven against the customer's own language.

## 03 — Where (Deterministic)

Delivery format swaps the activity templates. In-person uses stand-up/sit-down voting, physical card drops and live paired exercises. Remote uses breakout rooms, shared docs and anonymous polls. Hybrid picks the in-person activity for co-located participants and provides a parallel remote variant.

## 04 — Concerns (Deterministic)

Each concern boosts a small set of objectives by 30% in the final scoring. Boost rules:

- **Trust and accuracy** → C1, C2
- **Data security and confidentiality** → C3, G4
- **Job displacement and career impact** → B1, B2
- **Regulatory and compliance risk** → G3, G4, G5
- **Erosion of critical thinking and judgement** → B3, C2

Boost only applies if the concern was scored 3 (Agree) or 4 (Strongly agree).

## 05 — Objectives (Deterministic)

Final score per objective:

```
finalScore = pillarWeight(audience, pillar) × likertScore × concernsBoost
```

Top 5 by final score become the day's modules. Objectives scored 1–2 (Very unimportant / Unimportant) are excluded even if their weighted score is high. Tie-break is alphabetical objective code (B-codes first, then C, then G).

## 06 — Why (Deterministic)

The free-text outcome is keyword-matched against six closing-commitment templates. Phrases like "spotting AI nonsense" route to one template, "managing my juniors" to another. In the production tool the LLM picks the template and tunes the wording to the customer's exact phrasing.

## On the agenda output

Every day opens with a fixed **Welcome & pulse check** and closes with a fixed **Commitments & close**. Modules in between follow a consistent **15-minute overview → 30-minute activity → 15-minute reflection** cadence. This structural consistency is deliberate: it makes the day feel designed rather than improvised, and it keeps the facilitator's time budget predictable.

## Where this rubric lives in code

- `js/course-builder.js` — `PILLAR_WEIGHTS`, `CONCERNS_BOOSTS`, `BOOST_MULTIPLIER`, `BOOST_THRESHOLD`, `MODULE_LIBRARY`, `COMMITMENT_TEMPLATES`, `CULTURE_REGISTERS`, `INDUSTRY_OPENERS`, `pickTopFive()`, `scoreObjectives()`.
- This doc is the human-readable companion for sales conversations and onboarding new team members.
