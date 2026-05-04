import { test, expect } from '@playwright/test';

const URL = 'http://127.0.0.1:8765/pages/course-builder.html';

async function fillStep1(page: any) {
    await page.fill('#cb-company-name', 'Acme Consulting');
    await page.click('label.cb-tile:has(input[name="cb-size"][value="251-1000"])');
    await page.click('label.cb-tile:has(input[name="cb-industry"][value="finance"])');
}

async function fillStep2(page: any, audience: string, cultureWord: string) {
    await page.click(`label.cb-tile:has(input[name="cb-audience"][value="${audience}"])`);
    await page.fill('#cb-culture-word', cultureWord);
}

async function selectLikert(page: any, name: string, value: string) {
    await page.click(`label.cb-likert-option:has(input[name="${name}"][value="${value}"])`);
}

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

    // Step 3 — in-person is checked by default; just advance.
    await expect(page.locator('#cb-progress-label')).toHaveText('Step 3 of 6');
    await page.click('#cb-next');

    // Step 4 — concerns: high regulatory risk for managers persona
    await expect(page.locator('#cb-progress-label')).toHaveText('Step 4 of 6');
    await selectLikert(page, 'cb-concern-trust', '2');
    await selectLikert(page, 'cb-concern-security', '4');
    await selectLikert(page, 'cb-concern-jobs', '2');
    await selectLikert(page, 'cb-concern-compliance', '4');
    await selectLikert(page, 'cb-concern-thinking', '3');
    await page.click('#cb-next');

    // Step 5 — objectives. G1, G2, G3, G4 high; others mid/low.
    await expect(page.locator('#cb-progress-label')).toHaveText('Step 5 of 6');
    const high = ['c1', 'c2', 'c3', 'c4', 'c5', 'g1', 'g2', 'g3', 'g4', 'g5', 'b1', 'b2', 'b3'];
    const scores: Record<string, string> = {
        c1: '2', c2: '3', c3: '3', c4: '2', c5: '2',
        g1: '4', g2: '4', g3: '4', g4: '4', g5: '3',
        b1: '3', b2: '2', b3: '2',
    };
    for (const code of high) {
        await selectLikert(page, `cb-obj-${code}`, scores[code]);
    }
    await page.click('#cb-next');

    // Step 6 — Why
    await expect(page.locator('#cb-progress-label')).toHaveText('Step 6 of 6');
    await page.fill('#cb-why', 'Confidence to review juniors\' AI-assisted work without adding hours to my week.');
    await expect(page.locator('#cb-next')).toContainText('See your day');
    await page.click('#cb-next');

    // Output revealed
    await expect(page.locator('#cb-output')).toBeVisible();
    await expect(page.locator('#cb-agenda-tailored')).toContainText('managers');
    await expect(page.locator('#cb-agenda-tailored')).toContainText('in-person');
    await expect(page.locator('#cb-agenda-heading')).toContainText('Acme Consulting');

    // Managers + high G concerns ⇒ Governance modules should dominate slot 1
    const firstModule = page.locator('.cb-agenda-row').nth(1).locator('.cb-agenda-module');
    await expect(firstModule).toContainText('Governance');

    // Closing commitment should be the "review habits" template (keyword: "review", "junior")
    const lastRow = page.locator('.cb-agenda-row').last();
    await expect(lastRow).toContainText('review habits');
});

test('back preserves values and disables on step 1', async ({ page }) => {
    await page.goto(URL);
    await fillStep1(page);
    await page.click('#cb-next');
    await fillStep2(page, 'juniors', 'fast-moving');
    await page.click('#cb-back');
    // Step 1 again — values still there
    await expect(page.locator('#cb-company-name')).toHaveValue('Acme Consulting');
    await expect(page.locator('input[name="cb-size"][value="251-1000"]')).toBeChecked();
    await expect(page.locator('#cb-back')).toBeDisabled();
});

test('format swap changes activity copy', async ({ page }) => {
    // Run the wizard twice with different formats; assert at least one activity differs.
    async function runWith(format: string) {
        await page.goto(URL);
        await fillStep1(page);
        await page.click('#cb-next');
        await fillStep2(page, 'mixed', 'collaborative');
        await page.click('#cb-next');
        if (format !== 'in-person') {
            await page.click(`label.cb-tile:has(input[name="cb-format"][value="${format}"])`);
        }
        await page.click('#cb-next');
        // Concerns — neutral
        for (const k of ['trust', 'security', 'jobs', 'compliance', 'thinking']) {
            await selectLikert(page, `cb-concern-${k}`, '3');
        }
        await page.click('#cb-next');
        // Objectives — all 3
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
