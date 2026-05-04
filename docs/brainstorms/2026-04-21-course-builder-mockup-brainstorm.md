---
date: 2026-04-21
topic: course-builder-mockup
---

# Course Builder — static mockup

## What We're Building

A single self-contained HTML mockup of a customer-facing "course builder" intake form that AIM's sales/delivery team will use internally to iterate on question design, flow, and the example agenda logic. Five question clusters (Who / Target Audience / Where / What / Why), a mocked-up example day-agenda output, and a notes section explaining the rationale behind each question and where AI sits in the calculation.

Lives as a standalone page, not linked from the public nav — clearly a mockup artefact for Erik, Molly and Lyall to critique together before any real tool gets built.

## Why This Approach

An internal design spec (option A in the brainstorm) is the fastest path to a concrete artefact that can be reacted to. A sales-grade polish pass (option B) or a production prototype (option C) would both front-load work that'll get thrown away once the three of them agree on the question set and agenda shape.

Lightly reactive over pure-visual so the example agenda swaps based on audience/objective inputs — enough signal for the group to judge *"does the tool pattern work?"*, without committing to any real backend logic. Likert shows a representative 6 objectives (2 Capability + 2 Governance + 2 Behaviour) rather than all 13, with a flagged note that the real tool displays the full set.

## Key Decisions

- **File location:** `pages/course-builder.html` — picks up the existing AIM stylesheet + fonts + nav + footer so it feels like a real page under the brand. Deliberately not added to the menu overlay.
- **Purpose:** internal design spec, not a polished sales asset.
- **Interactivity:** lightly reactive with a small JS snippet (≤60 lines) that changes which modules appear in the example agenda based on target audience and top-rated objectives. Form inputs are real HTML; nothing submits anywhere.
- **"Static" means:** single self-contained file, no backend. JS allowed.
- **Editorial licence:** I populate reasonable defaults for company-size buckets, industry list, audience categories, the 5 AI concerns, and the Likert objectives list without pre-approval.
- **Likert depth:** 2 + 2 + 2 representative objectives, flagged in the notes as a shortening for the mockup only.
- **Example agenda pattern:** opens with a fixed morning kick-off, then modular slots of *15 min overview → 30 min activity → 15 min reflection*. Day ends with a fixed closing/commitments slot.
- **Notes section at the bottom:** rationale per cluster + where AI folds in (deep research for WHO, deterministic scoring for WHAT, RAG/qualitative synthesis for WHY and culture word).

## Open Questions

- Whether the 5 AI concerns I pick land right — easy to swap once Erik sees the draft.
- Whether "Mixed" as a target-audience category is useful, or whether the form should force a primary target.
- How the delivery format choice (in-person / hybrid / remote) should influence the agenda template in the reactive layer — mocked for in-person initially.

## Next Steps

→ Implement inline. Ship a first draft; iterate based on Erik, Molly and Lyall's reaction.
