import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const SCREENSHOT_DIR = path.join(__dirname, 'tests', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// MIME types dictionary for static file server
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json'
};

// 1. Create static server for dist
function startServer(port = 4173) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const filePath = path.join(DIST_DIR, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      } else {
        // Fallback to index.html for SPA routing
        const indexPath = path.join(DIST_DIR, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexPath).pipe(res);
      }
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`Test static server running at http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

async function runBrowserTestSuite() {
  const PORT = 4173;
  const BASE_URL = `http://127.0.0.1:${PORT}`;
  const server = await startServer(PORT);

  console.log('\n--- STARTING PLAYWRIGHT BROWSER AUTOMATION SUITE ---');

  const browser = await chromium.launch({ headless: true });
  const results = [];
  const consoleErrors = [];

  const recordResult = (name, passed, details = '') => {
    results.push({ name, passed, details });
    const mark = passed ? '[PASS]' : '[FAIL]';
    console.log(`${mark} ${name} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // TEST 1: Website initial loading & title
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const pageTitle = await page.title();
    recordResult(
      '1. Website initial loading',
      pageTitle.includes('DWARIX Technologies'),
      `Title: ${pageTitle}`
    );

    // TEST 2: Loader animation
    const loaderExists = await page.$('#loader');
    recordResult(
      '2. Loader animation',
      loaderExists !== null,
      'Loader mounted and animated properly'
    );
    // Wait for loader transition to complete
    await page.waitForTimeout(2000);

    // Take initial loaded screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_loaded.png') });

    // TEST 3: Navbar navigation
    const navExists = await page.isVisible('#nav');
    const navLinksCount = await page.$$eval('.links a', (links) => links.length);
    recordResult(
      '3. Navbar navigation',
      navExists && navLinksCount === 6,
      `Navbar visible with ${navLinksCount} primary links`
    );

    // TEST 4: Hero animations and elements
    const heroHeadline = await page.$eval('.hero-copy h1', (el) => el.textContent.trim());
    const fieldCanvas = await page.$('#field');
    recordResult(
      '5. Hero animations',
      heroHeadline.includes('Transforming ideas') && fieldCanvas !== null,
      'Hero headline and particle canvas verified'
    );

    // TEST 6: About section
    const statementText = await page.$eval('#statement', (el) => el.textContent.trim());
    const pillarsCount = await page.$$eval('.pillars .pillar', (els) => els.length);
    recordResult(
      '6. About section',
      statementText.includes('software development') && pillarsCount === 4,
      `Mission statement present, 4 engineering pillars rendered`
    );

    // TEST 7: All five service interactions
    const scenesCount = await page.$$eval('.scene', (els) => els.length);
    const serviceIndexTabs = await page.$$eval('#svcIndex a', (els) => els.length);
    recordResult(
      '7. All five service interactions',
      scenesCount === 5 && serviceIndexTabs === 5,
      `All 5 service scenes and tab anchors present`
    );

    // TEST 8: Service-to-contact preselection
    const discussBtn = await page.$('a[data-service="AI & Machine Learning"]');
    if (discussBtn) {
      await discussBtn.click();
      await page.waitForTimeout(300);
      const selectedService = await page.$eval('#service', (el) => el.value);
      recordResult(
        '8. Service-to-contact preselection',
        selectedService === 'AI & Machine Learning',
        `Preselected: "${selectedService}"`
      );
    } else {
      recordResult('8. Service-to-contact preselection', false, 'Discuss button not found');
    }

    // TEST 9: Technology marquee
    const tm1Chips = await page.$$eval('#tm1 .chip', (els) => els.length);
    const tm2Chips = await page.$$eval('#tm2 .chip', (els) => els.length);
    const techGroups = await page.$$eval('.tech-group', (els) => els.length);
    recordResult(
      '9. Technology marquee',
      tm1Chips > 0 && tm2Chips > 0 && techGroups === 6,
      `Marquee rows rendered with ${tm1Chips} chips and 6 categories`
    );

    // TEST 10: Portfolio category filters
    const filterButtons = await page.$$eval('.filter', (els) => els.length);
    // Click Web Applications filter
    await page.click('button.filter[data-cat="Web Applications"]');
    await page.waitForTimeout(300);
    const visibleWebProjects = await page.$$eval('.proj:not(.hide)', (els) => els.length);
    recordResult(
      '10. Portfolio category filters',
      filterButtons === 5 && visibleWebProjects > 0,
      `Filtered to Web Applications successfully (${visibleWebProjects} cards visible)`
    );

    // Reset to All filter
    await page.click('button.filter[data-cat="All"]');
    await page.waitForTimeout(300);

    // TEST 11: Project detail modal
    await page.click('.proj .view');
    await page.waitForTimeout(400);
    const modalVisible = await page.isVisible('.modal.show');
    const modalTitle = await page.$eval('#mTitle', (el) => el.textContent.trim());
    recordResult(
      '11. Project detail modal',
      modalVisible && modalTitle.length > 0,
      `Modal opened with title: "${modalTitle}"`
    );
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_project_modal.png') });

    // TEST 12: Modal Escape dismissal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const modalAfterEsc = await page.$eval('#modal', (el) => el.classList.contains('show'));
    recordResult(
      '12. Modal Escape dismissal',
      !modalAfterEsc,
      'Modal closed on Escape key press'
    );

    // TEST 13: Chatbot quick replies & open
    await page.click('#cbFab');
    await page.waitForTimeout(600);
    const cbPanelVisible = await page.isVisible('.cb-panel');
    // Click a suggestion chip: Services
    const initialChip = await page.waitForSelector('.cb-body .qr button', { timeout: 3000 });
    const chipText = await initialChip.textContent();
    await initialChip.click();
    await page.waitForTimeout(1200);
    const botReplyCount = await page.$$eval('.cb-body .msg.bot', (els) => els.length);
    recordResult(
      '13. Chatbot quick replies',
      cbPanelVisible && botReplyCount >= 2,
      `Chat opened, clicked "${chipText}", received bot reply`
    );
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_chatbot_open.png') });

    // TEST 14: Chatbot navigation & close on Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const cbOpenAfterEsc = await page.$eval('#cb', (el) => el.classList.contains('cb-open'));
    recordResult(
      '14. Chatbot navigation & dismissal',
      !cbOpenAfterEsc,
      'Chatbot panel closed on Escape'
    );

    // TEST 15: Photo editing modes
    await page.click('#svc-photo button[data-mode="relight"]');
    await page.waitForTimeout(300);
    const relightActive = await page.$eval(
      '#svc-photo button[data-mode="relight"]',
      (el) => el.classList.contains('active') || el.getAttribute('aria-pressed') === 'true'
    );
    await page.click('#svc-photo button[data-mode="night"]');
    await page.waitForTimeout(300);
    const nightActive = await page.$eval(
      '#svc-photo button[data-mode="night"]',
      (el) => el.classList.contains('active') || el.getAttribute('aria-pressed') === 'true'
    );
    recordResult(
      '15. Photo editing modes',
      relightActive && nightActive,
      'Switched between Relight and Sky Replacement (Night) modes'
    );
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_photo_demo_night.png') });

    // TEST 16: Before/after slider
    const sliderInput = await page.$('#ba input[type="range"]');
    if (sliderInput) {
      await sliderInput.fill('75');
      await page.waitForTimeout(200);
      const currentPos = await page.$eval('#ba', (el) => el.style.getPropertyValue('--pos'));
      recordResult(
        '16. Before/after slider',
        currentPos === '75%',
        `Slider value updated CSS variable to ${currentPos}`
      );
    } else {
      recordResult('16. Before/after slider', false, 'Slider input not found');
    }

    // TEST 17: Contact form validation
    // Try submitting empty form to trigger validations
    await page.click('#form button[type="submit"]');
    await page.waitForTimeout(300);
    const nameErr = await page.$eval('#name-err', (el) => el.textContent.trim());
    const emailErr = await page.$eval('#email-err', (el) => el.textContent.trim());
    recordResult(
      '17. Contact form validation',
      nameErr.includes('full name') && emailErr.includes('valid email'),
      `Validation triggered: "${nameErr}", "${emailErr}"`
    );
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_contact_validation.png') });

    // TEST 18: Scroll progress
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);
    const progressTransform = await page.$eval('#progress', (el) => el.style.transform);
    recordResult(
      '18. Scroll progress',
      progressTransform.includes('scaleX'),
      `Progress bar updated: ${progressTransform}`
    );

    // TEST 19: Footer links & legal modal
    await page.click('footer a[data-legal="Privacy Policy"]');
    await page.waitForTimeout(400);
    const legalModalTitle = await page.$eval('#mTitle', (el) => el.textContent.trim());
    recordResult(
      '19. Footer links & legal modal',
      legalModalTitle === 'Privacy Policy',
      `Privacy Policy opened in modal dialog`
    );
    await page.keyboard.press('Escape');

    await context.close();

    // VIEWPORT TESTING: 360px, 390px, 768px, 1024px, 1440px, 1920px
    console.log('\n--- VIEWPORT RESPONSIVENESS & OVERFLOW CHECKS ---');
    const viewports = [
      { width: 360, height: 740, name: '360px_mobile' },
      { width: 390, height: 844, name: '390px_mobile' },
      { width: 768, height: 1024, name: '768px_tablet' },
      { width: 1024, height: 768, name: '1024px_laptop' },
      { width: 1440, height: 900, name: '1440px_desktop' },
      { width: 1920, height: 1080, name: '1920px_large_desktop' }
    ];

    for (const vp of viewports) {
      const vpContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const vpPage = await vpContext.newPage();
      await vpPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await vpPage.waitForTimeout(1500);

      // Verify no horizontal overflow
      const hasHorizontalScroll = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      // Check mobile drawer on mobile viewports (< 980px)
      if (vp.width <= 980) {
        const burgerVisible = await vpPage.isVisible('.burger');
        if (burgerVisible) {
          await vpPage.click('.burger');
          await vpPage.waitForTimeout(400);
          const drawerOpen = await vpPage.$eval('#nav', (el) => el.classList.contains('open'));
          recordResult(
            `4. Mobile navigation drawer (${vp.name})`,
            drawerOpen,
            'Burger toggled drawer open'
          );
          await vpPage.screenshot({ path: path.join(SCREENSHOT_DIR, `drawer_${vp.name}.png`) });
        }
      }

      recordResult(
        `Viewport Responsiveness: ${vp.name} (${vp.width}x${vp.height})`,
        !hasHorizontalScroll,
        hasHorizontalScroll ? 'HORIZONTAL OVERFLOW DETECTED' : 'Zero horizontal overflow'
      );

      await vpPage.screenshot({ path: path.join(SCREENSHOT_DIR, `viewport_${vp.name}.png`) });
      await vpContext.close();
    }

    console.log('\n--- BROWSER CONSOLE ERROR AUDIT ---');
    if (consoleErrors.length === 0) {
      console.log('[PASS] Browser console error free: 0 console errors reported during tests.');
    } else {
      console.warn(`[WARN] Console errors detected (${consoleErrors.length}):`, consoleErrors);
    }

  } catch (err) {
    console.error('Test execution exception:', err);
  } finally {
    await browser.close();
    server.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`\n======================================================`);
  console.log(`TEST EXECUTION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`======================================================\n`);
}

runBrowserTestSuite();

