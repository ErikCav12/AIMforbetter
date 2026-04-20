import { test } from '@playwright/test';
import path from 'path';

const BASE = 'file://' + path.resolve(__dirname, '..');

test('homepage footer geometry at 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/index.html');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  const geo = await page.$eval('footer', el => {
    const r = el.getBoundingClientRect();
    const kids = Array.from(el.children).map(c => {
      const cr = (c as HTMLElement).getBoundingClientRect();
      return { tag: c.tagName, class: (c as HTMLElement).className, left: Math.round(cr.left), right: Math.round(cr.right), width: Math.round(cr.width) };
    });
    return {
      footerLeft: Math.round(r.left),
      footerRight: Math.round(r.right),
      footerWidth: Math.round(r.width),
      paddingLeft: getComputedStyle(el).paddingLeft,
      paddingRight: getComputedStyle(el).paddingRight,
      children: kids,
    };
  });
  console.log(JSON.stringify(geo, null, 2));

  await page.screenshot({
    path: 'test-screenshots/footer-1440.png',
    clip: { x: 0, y: 800, width: 1440, height: 100 },
  });
});
