/**
 * Syncs the trusted-company registry into the MongoDB Company collection.
 * Idempotent (upsert by exact name) — run on every boot and never duplicates.
 * Keeps DB-visible companies in sync with the deterministic registry so admin
 * search/edit and API responses reflect the same 250 trusted companies.
 */
const registry = require('../config/companies');
const Company = require('../models/Company');

async function syncTrustedCompanies() {
  try {
    const ops = registry.companies.map((c) => {
      const filter = { name: c.name };
      const update = {
        $set: {
          registeredName: c.name,
          aliases: c.aliases || [],
          shortName: c.shortName || c.name,
          domain: c.domain,
          officialDomain: c.domain,
          officialWebsite: c.officialWebsite || `https://www.${c.domain}`,
          careersUrl: c.careersUrl || `https://www.${c.domain}/careers`,
          industry: c.industry || '',
          country: c.country || '',
          companyType: c.companyType || 'Enterprise',
          verified: true,
          knownLegitimateCompany: true,
          verificationLevel: 'enterprise-verified',
          trustScore: 100,
          officialDatabaseMatch: true,
          source: 'trusted-registry',
        },
        $setOnInsert: { createdAt: new Date() },
      };
      return { updateOne: { filter, update, upsert: true } };
    });

    const result = await Company.bulkWrite(ops, { ordered: false });
    console.log(
      `[seed] Trusted companies synced: matched=${result.matchedCount}, ` +
      `upserted=${result.upsertedCount}, modified=${result.modifiedCount}`
    );
    return result;
  } catch (err) {
    console.error('[seed] Trusted companies sync failed:', err && err.message ? err.message : err);
    return null;
  }
}

module.exports = { syncTrustedCompanies };