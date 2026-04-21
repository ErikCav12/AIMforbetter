---
date: 2026-04-21
topic: homepage-polish-round-2
---

# Homepage polish — round 2

## What We're Building

A second polish pass on the homepage, responding to Erik's Apr 21 voice-note feedback. Five small-to-medium changes: section CTAs that route visitors deeper into the site, real founder photos replacing the "E"/"S" placeholder initials, removed stray italics, tightened final-CTA copy, and a LinkedIn logo in the footer next to the email. Course builder tool from the same voice note is explicitly deferred to its own brainstorm.

Net result: every homepage section that mentions evidence, solutions or founders now links to the deep page at the right moment; the founder row stops reading as placeholder; and the footer closes with a recognisable social icon.

## Why This Approach

The transcript's core observation was that the homepage is a well-argued narrative but a dead end — readers finish reading and have nowhere to click through to the supporting detail pages. Pattern (b), one CTA per thematic cluster rather than one per section, solves that without cluttering the scroll rhythm: one "See the evidence" after the evidence trio (Reality + Risks + Gen Z Concern), one "solutions / syllabus / modules" button row after What We Do, and the existing "Why we Care" below Who We Are.

Founder photos shift the page from "placeholder site with fake initials" to "real people, real founders" — the single biggest trust signal for a pre-launch consultancy. Circle crops with plain treatment match the classic two-headshots-side-by-side pattern readers know. The image-quality gap (Molly's 599×649 vs Lyall's 1053×1024) is handled by capping display size at ~200px, safe for both.

## Key Decisions

- **Section CTAs — pattern (b), one per theme:**
  - After "The Concern for Gen Z" section (the last of the three evidence-flavoured sections): single **See the evidence →** button → `pages/evidence.html`.
  - After "What We Do": three-button row — **See the solutions →** / **See the syllabus →** / **See the modules →** linking to `solutions.html` / `syllabus.html` / `modules.html`.
  - After "Who We Are": **Why we Care →** button already exists → `pages/backstory.html`. No change.
- **Founder photos:**
  - Shape: circle.
  - Treatment: plain (no ring, no gradient). Cap rendered size at ~200px so Molly's smaller source stays sharp.
  - Background harmonisation: run background removal on both `Lyall.png` and `molly.png` so the dark/light backdrops don't read as mismatched. Fall back to a subtle navy ring if removal quality is poor.
  - Replace the placeholder initials divs in the existing `.founder` markup with `<img>` tags pointing at the cleaned assets.
  - Backstory page: no change (no founder photos there to remove).
- **Risks-section italics:** remove. Bring the body text in line with the other section bodies. Earlier Apr 15 decision to italicise is superseded by this Apr 21 review.
- **"Join Our Mission" copy:** replace the current four-line "rolling out our training programmes" paragraph with a two-line version aligned to the fine-print / button — e.g. *"Training programmes are open now. Register your interest and we'll be in touch."*
- **LinkedIn in footer:** add an inline LinkedIn SVG icon next to the existing `training@aimforbetter.co.uk` text (same right-hand footer slot), linking to `https://www.linkedin.com/company/aimforbetter/`. Icon sized to match the email's line height; navy or `--text-light` stroke colour.

## Open Questions

- Background removal quality — if `rembg` output has visible edge halos or misses hair strands on either photo, we ship with the coloured-ring fallback instead.
- The three-button row under What We Do needs testing at mobile widths; if the buttons don't fit on one line, stack vertically.

## Next Steps

→ Implement inline. All five items are scoped, independent, low-risk. No `/workflows:plan` needed.
