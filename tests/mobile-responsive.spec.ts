import { test, expect, devices } from '@playwright/test';
import path from 'path';

const BASE = 'file://' + path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'test-screenshots');

const pages = [
  { name: 'homepage', url: '/index.html' },
  { name: 'backstory', url: '/pages/backstory.html' },
  { name: 'evidence', url: '/pages/evidence.html' },
  { name: 'solutions', url: '/pages/solutions.html' },
  { name: 'contact', url: '/pages/contact.html' },
];

const viewports = [
  { name: 'iphone12', device: devices['iPhone 12'] },
  { name: 'ipad', device: devices['iPad (gen 7)'] },
];

// Screenshot every page at each viewport
for (const vp of viewports) {
  for (const pg of pages) {
    test(`${pg.name} renders on ${vp.name}`, async ({ browser }) => {
      const context = await browser.newContext({ ...vp.device });
      const page = await context.newPage();
      await page.goto(BASE + pg.url);
      await page.waitForLoadState('networkidle');

      // Check no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 2); // 2px tolerance

      // Full page screenshot
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/${pg.name}-${vp.name}.png`,
        fullPage: true,
      });

      await context.close();
    });
  }
}

// Burger menu opens and closes on mobile
test('burger menu opens and closes on iPhone', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();
  await page.goto(BASE + '/index.html');
  await page.waitForLoadState('networkidle');

  const burger = page.locator('#burger');
  const overlay = page.locator('#menu-overlay');

  // Menu should be hidden initially
  await expect(overlay).not.toBeVisible();

  // Open menu
  await burger.click();
  await expect(overlay).toBeVisible();

  // All nav links visible
  await expect(page.locator('.menu-overlay nav a')).toHaveCount(7);

  // Screenshot open menu
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/burger-menu-open-iphone12.png`,
  });

  // Close on ESC
  await page.keyboard.press('Escape');
  await expect(overlay).not.toBeVisible();

  await context.close();
});

// Burger menu navigation works
test('burger menu links navigate to pages', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();
  await page.goto(BASE + '/index.html');

  // Open menu and click backstory
  await page.locator('#burger').click();
  await page.locator('.menu-overlay nav a:has-text("Our Backstory")').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Backstory/);

  await context.close();
});

// Email form is usable on mobile
test('email form is usable on iPhone', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();
  await page.goto(BASE + '/index.html');

  // Scroll to hero form
  const emailInput = page.locator('#hero-email');
  await emailInput.scrollIntoViewIfNeeded();
  await expect(emailInput).toBeVisible();

  // Check input is full-width on mobile (form stacks vertically)
  const inputBox = await emailInput.boundingBox();
  expect(inputBox!.width).toBeGreaterThan(200);

  // Screenshot the form area
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/hero-form-iphone12.png`,
  });

  await context.close();
});

// Evidence page stats stack vertically on mobile
test('evidence stat rows stack vertically on iPhone', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();
  await page.goto(BASE + '/pages/evidence.html');
  await page.waitForLoadState('networkidle');

  // Get first ev-row's two stat cards
  const firstRow = page.locator('.ev-row').first();
  const firstStat = firstRow.locator('.ev-stat').first();
  const secondStat = firstRow.locator('.ev-stat').last();

  const firstBox = await firstStat.boundingBox();
  const secondBox = await secondStat.boundingBox();

  // On mobile (560px breakpoint), the two stats should stack vertically
  expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 10);

  await page.screenshot({
    path: `${SCREENSHOT_DIR}/evidence-stats-iphone12.png`,
    fullPage: true,
  });

  await context.close();
});

// Contact form is usable on mobile
test('contact form fields are accessible on iPhone', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();
  await page.goto(BASE + '/pages/contact.html');
  await page.waitForLoadState('networkidle');

  // Check all form fields are visible and usable
  await expect(page.locator('#name')).toBeVisible();
  await expect(page.locator('#organisation')).toBeVisible();
  await expect(page.locator('#interest')).toBeVisible();
  await expect(page.locator('#message')).toBeVisible();

  // Check fields aren't overflowing viewport
  const nameBox = await page.locator('#name').boundingBox();
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(nameBox!.x + nameBox!.width).toBeLessThanOrEqual(viewportWidth + 2);

  await page.screenshot({
    path: `${SCREENSHOT_DIR}/contact-form-iphone12.png`,
    fullPage: true,
  });

  await context.close();
});

// Solutions page accordions work on mobile
test('solutions accordions expand on iPhone', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 12'] });
  const page = await context.newPage();
  await page.goto(BASE + '/pages/solutions.html');
  await page.waitForLoadState('networkidle');

  // Click first pillar "For your graduates"
  const firstPillar = page.locator('.pillar-trigger').first();
  await firstPillar.scrollIntoViewIfNeeded();
  await firstPillar.click();

  // Content should be visible
  const content = page.locator('.pillar-content').first();
  await expect(content).not.toHaveCSS('max-height', '0px');

  await page.screenshot({
    path: `${SCREENSHOT_DIR}/solutions-accordion-iphone12.png`,
    fullPage: true,
  });

  await context.close();
});
