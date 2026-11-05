import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\D RAMA KOTESWARA RAO\\.gemini\\antigravity\\brain\\25305f6b-78f6-4f45-9b31-8ad5181ac195';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  console.log('[Visual QA] Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--enable-webgl'],
  });

  try {
    const page = await browser.newPage();
    
    // 1. DESKTOP VIEWPORT (1440x900 @ 100% zoom)
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    console.log('[Visual QA] Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for canvas to mount and render initial frames
    await page.waitForSelector('canvas', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 2500)); // Allow 3D models and shaders to warm up

    // Screenshot 1: Redesigned Hero Environment
    const heroPath = path.join(ARTIFACT_DIR, 'hero-desktop.png');
    await page.screenshot({ path: heroPath, type: 'png' });
    console.log(`[Visual QA] ✓ Captured Desktop Hero: ${heroPath}`);

    // Verify visual hierarchy metrics via DOM evaluation
    const layoutMetrics = await page.evaluate(() => {
      const headline = document.querySelector('h1');
      const headlineRect = headline ? headline.getBoundingClientRect() : null;
      const navbar = document.querySelector('header');
      const navbarRect = navbar ? navbar.getBoundingClientRect() : null;
      const primaryBtn = document.querySelector('.cyber-button-primary');
      const btnRect = primaryBtn ? primaryBtn.getBoundingClientRect() : null;
      const canvas = document.querySelector('canvas');
      const canvasRect = canvas ? canvas.getBoundingClientRect() : null;

      return {
        headlineWidth: headlineRect?.width,
        headlineLeft: headlineRect?.left,
        headlineTop: headlineRect?.top,
        navbarHeight: navbarRect?.height,
        btnTop: btnRect?.top,
        canvasPresent: Boolean(canvas),
        windowWidth: window.innerWidth,
      };
    });

    console.log('[Visual QA] Desktop Layout Metrics:', JSON.stringify(layoutMetrics, null, 2));

    // Screenshot 2: Scroll to Stage 1 (Meet Companion)
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 1500));
    const stage1Path = path.join(ARTIFACT_DIR, 'stage1-companion.png');
    await page.screenshot({ path: stage1Path, type: 'png' });
    console.log(`[Visual QA] ✓ Captured Stage 1 (Companion): ${stage1Path}`);

    // Screenshot 3: Scroll to Stage 2 (Skill Assessment Hub)
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 2.0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 1500));
    const stage2Path = path.join(ARTIFACT_DIR, 'stage2-assessment.png');
    await page.screenshot({ path: stage2Path, type: 'png' });
    console.log(`[Visual QA] ✓ Captured Stage 2 (Assessment): ${stage2Path}`);

    // Screenshot 4: Scroll to Stage 3 (Adaptive Roadmap)
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 3.0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 1500));
    const stage3Path = path.join(ARTIFACT_DIR, 'stage3-roadmap.png');
    await page.screenshot({ path: stage3Path, type: 'png' });
    console.log(`[Visual QA] ✓ Captured Stage 3 (Roadmap): ${stage3Path}`);

    // 2. MOBILE VIEWPORT (390x844 iPhone 14 @ 100% scale)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 1500));

    const mobilePath = path.join(ARTIFACT_DIR, 'hero-mobile.png');
    await page.screenshot({ path: mobilePath, type: 'png' });
    console.log(`[Visual QA] ✓ Captured Mobile Hero: ${mobilePath}`);

    console.log('[Visual QA] All visual verification screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('[Visual QA Error]:', err);
  process.exit(1);
});
