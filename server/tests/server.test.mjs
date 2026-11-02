import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import Admin from '../src/models/Admin.js';
import Service from '../src/models/Service.js';
import Project from '../src/models/Project.js';
import Technology from '../src/models/Technology.js';
import Company from '../src/models/Company.js';
import Enquiry from '../src/models/Enquiry.js';

let mongod;
let adminCookie;
let adminToken;
let testEnquiryId;
let testProjectId;

async function runTests() {
  console.log('--- STARTING DWARIX SERVER INTEGRATION TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Setup in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`Connected to in-memory MongoDB: ${uri}\n`);

    // Setup initial seed data
    const testAdmin = new Admin({
      name: 'Super Admin',
      email: 'admin@dwarix.com',
      passwordHash: 'DwarixSecret2026!',
      role: 'superadmin',
      isActive: true
    });
    await testAdmin.save();

    await Service.create({
      title: 'AI & Machine Learning',
      slug: 'ai-and-ml',
      shortDescription: 'AI automation and ML solutions',
      displayOrder: 1,
      isActive: true
    });

    await Project.create({
      title: 'FinEdge Platform',
      slug: 'finedge-platform',
      category: 'Web Applications',
      shortDescription: 'Financial analytics',
      technologies: ['React', 'Node.js'],
      status: 'published'
    });

    await Technology.create({
      name: 'React',
      category: 'Frontend',
      color: '#149ECA',
      displayOrder: 1,
      isActive: true
    });

    await Company.create({
      companyName: 'DWARIX Technologies',
      email: 'contact@dwarix.com'
    });

    // 2. Health check
    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'healthy', 'Health check returns status 200 & healthy');

    // 3. Public Endpoints
    const companyRes = await request(app).get('/api/company');
    assert(companyRes.status === 200 && companyRes.body.data.companyName === 'DWARIX Technologies', 'GET /api/company returns company data');

    const servicesRes = await request(app).get('/api/services');
    assert(servicesRes.status === 200 && servicesRes.body.count >= 1, 'GET /api/services returns list of services');

    const projectsRes = await request(app).get('/api/projects');
    assert(projectsRes.status === 200 && projectsRes.body.count >= 1, 'GET /api/projects returns published projects');

    const techRes = await request(app).get('/api/technologies');
    assert(techRes.status === 200 && techRes.body.count >= 1, 'GET /api/technologies returns active technologies');

    // 4. Enquiry API
    // 4a. Validation failure on empty body
    const badEnquiryRes = await request(app).post('/api/enquiries').send({});
    assert(badEnquiryRes.status === 400 && badEnquiryRes.body.success === false, 'POST /api/enquiries fails validation on empty body (400)');

    // 4b. Honeypot spam trap check
    const spamEnquiryRes = await request(app).post('/api/enquiries').send({
      name: 'Spam Bot',
      email: 'bot@spam.com',
      description: 'Buy cheap watches and pills here right now',
      website: 'http://spam-link.ru' // Honeypot filled
    });
    assert(spamEnquiryRes.status === 400 && spamEnquiryRes.body.success === false, 'POST /api/enquiries traps honeypot spam bot (400)');

    // 4c. Valid enquiry submission and MongoDB persistence
    const validEnquiryRes = await request(app).post('/api/enquiries').send({
      name: 'Arjun Mehta',
      email: 'arjun@techventures.io',
      phone: '+91 9876543210',
      company: 'TechVentures',
      service: 'AI & Machine Learning',
      budget: '$25,000 - $50,000',
      description: 'We need an enterprise document search engine with RAG capabilities for 100,000 legal contracts.'
    });
    assert(validEnquiryRes.status === 201 && validEnquiryRes.body.success === true, 'POST /api/enquiries creates new lead (201)');
    testEnquiryId = validEnquiryRes.body.enquiryId;

    const savedInDb = await Enquiry.findById(testEnquiryId);
    assert(savedInDb && savedInDb.name === 'Arjun Mehta' && savedInDb.status === 'New', 'Enquiry is properly persisted in MongoDB');

    // 5. Authentication & Authorization
    // 5a. Unauthorized request rejected
    const unauthRes = await request(app).get('/api/admin/stats');
    assert(unauthRes.status === 401, 'Protected route /api/admin/stats rejects unauthenticated access (401)');

    // 5b. Bad credentials rejected
    const badLoginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@dwarix.com',
      password: 'WrongPassword123!'
    });
    assert(badLoginRes.status === 401 && badLoginRes.body.success === false, 'POST /api/auth/login rejects incorrect password (401)');

    // 5c. Valid login succeeds, returns token, sets cookie
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@dwarix.com',
      password: 'DwarixSecret2026!'
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login succeeds with valid credentials (200)');
    adminToken = loginRes.body.token;
    const cookieHeader = loginRes.headers['set-cookie'];
    assert(cookieHeader && cookieHeader.some((c) => c.includes('dwarix_admin_token')), 'Login sets httpOnly dwarix_admin_token cookie');
    adminCookie = cookieHeader ? cookieHeader[0] : '';

    // 5d. GET /api/auth/me returns admin profile
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', adminCookie);
    assert(meRes.status === 200 && meRes.body.admin.email === 'admin@dwarix.com', 'GET /api/auth/me returns authenticated admin data');

    // 6. Admin Endpoints
    // 6a. Admin Stats
    const statsRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(statsRes.status === 200 && statsRes.body.stats.enquiries.total >= 1, 'GET /api/admin/stats returns valid metrics breakdown');

    // 6b. Enquiry management (list, update status, add note)
    const enquiriesListRes = await request(app)
      .get('/api/admin/enquiries')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(enquiriesListRes.status === 200 && enquiriesListRes.body.data.length >= 1, 'GET /api/admin/enquiries lists all enquiries');

    const updateStatusRes = await request(app)
      .patch(`/api/admin/enquiries/${testEnquiryId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Proposal Sent' });
    assert(updateStatusRes.status === 200 && updateStatusRes.body.data.status === 'Proposal Sent', 'PATCH /api/admin/enquiries/:id/status updates status to "Proposal Sent"');

    // 6b-1. Retry email dispatch
    const retryEmailRes = await request(app)
      .post(`/api/admin/enquiries/${testEnquiryId}/retry-email`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert(retryEmailRes.status === 200 && retryEmailRes.body.success === true, 'POST /api/admin/enquiries/:id/retry-email dispatches email retry');

    // 6b-2. CSV export of enquiries
    const exportCsvRes = await request(app)
      .get('/api/admin/enquiries/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(exportCsvRes.status === 200 && exportCsvRes.headers['content-type'].includes('text/csv') && exportCsvRes.text.includes('Reference ID'), 'GET /api/admin/enquiries/export/csv exports valid CSV with headers');

    const addNoteRes = await request(app)
      .post(`/api/admin/enquiries/${testEnquiryId}/notes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ body: 'Scheduled initial architecture review call for Friday 3 PM.' });
    assert(addNoteRes.status === 200 && addNoteRes.body.data.notes.length === 1, 'POST /api/admin/enquiries/:id/notes appends internal admin note');

    // 6c. Project management (create, update, delete)
    const newProjRes = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'CyberShield Sentinel',
        category: 'Custom Software',
        shortDescription: 'Real-time intrusion detection platform',
        technologies: ['Node.js', 'Python', 'Docker'],
        status: 'published'
      });
    assert(newProjRes.status === 201 && newProjRes.body.data.slug === 'cybershield-sentinel', 'POST /api/admin/projects creates project with generated slug');
    testProjectId = newProjRes.body.data._id;

    const updateProjRes = await request(app)
      .put(`/api/admin/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'CyberShield Sentinel v2',
        category: 'Custom Software',
        shortDescription: 'Next-gen real-time intrusion detection platform'
      });
    assert(updateProjRes.status === 200 && updateProjRes.body.data.title === 'CyberShield Sentinel v2', 'PUT /api/admin/projects/:id updates project');

    const deleteProjRes = await request(app)
      .delete(`/api/admin/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert(deleteProjRes.status === 200, 'DELETE /api/admin/projects/:id removes project');

    // 6d. Company Settings update
    const updateCompanyRes = await request(app)
      .put('/api/admin/company')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tagline: 'Engineering the Next Generation of AI Systems' });
    assert(updateCompanyRes.status === 200 && updateCompanyRes.body.data.tagline.includes('Engineering'), 'PUT /api/admin/company updates company settings');

    // 6e. Logout
    const logoutRes = await request(app).post('/api/auth/logout');
    assert(logoutRes.status === 200, 'POST /api/auth/logout clears cookie');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
    console.log(`\n==========================================`);
    console.log(`SERVER TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==========================================\n`);
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();

