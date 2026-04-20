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

/* ───────────────────────────────
   Full-page screenshots per page
   ─────────────────────────────── */
for (const p of PAGES) {
  test(`screenshot ${p.name} — desktop`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + p.url);
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      for (let i = 0; i < document.body.scrollHeight; i += 200) {
        window.scrollTo(0, i);
        await new Promise(r => setTimeout(r, 80));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `test-screenshots/review/${p.name}-desktop.png`,
      fullPage: true,
    });
  });
}

/* ───────────────────────────────
   Evidence: stat card alignment
   ─────────────────────────────── */
test('evidence — stat cards within a row are equal height', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/pages/evidence.html');
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    for (let i = 0; i < document.body.scrollHeight; i += 200) {
      window.scrollTo(0, i);
      await new Promise(r => setTimeout(r, 80));
    }
  });
  await page.waitForTimeout(500);

  const heights = await page.$$eval('.ev-row-stats', rows => {
    return rows.map(row => {
      const stats = Array.from(row.querySelectorAll('.ev-stat')) as HTMLElement[];
      return stats.map(s => Math.round(s.getBoundingClientRect().height));
    });
  });

  const report: string[] = [];
  heights.forEach((row, i) => {
    if (row.length <= 1) return;
    const min = Math.min(...row);
    const max = Math.max(...row);
    if (max - min > 4) {
      report.push(`Row ${i}: heights=${JSON.stringify(row)} (delta=${max - min}px)`);
    }
  });
  if (report.length) {
    console.log('Stat card height mismatches:\n' + report.join('\n'));
  }
  expect(report, report.join('\n')).toHaveLength(0);
});

/* ───────────────────────────────
   Homepage: stats-strip baseline
   ─────────────────────────────── */
test('homepage — stat-figure elements share a baseline within each strip', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/index.html');
  await page.waitForLoadState('networkidle');

  const rows = await page.$$eval('.stats-strip', strips => {
    return strips.map(strip => {
      const figs = Array.from(strip.querySelectorAll('.stat-figure')) as HTMLElement[];
      return figs.map(f => Math.round(f.getBoundingClientRect().top));
    });
  });

  const mismatches: string[] = [];
  rows.forEach((row, i) => {
    const min = Math.min(...row);
    const max = Math.max(...row);
    if (max - min > 4) {
      mismatches.push(`Strip ${i}: tops=${JSON.stringify(row)} (delta=${max - min}px)`);
    }
  });
  if (mismatches.length) console.log('Homepage stat misalignments:\n' + mismatches.join('\n'));
  expect(mismatches, mismatches.join('\n')).toHaveLength(0);
});

/* ───────────────────────────────
   Evidence: audit source links
   ─────────────────────────────── */
test('evidence — list every source line and classify links', async ({ page }) => {
  await page.goto(BASE + '/pages/evidence.html');
  await page.waitForLoadState('networkidle');

  const sources = await page.$$eval('.ev-row-source', nodes =>
    nodes.map(n => ({
      text: (n.textContent || '').trim(),
      hrefs: Array.from(n.querySelectorAll('a')).map(a => (a as HTMLAnchorElement).href),
    }))
  );

  const missing: string[] = [];
  sources.forEach((s, i) => {
    // A "source" typically includes "Source:" or "Sources:" followed by one or more citations.
    // Count the number of citations by looking for " · " separators plus one.
    const citationCount = (s.text.match(/ · /g)?.length ?? 0) + 1;
    if (s.hrefs.length < citationCount) {
      missing.push(`Row ${i}: ${s.text} — ${s.hrefs.length}/${citationCount} linked`);
    }
  });

  console.log('\n— Evidence source audit —');
  sources.forEach((s, i) => console.log(`  [${i}] ${s.text}\n      hrefs: ${s.hrefs.join(' | ') || '(none)'}`));

  if (missing.length) {
    console.log('\nMissing links:');
    missing.forEach(m => console.log('  ' + m));
  }
});

/* ───────────────────────────────
   Evidence: external links reachable
   ─────────────────────────────── */
test('evidence — external source URLs return 2xx or 3xx', async ({ page, request }) => {
  await page.goto(BASE + '/pages/evidence.html');
  await page.waitForLoadState('networkidle');
  const hrefs = await page.$$eval('.ev-row-source a', as =>
    as.map(a => (a as HTMLAnchorElement).href).filter(h => h.startsWith('http'))
  );
  const results: { url: string; status: number | string }[] = [];
  for (const url of hrefs) {
    try {
      const res = await request.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 AIM-linkcheck' },
        timeout: 15000,
        maxRedirects: 5,
      });
      results.push({ url, status: res.status() });
    } catch (e: any) {
      results.push({ url, status: `ERROR: ${e?.message ?? e}` });
    }
  }
  console.log('\n— External link check —');
  results.forEach(r => console.log(`  [${r.status}] ${r.url}`));
  const failures = results.filter(r =>
    typeof r.status !== 'number' || r.status < 200 || r.status >= 400
  );
  expect(failures, failures.map(f => `${f.status} ${f.url}`).join('\n')).toHaveLength(0);
});
