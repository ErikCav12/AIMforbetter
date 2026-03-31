import { test, expect } from '@playwright/test';
import path from 'path';
const BASE = 'file://' + path.resolve(__dirname, '..');

test('solutions page accordions work', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await page.goto(BASE + '/pages/solutions.html');
  await page.waitForLoadState('networkidle');

  // Click "For your graduates" pillar
  const pillar = page.locator('.pillar-trigger').first();
  await pillar.scrollIntoViewIfNeeded();
  await pillar.click();
  await page.waitForTimeout(600);
  
  const pillarExpanded = await page.locator('.pillar-item').first().evaluate(el => el.classList.contains('expanded'));
  console.log('Pillar expanded:', pillarExpanded);
  
  const pillarHeight = await page.locator('.pillar-content').first().evaluate(el => el.style.maxHeight);
  console.log('Pillar content maxHeight:', pillarHeight);

  // Now click C.1 objective
  const objective = page.locator('.objective-trigger').first();
  const objVisible = await objective.isVisible();
  console.log('C.1 trigger visible:', objVisible);
  
  if (objVisible) {
    await objective.click();
    await page.waitForTimeout(600);
    
    const objExpanded = await page.locator('.objective-item').first().evaluate(el => el.classList.contains('expanded'));
    console.log('Objective expanded:', objExpanded);
    
    const objHeight = await page.locator('.objective-content').first().evaluate(el => el.style.maxHeight);
    console.log('Objective content maxHeight:', objHeight);
    
    const descText = await page.locator('.objective-inner p').first().textContent();
    console.log('Description text:', descText?.substring(0, 80));
  }

  await page.screenshot({ path: 'test-screenshots/solutions-accordion.png', fullPage: true });
});
