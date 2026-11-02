import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import Admin from '../models/Admin.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) options.email = args[++i];
    if (args[i] === '--password' && args[i + 1]) options.password = args[++i];
    if (args[i] === '--name' && args[i + 1]) options.name = args[++i];
  }
  return options;
}

export async function setupInitialAdmin(options = {}) {
  const cliArgs = parseArgs();
  const email = (options.email || cliArgs.email || env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = options.password || cliArgs.password || env.INITIAL_ADMIN_PASSWORD || '';
  const name = (options.name || cliArgs.name || env.INITIAL_ADMIN_NAME || 'DWARIX Superadmin').trim();

  if (!email || !password) {
    throw new Error(
      'Missing administrator credentials. Provide --email <email> --password <password> or set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD.'
    );
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`Invalid email address format: "${email}"`);
  }

  // Password strength validation
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long for security.');
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`ℹ Administrator with email "${email}" already exists. (ID: ${existing._id})`);
    return existing;
  }

  console.log(`[Admin Setup] Creating superadmin account for: ${email}`);
  const admin = new Admin({
    name,
    email,
    passwordHash: password, // Will be securely hashed via bcrypt in Admin pre-save hook
    role: 'superadmin',
    isActive: true
  });

  await admin.save();
  console.log(`✓ Superadmin account created successfully for "${email}".`);
  return admin;
}

if (process.argv[1] && process.argv[1].endsWith('setupAdmin.js')) {
  (async () => {
    try {
      await connectDB();
      await setupInitialAdmin();
      await disconnectDB();
      console.log('\n==========================================');
      console.log('✓ Administrator setup finished.');
      console.log('==========================================\n');
      process.exit(0);
    } catch (err) {
      console.error('\n❌ Admin setup failed:', err.message);
      process.exit(1);
    }
  })();
}

export default setupInitialAdmin;

