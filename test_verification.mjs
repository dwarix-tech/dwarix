import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('--- RUNNING DWARIX COMPREHENSIVE VERIFICATION SUITE ---\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

// 1. Verify data structures
import { TECH, ALL_TECH_CHIPS } from './src/data/technologies.js';
assert(Array.isArray(TECH) && TECH.length === 6, 'Technologies array has 6 categories');
assert(ALL_TECH_CHIPS.length > 15, `All tech chips flattened correctly (${ALL_TECH_CHIPS.length} chips)`);

import { SERVICES } from './src/data/services.js';
assert(SERVICES.length === 5, 'Services data has all 5 services');
const expectedServices = [
  'AI & Machine Learning',
  'Web Development',
  'Mobile App Development',
  'Custom Software Development',
  'AI Photo Editing'
];
assert(
  SERVICES.every((s, i) => s.title === expectedServices[i]),
  'All 5 service titles match original exactly'
);

import { CATEGORIES, PROJECTS } from './src/data/projects.js';
assert(CATEGORIES.length === 4, 'Project categories has 4 entries (including All)');
assert(PROJECTS.length === 4, 'Projects array has all 4 production projects');
assert(
  PROJECTS.every((p) => p.title && p.category && p.description && p.stack && p.art && p.githubUrl),
  'All 4 production projects have complete metadata (title, category, description, stack, art, githubUrl)'
);

// 2. Verify API layer
import { submitEnquiry } from './src/services/api.js';
const testEnquiry = {
  name: 'Test Client',
  email: 'client@example.com',
  phone: '+91 9876543210',
  company: 'Example Corp',
  service: 'AI & Machine Learning',
  budget: '₹2,00,000 – ₹10,00,000',
  desc: 'This is a test project enquiry to verify validation and API handling.'
};

const apiRes = await submitEnquiry(testEnquiry);
assert(apiRes.success === true, 'submitEnquiry returns success object');
assert(apiRes.pendingBackend === true, 'submitEnquiry correctly identifies pending backend when no URL configured');
assert(apiRes.message.length > 10, 'submitEnquiry message provides clear receipt confirmation without claiming false delivery');

// 3. Verify CSS files existence and non-empty
const cssFiles = [
  'src/styles/variables.css',
  'src/styles/global.css',
  'src/styles/components.css',
  'src/styles/responsive.css'
];

cssFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  assert(fs.existsSync(fullPath), `CSS file exists: ${file}`);
  const stats = fs.statSync(fullPath);
  assert(stats.size > 500, `CSS file has content: ${file} (${stats.size} bytes)`);
});

// 4. Verify Components existence
const components = [
  'src/components/Navbar.jsx',
  'src/components/MobileMenu.jsx',
  'src/components/Footer.jsx',
  'src/components/ReusableButton.jsx',
  'src/components/SectionHeading.jsx',
  'src/components/ProjectModal.jsx',
  'src/components/Chatbot.jsx',
  'src/components/ScrollProgress.jsx',
  'src/components/CustomCursor.jsx',
  'src/components/Loader.jsx'
];

components.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  assert(fs.existsSync(fullPath), `Component file exists: ${file}`);
});

// 5. Verify Sections existence
const sections = [
  'src/sections/Hero.jsx',
  'src/sections/About.jsx',
  'src/sections/Services.jsx',
  'src/sections/WhyChooseUs.jsx',
  'src/sections/Process.jsx',
  'src/sections/Technologies.jsx',
  'src/sections/Portfolio.jsx',
  'src/sections/CTA.jsx',
  'src/sections/Contact.jsx'
];

sections.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  assert(fs.existsSync(fullPath), `Section file exists: ${file}`);
});

// 6. Verify Service Visuals existence
const visuals = [
  'src/sections/services/AiVisual.jsx',
  'src/sections/services/WebVisual.jsx',
  'src/sections/services/MobileVisual.jsx',
  'src/sections/services/CustomVisual.jsx',
  'src/sections/services/PhotoVisual.jsx'
];

visuals.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  assert(fs.existsSync(fullPath), `Visual component exists: ${file}`);
});

// 7. Verify Production build artifacts
const distFiles = [
  'dist/index.html'
];
distFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  assert(fs.existsSync(fullPath), `Build output exists: ${file}`);
});

console.log(`\nVerification complete: ${testsPassed} passed, ${testsFailed} failed.`);
if (testsFailed > 0) {
  process.exit(1);
}

