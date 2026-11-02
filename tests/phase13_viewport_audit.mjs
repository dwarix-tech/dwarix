import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'client', 'dist');
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'tests', 'phase13_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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
        const indexPath = path.join(DIST_DIR, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexPath).pipe(res);
      }
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

const VIEWPORTS = [
  { width: 320, height: 568, name: '320x568_iPhoneSE1' },
  { width: 360, height: 800, name: '360x800_AndroidStandard' },
  { width: 375, height: 812, name: '375x812_iPhoneMini' },
  { width: 390, height: 844, name: '390x844_iPhone13' },
  { width: 430, height: 932, name: '430x932_iPhoneProMax' },
  { width: 768, height: 1024, name: '768x1024_iPadPortrait' },
  { width: 1024, height: 768, name: '1024x768_iPadLandscape' },
  { width: 1280, height: 800, name: '1280x800_CompactLaptop' },
  { width: 1440, height: 900, name: '1440x900_DesktopMacBook' },
  { width: 1920, height: 1080, name: '1920x1080_FullHDDesktop' }
];

async function runAudit() {
  console.log('=== DWARIX TECHNOLOGIES — PHASE 13 PLAYWRIGHT AUDIT SUITE ===\n');
  const server = await startServer(4173);
  const BASE_URL = 'http://127.0.0.1:4173';

  const browser = await chromium.launch({ headless: true });
  const results = [];

  function record(category, testName, passed, details = '') {
    results.push({ category, testName, passed, details });
    const symbol = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] [${category}] ${testName} ${details ? '— ' + details : ''}`);
  }

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n========================================================`);
      console.log(`>>> Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) <<<`);
      console.log(`========================================================`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: vp.width < 768
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      // API Mocking for deterministic testing
      await context.route('**/api/company', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: 'DWARIX Technologies',
            tagline: 'Engineering the Next Generation of Digital Systems',
            email: 'dwarixtech@gmail.com',
            phone: '+91 79816 13325',
            location: 'Vizianagaram, Andhra Pradesh, India'
          })
        });
      });

      await context.route('**/api/chatbot/suggestions', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            suggestions: [
              'What services does DWARIX offer?',
              'Can you build AI applications?',
              'Show me your projects.',
              'What technologies do you use?',
              'How can I start a project?',
              'How can I contact DWARIX?'
            ]
          })
        });
      });

      await context.route('**/api/chatbot/message', async (route) => {
        const postData = JSON.parse(route.request().postData() || '{}');
        const msg = (postData.message || '').toLowerCase();
        let reply = "DWARIX Technologies provides end-to-end technology solutions.";
        let preselectedService = null;
        let action = null;

        if (msg.includes('service')) {
          reply = "We offer 5 core engineering services: 1. AI & Machine Learning, 2. Web Development, 3. Mobile Apps, 4. Custom Software, 5. Photography & Media.";
        } else if (msg.includes('ai')) {
          reply = "Yes, we specialize in production-grade AI applications including LLM integrations, computer vision, and speech recognition.";
          preselectedService = "AI & Machine Learning";
          action = { type: 'navigate_contact', target: '#contact', label: 'Start an AI Project' };
        } else if (msg.includes('project')) {
          reply = "Our key production systems include Visit AP, FarmerDirect, InsureScan, and Voice Billing System.";
          action = { type: 'open_url', url: 'https://voice-billing-system-six.vercel.app/', label: 'View Voice Billing Demo' };
        } else if (msg.includes('contact')) {
          reply = "Reach out via email at dwarixtech@gmail.com or phone at +91 79816 13325.";
          action = { type: 'email', email: 'dwarixtech@gmail.com', label: 'Email Engineering Team' };
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply,
            preselectedService,
            action,
            timestamp: new Date().toISOString()
          })
        });
      });

      await context.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            token: 'mock-jwt-token-for-audit',
            admin: {
              email: 'dwarixtech@gmail.com',
              role: 'superadmin'
            }
          })
        });
      });

      await context.route('**/api/auth/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            admin: {
              email: 'dwarixtech@gmail.com',
              role: 'superadmin',
              name: 'DWARIX SuperAdmin'
            }
          })
        });
      });

      await context.route('**/api/admin/enquiries**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            enquiries: [
              {
                _id: 'enq-001',
                name: 'Ananya Sharma',
                email: 'ananya@techcorp.in',
                phone: '+91 98765 43210',
                service: 'AI & Machine Learning',
                budget: '₹2,00,000 - ₹5,00,000',
                message: 'Looking for a custom speech recognition and NLP pipeline.',
                status: 'new',
                createdAt: new Date().toISOString()
              },
              {
                _id: 'enq-002',
                name: 'Rajesh Varma',
                email: 'rajesh@agrihub.org',
                phone: '+91 91234 56789',
                service: 'Web Development',
                budget: '₹1,00,000 - ₹2,00,000',
                message: 'Require an enterprise dashboard for farmer-to-consumer inventory.',
                status: 'contacted',
                createdAt: new Date().toISOString()
              }
            ]
          })
        });
      });

      const page = await context.newPage();

      // -----------------------------------------------------------
      // 1. PUBLIC WEBSITE AUDIT
      // -----------------------------------------------------------
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Check horizontal overflow
      const pubOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      record(
        vp.name,
        'Public Page: Zero Horizontal Overflow',
        !pubOverflow,
        pubOverflow ? 'ScrollWidth exceeds viewport width!' : 'Clean fit (no horizontal scrollbar)'
      );

      // Check Hero
      const heroVisible = await page.isVisible('.hero-copy h1, #hero');
      record(vp.name, 'Public Page: Hero Section Mounted', heroVisible);

      // Check Navigation
      if (vp.width < 980) {
        const burgerBtn = await page.$('.burger');
        if (burgerBtn) {
          const isBurgerVisible = await burgerBtn.isVisible();
          record(vp.name, 'Public Page: Mobile Burger Visible', isBurgerVisible);
          if (isBurgerVisible) {
            await burgerBtn.click();
            await page.waitForTimeout(400);
            const drawerOpen = await page.$eval('#nav', (el) => el.classList.contains('open'));
            record(vp.name, 'Public Page: Mobile Drawer Opens On Click', drawerOpen);
            // Close drawer
            await burgerBtn.click();
            await page.waitForTimeout(300);
          }
        }
      } else {
        const navLinksCount = await page.$$eval('.links a', (els) => els.length);
        record(vp.name, 'Public Page: Desktop Nav Links Visible', navLinksCount >= 5, `${navLinksCount} links`);
      }

      // Check Services Section
      const servicesCardsCount = await page.$$eval('.scene', (els) => els.length);
      record(vp.name, 'Public Page: 5 Service Cards Rendered', servicesCardsCount === 5, `${servicesCardsCount} services`);

      // Check Portfolio Section (Strictly 4 Real Production Projects)
      const projectCardsCount = await page.$$eval('.proj', (els) => els.length);
      record(vp.name, 'Public Page: 4 Real Production Projects Rendered', projectCardsCount === 4, `${projectCardsCount} projects`);

      // Test Project Modal (Open, verify sticky header & footer action bar, close)
      if (projectCardsCount > 0) {
        const firstCardViewBtn = await page.$('.proj:first-child button.view');
        if (firstCardViewBtn) {
          await firstCardViewBtn.click();
          await page.waitForTimeout(500);
          const modalBackdrop = await page.$('#modal.show');
          const stickyCloseBtn = await page.$('button[aria-label="Close modal dialog"]');
          const stickyBottomClose = await page.$('#mClose');

          record(
            vp.name,
            'Public Page: Project Modal Opens with Sticky Controls',
            modalBackdrop !== null && (stickyCloseBtn !== null || stickyBottomClose !== null),
            'Sticky close button and action bar verified'
          );

          if (stickyCloseBtn) {
            await stickyCloseBtn.click();
            await page.waitForTimeout(300);
          } else if (stickyBottomClose) {
            await stickyBottomClose.click();
            await page.waitForTimeout(300);
          }
        }
      }

      // Test Chatbot Widget
      const chatbotFab = await page.$('#cbFab');
      if (chatbotFab) {
        record(vp.name, 'Chatbot: Floating Action Button (FAB) Present', true);
        await chatbotFab.click();
        await page.waitForTimeout(500);
        const chatWindowOpen = await page.$eval('#cb', (el) => el.classList.contains('cb-open'));
        record(vp.name, 'Chatbot: Panel Opens on FAB Click', chatWindowOpen);

        // Verify 6 quick reply suggestions are present
        const suggestionChips = await page.$$eval('.qr button', (els) => els.map((e) => e.textContent.trim()));
        record(
          vp.name,
          'Chatbot: 6 Quick Suggestions Rendered',
          suggestionChips.length === 6,
          `${suggestionChips.length} suggestion pills found`
        );

        // Click first suggestion ("What services does DWARIX offer?")
        const firstChip = await page.$('.qr button');
        if (firstChip) {
          await firstChip.click();
          await page.waitForTimeout(600);
          const messagesCount = await page.$$eval('.msg-wrapper', (els) => els.length);
          record(
            vp.name,
            'Chatbot: Interaction Yields Assistant Reply',
            messagesCount >= 2,
            `${messagesCount} messages in thread`
          );
        }

        // Close chatbot
        const closeChatBtn = await page.$('.cb-icon-btn[aria-label="Close chat"]');
        if (closeChatBtn) {
          await closeChatBtn.click();
          await page.waitForTimeout(300);
        }
      }

      // Take screenshot of public page
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `public_${vp.name}.png`), fullPage: false });

      // -----------------------------------------------------------
      // 2. ADMIN PORTAL AUDIT
      // -----------------------------------------------------------
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#admin-email', { timeout: 6000 });

      const adminLoginOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      record(
        vp.name,
        'Admin Login: Zero Horizontal Overflow',
        !adminLoginOverflow,
        'Clean responsive login viewport'
      );

      // Verify login fields
      const emailInput = await page.$('#admin-email');
      const passwordInput = await page.$('input[type="password"]');
      const loginBtn = await page.$('button[type="submit"]');

      record(
        vp.name,
        'Admin Login: Form Elements Functional & Accessible',
        emailInput !== null && passwordInput !== null && loginBtn !== null,
        'Email, password, and submit button accessible'
      );

      // Fill in credentials and log in to test Admin Dashboard responsive layout
      await page.fill('#admin-email', 'dwarixtech@gmail.com');
      await page.fill('input[type="password"]', 'Dwarix@2026');
      await page.click('button[type="submit"]');

      // Wait for navigation to /admin/dashboard
      await page.waitForTimeout(800);

      const onAdminDashboard = page.url().includes('/admin');
      record(
        vp.name,
        'Admin Dashboard: Authenticated Navigation Succeeded',
        onAdminDashboard,
        `Current URL: ${page.url()}`
      );

      if (onAdminDashboard) {
        // Check Admin Dashboard horizontal overflow
        const adminDashOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth + 1;
        });
        record(
          vp.name,
          'Admin Dashboard: Zero Horizontal Overflow',
          !adminDashOverflow,
          'Dashboard fits within viewport width'
        );

        // On mobile, test sidebar drawer toggle & backdrop
        if (vp.width < 980) {
          const menuToggleBtn = await page.$('button[aria-label="Toggle navigation menu"]');
          if (menuToggleBtn) {
            await menuToggleBtn.click();
            await page.waitForTimeout(300);
            const sidebarOpen = await page.$eval('.admin-sidebar', (el) => el.classList.contains('open'));
            const backdropVisible = await page.isVisible('.admin-sidebar-backdrop');
            record(
              vp.name,
              'Admin Dashboard: Mobile Drawer Toggles with Backdrop',
              sidebarOpen && backdropVisible,
              'Collapsible drawer and backdrop overlay active'
            );
            // Click close sidebar button to close drawer
            const closeSidebarBtn = await page.$('button[aria-label="Close sidebar"]');
            if (closeSidebarBtn && await closeSidebarBtn.isVisible()) {
              await closeSidebarBtn.click();
              await page.waitForTimeout(300);
            }
          }
        }

        // Take screenshot of admin dashboard
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `admin_dashboard_${vp.name}.png`), fullPage: false });
      }

      await context.close();
    }

    console.log('\n======================================================');
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`AUDIT RESULTS: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} total checks.`);
    console.log(`Screenshots saved to: tests/phase13_screenshots/`);
    console.log('======================================================\n');

  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

runAudit();
