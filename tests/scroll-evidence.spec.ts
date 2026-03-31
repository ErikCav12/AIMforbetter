import { test, devices } from '@playwright/test';
import path from 'path';
const BASE = 'file://' + path.resolve(__dirname, '..');

test('evidence page after scrolling', async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices['iPad (gen 7)'] });
  const page = await ctx.newPage();
  await page.goto(BASE + '/pages/evidence.html');
  await page.waitForLoadState('networkidle');
  // Scroll slowly to trigger all IntersectionObserver animations
  await page.evaluate(async () => {
    for (let i = 0; i < document.body.scrollHeight; i += 200) {
      window.scrollTo(0, i);
      await new Promise(r => setTimeout(r, 150));
    }
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-screenshots/evidence-scrolled-ipad.png', fullPage: true });
  await ctx.close();
});
