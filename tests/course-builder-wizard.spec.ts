import { test, expect } from '@playwright/test';

const URL = 'http://127.0.0.1:8765/pages/course-builder.html';

async function fillStep1(page: any) {
    await page.fill('#cb-company-name', 'Acme Consulting');
    await page.click('label.cb-tile:has(input[name="cb-size"][value="251-1000"])');
    await page.click('label.cb-tile:has(input[name="cb-industry"][value="finance"])');
}

async function fillStep2(page: any, audience: string, cultureWord: string) {
    await page.click(`label.cb-tile:has(input[name="cb-audience"][value="${audience}"])`);
    // Auto-advance fires after the click — undo it for tests that fill culture-word too.
    // Type the culture word; if auto-advanced past step 2, click Back first.
    await page.waitForTimeout(400);
    const onStep3 = await page.locator('.cb-step[data-step="3"].is-active').count();
    if (onStep3) await page.click('#cb-back');
    await page.fill('#cb-culture-word', cultureWord);
}

async function selectLikert(page: any, name: string, value: string) {
    await page.click(`label.cb-likert-option:has(input[name="${name}"][value="${value}"])`);
}

test.describe('Course Builder wizard — production', () => {
    test('production framing is in place (no mockup banner, no notes block)', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('.cb-mock-flag')).toHaveCount(0);
        await expect(page.locator('.cb-notes')).toHaveCount(0);
        // noindex meta tag should be gone
        const robots = page.locator('meta[name="robots"][content*="noindex"]');
        await expect(robots).toHaveCount(0);
        // Page title is the production one
        await expect(page).toHaveTitle('Design your training course | AIM');
    });

    test('walks through 6 steps and reveals an agenda — managers persona', async ({ page }) => {
        await page.goto(URL);

        // Step 1
        await expect(page.locator('#cb-progress-label')).toHaveText('Step 1 of 6');
        await expect(page.locator('#cb-next')).toBeDisabled();
        await fillStep1(page);
        await expect(page.locator('#cb-next')).toBeEnabled();
        await page.click('#cb-next');

        // Step 2
        await expect(page.locator('#cb-progress-label')).toHaveText('Step 2 of 6');
        await fillStep2(page, 'managers', 'cautious');
        await page.click('#cb-next');

        // Step 3 — auto-advance on tile click for in-person (already checked default)
        await expect(page.locator('#cb-progress-label')).toHaveText('Step 3 of 6');
        await page.click('label.cb-tile:has(input[name="cb-format"][value="in-person"])');
        // Wait for auto-advance
        await expect(page.locator('#cb-progress-label')).toHaveText('Step 4 of 6');

        // Step 4 — concerns
        await selectLikert(page, 'cb-concern-trust', '2');
        await selectLikert(page, 'cb-concern-security', '4');
        await selectLikert(page, 'cb-concern-jobs', '2');
        await selectLikert(page, 'cb-concern-compliance', '4');
        await selectLikert(page, 'cb-concern-thinking', '3');
        await page.click('#cb-next');

        // Step 5 — objectives
        await expect(page.locator('#cb-progress-label')).toHaveText('Step 5 of 6');
        const scores: Record<string, string> = {
            c1: '2', c2: '3', c3: '3', c4: '2', c5: '2',
            g1: '4', g2: '4', g3: '4', g4: '4', g5: '3',
            b1: '3', b2: '2', b3: '2',
        };
        for (const code of Object.keys(scores)) {
            await selectLikert(page, `cb-obj-${code}`, scores[code]);
        }
        await expect(page.locator('#cb-obj-rated')).toHaveText('13');
        await page.click('#cb-next');

        // Step 6
        await expect(page.locator('#cb-progress-label')).toHaveText('Step 6 of 6');
        await page.fill('#cb-why', "Confidence to review juniors' AI-assisted work without adding hours to my week.");
        await expect(page.locator('#cb-next')).toContainText('See your day');
        await page.click('#cb-next');

        // Output
        await expect(page.locator('#cb-output')).toBeVisible();
        await expect(page.locator('#cb-agenda-tailored')).toContainText('managers');
        await expect(page.locator('#cb-agenda-heading')).toContainText('Acme Consulting');

        // Managers + high G concerns ⇒ Governance dominates
        const firstModule = page.locator('.cb-agenda-row').nth(1).locator('.cb-agenda-module');
        await expect(firstModule).toContainText('Governance');

        // Closing commitment uses the "review habits" template
        const lastRow = page.locator('.cb-agenda-row').last();
        await expect(lastRow).toContainText('review habits');

        // Two-track CTAs are visible and the book-call mailto contains the company name and audience
        const bookCall = page.locator('#cb-book-call');
        await expect(bookCall).toBeVisible();
        const href = await bookCall.getAttribute('href');
        expect(href).toContain('mailto:training@aimforbetter.co.uk');
        expect(decodeURIComponent(href || '')).toContain('Acme Consulting');
        expect(decodeURIComponent(href || '')).toContain('Audience: managers');
    });

    test('back preserves values and disables on step 1', async ({ page }) => {
        await page.goto(URL);
        await fillStep1(page);
        await page.click('#cb-next');
        // Step 2 — fill audience but immediately go back (auto-advance suppressed once after Back)
        await page.click('label.cb-tile:has(input[name="cb-audience"][value="juniors"])');
        await page.click('#cb-back');
        await expect(page.locator('#cb-company-name')).toHaveValue('Acme Consulting');
        await expect(page.locator('input[name="cb-size"][value="251-1000"]')).toBeChecked();
        await expect(page.locator('#cb-back')).toBeDisabled();
    });

    test('format swap changes activity copy', async ({ page }) => {
        async function runWith(format: string) {
            await page.goto(URL);
            await fillStep1(page);
            await page.click('#cb-next');
            await fillStep2(page, 'mixed', 'collaborative');
            await page.click('#cb-next');
            // Step 3 — pick format (auto-advance fires on click)
            await page.click(`label.cb-tile:has(input[name="cb-format"][value="${format}"])`);
            await expect(page.locator('#cb-progress-label')).toHaveText('Step 4 of 6');
            for (const k of ['trust', 'security', 'jobs', 'compliance', 'thinking']) {
                await selectLikert(page, `cb-concern-${k}`, '3');
            }
            await page.click('#cb-next');
            for (const code of ['c1', 'c2', 'c3', 'c4', 'c5', 'g1', 'g2', 'g3', 'g4', 'g5', 'b1', 'b2', 'b3']) {
                await selectLikert(page, `cb-obj-${code}`, '3');
            }
            await page.click('#cb-next');
            await page.fill('#cb-why', 'Spotting AI nonsense faster.');
            await page.click('#cb-next');
            return await page.locator('.cb-agenda-row').nth(2).locator('.cb-agenda-desc').innerText();
        }
        const inPerson = await runWith('in-person');
        const remote   = await runWith('remote');
        expect(inPerson).not.toEqual(remote);
    });

    test('email-me-my-plan submits to Formspree with the right payload', async ({ page }) => {
        let capturedPayload: any = null;
        // Intercept the Formspree request and reply with a stub success.
        await page.route('https://formspree.io/f/xjgpwjyl', async (route) => {
            const req = route.request();
            try { capturedPayload = JSON.parse(req.postData() || '{}'); } catch {}
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });

        await page.goto(URL);
        await fillStep1(page);
        await page.click('#cb-next');
        await fillStep2(page, 'managers', 'cautious');
        await page.click('#cb-next');
        await page.click('label.cb-tile:has(input[name="cb-format"][value="in-person"])');
        await expect(page.locator('#cb-progress-label')).toHaveText('Step 4 of 6');
        for (const k of ['trust', 'security', 'jobs', 'compliance', 'thinking']) {
            await selectLikert(page, `cb-concern-${k}`, '3');
        }
        await page.click('#cb-next');
        for (const code of ['c1', 'c2', 'c3', 'c4', 'c5', 'g1', 'g2', 'g3', 'g4', 'g5', 'b1', 'b2', 'b3']) {
            await selectLikert(page, `cb-obj-${code}`, '3');
        }
        await page.click('#cb-next');
        await page.fill('#cb-why', 'Spotting AI nonsense faster.');
        await page.click('#cb-next');

        // Open the email panel and submit
        await page.click('#cb-toggle-email');
        await page.fill('#cb-email-input', 'erik@example.com');
        await page.click('#cb-email-submit');

        await expect(page.locator('#cb-email-message')).toContainText('Thanks');
        expect(capturedPayload).not.toBeNull();
        expect(capturedPayload.email).toBe('erik@example.com');
        expect(capturedPayload.source).toBe('course-builder');
        expect(capturedPayload.company).toBe('Acme Consulting');
        expect(capturedPayload.audience).toBe('managers');
        expect(capturedPayload.agenda).toContain('SUGGESTED DAY');
    });

    test('homepage hero and footer both link to the wizard', async ({ page }) => {
        await page.goto('http://127.0.0.1:8765/index.html');
        const heroCta = page.locator('section.hero a.hero-cta');
        await expect(heroCta).toBeVisible();
        await expect(heroCta).toContainText('Design your training course');
        await expect(heroCta).toHaveAttribute('href', /course-builder\.html$/);

        const footerCta = page.locator('section.final-cta a.hero-cta');
        await expect(footerCta).toContainText('Design your training course');
        await expect(footerCta).toHaveAttribute('href', /course-builder\.html$/);

        // Menu overlay also surfaces the wizard as a styled CTA.
        const navCta = page.locator('.menu-overlay nav a.nav-cta');
        await expect(navCta).toContainText('Design your day');
        await expect(navCta).toHaveAttribute('href', /course-builder\.html$/);
    });
});
