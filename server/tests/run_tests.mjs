import { runDbConnectionTests } from './db_connection.test.mjs';

async function main() {
  // 1. Run DB connection and Atlas safety suite
  await runDbConnectionTests();

  // 2. Run API integration test suite
  await import('./server.test.mjs');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
