import { test } from '@playwright/test';
import path from 'path';
const BASE = 'file://' + path.resolve(__dirname, '..');

test('X button debug', async ({ page }) => {
  await page.goto(BASE + '/pages/solutions.html');
  await page.locator('#burger').click();
  await page.waitForTimeout(500);
  
  const btn = page.locator('#overlay-close');
  const box = await btn.boundingBox();
  console.log('Box:', JSON.stringify(box));
  
  const styles = await btn.evaluate(el => {
    const cs = window.getComputedStyle(el);
    return {
      position: cs.position,
      top: cs.top,
      right: cs.right,
      fontSize: cs.fontSize,
      parentPosition: window.getComputedStyle(el.parentElement!).position
    };
  });
  console.log('Styles:', JSON.stringify(styles));
  await page.screenshot({ path: 'test-screenshots/xbutton-debug.png' });
});
