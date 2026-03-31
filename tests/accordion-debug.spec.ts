import { test, expect } from '@playwright/test';
import path from 'path';
const BASE = 'file://' + path.resolve(__dirname, '..');

test('modules accordion expands on click', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto(BASE + '/pages/modules.html');
  await page.waitForLoadState('networkidle');

  const trigger = page.locator('.accordion-trigger').first();
  await trigger.scrollIntoViewIfNeeded();

  const content = page.locator('.accordion-content').first();
  const heightBefore = await content.evaluate(el => el.style.maxHeight);
  console.log('Before click maxHeight:', heightBefore);

  await trigger.click();
  await page.waitForTimeout(600);

  const heightAfter = await content.evaluate(el => el.style.maxHeight);
  const expanded = await content.evaluate(el => el.parentElement?.classList.contains('expanded'));
  console.log('After click maxHeight:', heightAfter, 'expanded:', expanded);

  await page.screenshot({ path: 'test-screenshots/accordion-debug.png', fullPage: true });

  expect(expanded).toBe(true);
  expect(heightAfter).not.toBe('0px');
});
