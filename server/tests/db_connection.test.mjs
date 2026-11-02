import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB, getConnectionStatus } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { sanitizeMongoUri, redactMongoUri } from '../src/utils/mongoUri.js';
import { seedDatabase } from '../src/scripts/seed.js';
import { setupInitialAdmin } from '../src/scripts/setupAdmin.js';
import Admin from '../src/models/Admin.js';
import Company from '../src/models/Company.js';
import Service from '../src/models/Service.js';
import Project from '../src/models/Project.js';
import Technology from '../src/models/Technology.js';

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

export async function runDbConnectionTests() {
  console.log('\n======================================================');
  console.log('--- STARTING DWARIX DATABASE CONNECTION & ATLAS SUITE ---');
  console.log('======================================================\n');

  try {
    // ------------------------------------------------------------------
    // TEST 1: URI Sanitization & Special Characters (%40 encoding for @)
    // ------------------------------------------------------------------
    const rawUriWithAt = 'mongodb+srv://test_cluster_user:SecretPass@2026@sample-cluster.abcde.mongodb.net/test_db?retryWrites=true&w=majority';
    const sanitizedUri = sanitizeMongoUri(rawUriWithAt);
    assert(
      sanitizedUri.includes('SecretPass%402026'),
      'URI Sanitizer correctly percent-encodes unencoded "@" in password to "%40"'
    );
    assert(
      !sanitizedUri.includes(':SecretPass@2026@'),
      'URI Sanitizer eliminates conflicting "@" delimiter in authentication section'
    );

    const redacted = redactMongoUri(sanitizedUri);
    assert(
      !redacted.includes('SecretPass'),
      'URI Redacter completely conceals password secret from log outputs'
    );
    assert(
      redacted.includes('****@'),
      'URI Redacter formats credentials safely as ****@cluster'
    );

    // ------------------------------------------------------------------
    // TEST 2: Invalid Credentials Rejection (No Silent In-Memory Fallback)
    // ------------------------------------------------------------------
    let invalidAuthCaught = false;
    try {
      await connectDB('mongodb+srv://invalid_user:wrong_password@dwarix-cluster.0rkiqyb.mongodb.net/dwarix_db?retryWrites=true&w=majority');
    } catch (err) {
      invalidAuthCaught = true;
      assert(
        !err.message.includes('wrong_password'),
        'Authentication error message does not leak raw password'
      );
    }
    assert(invalidAuthCaught, 'connectDB throws error on invalid Atlas credentials');

    const statusAfterBadAuth = getConnectionStatus();
    assert(
      statusAfterBadAuth.connected === false,
      'Failed authentication leaves database disconnected (no silent in-memory fallback)'
    );

    // ------------------------------------------------------------------
    // TEST 3: Unavailable Database Rejection (Strict Failure)
    // ------------------------------------------------------------------
    let unavailableCaught = false;
    try {
      // Port 59998 is closed
      await connectDB('mongodb://127.0.0.1:59998/dwarix_unreachable_db');
    } catch (err) {
      unavailableCaught = true;
    }
    assert(unavailableCaught, 'connectDB throws error when database is unreachable');

    const statusAfterUnreach = getConnectionStatus();
    assert(
      statusAfterUnreach.connected === false,
      'Unreachable database leaves state disconnected (no silent in-memory fallback)'
    );

    // ------------------------------------------------------------------
    // TEST 4: Health Check Endpoint Reports Unhealthy When Disconnected
    // ------------------------------------------------------------------
    const healthDownRes = await request(app).get('/api/health');
    assert(
      healthDownRes.status === 503,
      'GET /api/health returns HTTP 503 when database is disconnected'
    );
    assert(
      healthDownRes.body.status === 'unhealthy' && healthDownRes.body.database.status === 'disconnected',
      'GET /api/health reports status="unhealthy" and database.status="disconnected"'
    );

    // ------------------------------------------------------------------
    // TEST 5: Explicit Opt-In In-Memory Database Mode
    // ------------------------------------------------------------------
    const memConn = await connectDB('memory');
    assert(memConn && memConn.connection.readyState === 1, 'connectDB("memory") initializes opt-in in-memory instance');

    const statusInMem = getConnectionStatus();
    assert(
      statusInMem.connected === true && statusInMem.databaseType === 'in-memory',
      'getConnectionStatus reports databaseType="in-memory" and connected=true'
    );

    const healthUpRes = await request(app).get('/api/health');
    assert(
      healthUpRes.status === 200 && healthUpRes.body.status === 'healthy',
      'GET /api/health returns HTTP 200 when database is connected'
    );
    assert(
      healthUpRes.body.database.status === 'connected',
      'GET /api/health includes active database details'
    );

    // ------------------------------------------------------------------
    // TEST 6: Safe Seeding Without Overwriting Existing Production Records
    // ------------------------------------------------------------------
    await seedDatabase({ allowAdminCreation: false });
    const initialServiceCount = await Service.countDocuments();
    const initialProjectCount = await Project.countDocuments();
    assert(initialServiceCount === 5, 'Safe seed provisions all 5 core services');
    assert(initialProjectCount === 4, 'Safe seed provisions all 4 production projects');

    // Mutate existing company record to verify it will not be overwritten
    const company = await Company.findOne();
    assert(company !== null, 'Company profile exists in database');
    company.tagline = 'Custom Production Tagline Never Overwritten';
    await company.save();

    // Re-run seed: must preserve existing custom records
    await seedDatabase({ allowAdminCreation: false });
    const reloadedCompany = await Company.findOne();
    assert(
      reloadedCompany.tagline === 'Custom Production Tagline Never Overwritten',
      'Safe seed NEVER overwrites existing company profile records'
    );
    const postReSeedProjects = await Project.countDocuments();
    assert(
      postReSeedProjects === initialProjectCount,
      'Safe seed does not duplicate or overwrite existing projects'
    );

    // ------------------------------------------------------------------
    // TEST 7: Secure Administrator Setup (No Hardcoded Insecure Admin)
    // ------------------------------------------------------------------
    const adminCountBefore = await Admin.countDocuments();
    assert(adminCountBefore === 0, 'Safe seed does not auto-create admin with hardcoded default password');

    // Setup admin with invalid short password
    let shortPassRejected = false;
    try {
      await setupInitialAdmin({ email: 'admin@dwarix.com', password: 'short' });
    } catch {
      shortPassRejected = true;
    }
    assert(shortPassRejected, 'setupInitialAdmin rejects passwords under 8 characters');

    // Setup admin with valid secure credentials
    const newAdmin = await setupInitialAdmin({
      email: 'secadmin@dwarix.com',
      password: 'SecureProdPassword2026!',
      name: 'DWARIX Lead Engineer'
    });
    assert(newAdmin && newAdmin.email === 'secadmin@dwarix.com', 'setupInitialAdmin successfully creates administrator');

    const adminInDb = await Admin.findOne({ email: 'secadmin@dwarix.com' });
    assert(
      adminInDb.passwordHash !== 'SecureProdPassword2026!' && adminInDb.passwordHash.startsWith('$2'),
      'Administrator password is encrypted with bcrypt hash before storing'
    );

    // Re-running setup does not overwrite existing admin
    const duplicateAdmin = await setupInitialAdmin({
      email: 'secadmin@dwarix.com',
      password: 'AnotherPassword999!'
    });
    assert(
      duplicateAdmin._id.toString() === adminInDb._id.toString(),
      'setupInitialAdmin preserves existing admin without overwriting'
    );

    await disconnectDB();

    // ------------------------------------------------------------------
    // TEST 8: Successful Atlas Connection (with URL-Encoded Password)
    // ------------------------------------------------------------------
    if (env.MONGODB_URI && env.MONGODB_URI.includes('mongodb.net')) {
      console.log('\n[Atlas Verification] Testing live connection to configured MongoDB Atlas cluster...');
      const atlasConn = await connectDB(env.MONGODB_URI);
      assert(
        atlasConn && atlasConn.connection.readyState === 1,
        'Mongoose connects successfully to live MongoDB Atlas cluster'
      );

      const atlasStatus = getConnectionStatus();
      assert(atlasStatus.connected === true, 'Atlas connection reports connected=true');
      assert(atlasStatus.databaseType === 'atlas', 'Atlas connection reports databaseType="atlas"');
      assert(
        !atlasStatus.configuredTarget.includes('Dwarix'),
        'Atlas connection target in health status hides password'
      );

      await disconnectDB();
    } else {
      console.log('ℹ Skipping live Atlas check (no Atlas URI configured in test environment).');
    }

  } catch (err) {
    console.error('Unexpected test error in DB suite:', err);
    failed++;
  }

  console.log('\n==========================================');
  console.log(`DB TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================\n');

  if (failed > 0) {
    throw new Error(`${failed} tests failed in db_connection.test.mjs`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('db_connection.test.mjs')) {
  runDbConnectionTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
