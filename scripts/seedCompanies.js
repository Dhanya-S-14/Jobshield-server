/**
 * One-off CLI seeder:  node scripts/seedCompanies.js
 * Idempotent upsert of the trusted-company registry into MongoDB.
 */
const connectDB = require('../config/db');
const { syncTrustedCompanies } = require('../services/companySeedSync');

(async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error('[seed] Could not connect to MongoDB — aborting');
    process.exit(1);
  }
  const result = await syncTrustedCompanies();
  if (result) {
    console.log('[seed] Done.');
    process.exit(0);
  }
  process.exit(1);
})();