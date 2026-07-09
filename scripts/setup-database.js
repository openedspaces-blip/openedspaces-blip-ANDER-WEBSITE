const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const config = require('../lib/config');

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8').trim();
  if (!sql) {
    return;
  }

  console.log(`Running ${path.relative(process.cwd(), filePath)}`);
  await client.query(sql);
}

async function main() {
  const connectionString = process.env.SUPABASE_DATABASE_URL || config.supabaseDatabaseUrl;
  if (!connectionString) {
    throw new Error('SUPABASE_DATABASE_URL is required');
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const bootstrapFile = path.join(process.cwd(), 'SUPABASE_RUN_THIS.sql');
    if (fs.existsSync(bootstrapFile)) {
      await runSqlFile(client, bootstrapFile);
    }

    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter((name) => name.endsWith('.sql'))
        .sort();

      for (const fileName of files) {
        await runSqlFile(client, path.join(migrationsDir, fileName));
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
