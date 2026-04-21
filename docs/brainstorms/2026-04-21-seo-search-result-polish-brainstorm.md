---
date: 2026-04-21
topic: seo-search-result-polish
---

# SEO / Search result polish

## What We're Building

A lean SEO pass on the public site so Google and Bing show the correct logo, the right description snippet, and rank the homepage above inner pages when the brand name is searched. No new brand artwork — reuse the existing `assets/favicon.png` and meta descriptions already on each page. The goal is to fix the signals, not redesign.

Four files added (`og-tags` block injected into every page head, `sitemap.xml`, `robots.txt`, JSON-LD Organization schema embedded in the homepage). Nothing removed.

## Why This Approach

Meeting feedback from Apr 21 flagged three issues: Google shows the old favicon and a generic description, Bing shows no favicon and ranks `solutions.html` above the homepage, and the mobile Chrome dark tab icon looks off. Rather than build new artwork, the diagnosis narrowed to missing metadata — current favicon is already white-backed and should render fine after a cache clear, and the search-result problems are all solvable via tags the site doesn't currently have.

Simpler asset reuse (favicon as `og:image`, existing `<meta>` description as `og:description`) was chosen over bespoke social cards because the marketing-design bandwidth is elsewhere (Molly focused on the pitch deck). Swapping to a proper 1200×630 card later is a single-file change.

## Key Decisions

- **Favicon: no change for now.** Current `assets/favicon.png` is near-white-backed (sampled RGBA 249,250,250,255) and should render correctly on any tab colour. Dark-mode issue to be verified in a real browser post-ship, not pre-empted with new assets.
- **`og:image` = existing `assets/favicon.png`.** Accept the near-square aspect ratio; social platforms may show it as a thumbnail rather than a hero card. Revisit if previews look poor.
- **Canonical domain: `https://aimforbetter.co.uk`** (apex, no www). Verified via `curl -I` — apex returns 200 from Cloudflare, www doesn't resolve. Every page's canonical tag points to its own absolute URL under this apex.
- **Per-page OG descriptions: reuse `<meta name="description">` verbatim.** Zero extra content work; descriptions already agreed in the Apr 15 review.
- **Twitter card type: `summary`** (small square thumbnail). Matches the near-square favicon; `summary_large_image` would letterbox it.
- **Sitemap priorities:** `/` = 1.0, `/pages/contact.html` = 0.9, all other content pages = 0.8, `/pages/privacy.html` = 0.3.
- **JSON-LD Organization schema on homepage only.** Includes name, URL, logo, description. `sameAs` omitted for now; LinkedIn URL added later when the page is public.
- **Submission to Google Search Console + Bing Webmaster Tools:** Erik handles post-merge (needs domain verification via DNS TXT record on Cloudflare).

## Open Questions

- Actual status of the mobile Chrome dark tab favicon after a real cache clear — verify post-deploy before deciding whether new favicon assets are needed.
- Whether to revisit `og:image` with a proper 1200×630 social card after Molly has pitch-deck bandwidth back.

## Next Steps

→ Implement inline: add OG + Twitter tags + canonical to every page, create `sitemap.xml`, `robots.txt`, and JSON-LD on homepage. No `/workflows:plan` needed — all decisions locked and files are small, scoped additions.
