import { test, expect } from '@playwright/test';
import path from 'path';

const BASE = 'file://' + path.resolve(__dirname, '..');

const PAGES = [
  { name: 'home',     url: '/index.html' },
  { name: 'evidence', url: '/pages/evidence.html' },
  { name: 'solutions',url: '/pages/solutions.html' },
  { name: 'syllabus', url: '/pages/syllabus.html' },
  { name: 'modules',  url: '/pages/modules.html' },
  { name: 'backstory',url: '/pages/backstory.html' },
  { name: 'contact',  url: '/pages/contact.html' },
  { name: 'privacy',  url: '/pages/privacy.html' },
];

const VIEWPORTS = [
  { label: 'iphone-se',  w: 375, h: 667 },
  { label: 'iphone-14',  w: 390, h: 844 },
  { label: 'tablet',     w: 768, h: 1024 },
];

for (const vp of VIEWPORTS) {
  for (const p of PAGES) {
    test(`${vp.label} · ${p.name} — screenshot + horizontal overflow check`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto(BASE + p.url);
      await page.waitForLoadState('networkidle');
      // Force all .reveal elements visible — IntersectionObserver doesn't
      // fire reliably under rapid programmatic scroll, and for a visual
      // audit we want the full page rendered as users see it after scrolling.
      await page.evaluate(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      });
      await page.waitForTimeout(300);

      // Horizontal overflow check — body/html should not be wider than viewport
      const overflow = await page.evaluate((vw) => {
        const docW  = document.documentElement.scrollWidth;
        const bodyW = document.body.scrollWidth;
        const problemEls: { tag: string; id: string; cls: string; w: number; left: number }[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const el = node as HTMLElement;
          const r = el.getBoundingClientRect();
          if (r.width > vw + 2 || r.right > vw + 2) {
            if (!problemEls.find(p => p.tag === el.tagName && p.w === Math.round(r.width))) {
              problemEls.push({
                tag: el.tagName,
                id: el.id,
                cls: el.className?.toString?.().slice(0, 60) ?? '',
                w: Math.round(r.width),
                left: Math.round(r.left),
              });
            }
            if (problemEls.length >= 8) break;
          }
        }
        return { docW, bodyW, vw, problemEls };
      }, vp.w);

      if (overflow.docW > vp.w + 2 || overflow.bodyW > vp.w + 2 || overflow.problemEls.length) {
        console.log(`\n[${vp.label} ${p.name}] overflow: docW=${overflow.docW} bodyW=${overflow.bodyW} vw=${vp.w}`);
        overflow.problemEls.forEach(e => console.log(`  ${e.tag}${e.id ? '#' + e.id : ''}.${e.cls} w=${e.w} left=${e.left}`));
      }

      await page.screenshot({
        path: `test-screenshots/mobile/${vp.label}-${p.name}.png`,
        fullPage: true,
      });

      expect(overflow.docW, `doc overflows viewport (doc=${overflow.docW} vw=${vp.w})`).toBeLessThanOrEqual(vp.w + 2);
    });
  }
}
