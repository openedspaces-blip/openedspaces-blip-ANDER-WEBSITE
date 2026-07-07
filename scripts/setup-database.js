const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function readSqlFile(filePath) {
  return fs.readFileSync(filePath, 'utf8').trim();
}

async function main() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;

  if (!databaseUrl || /placeholder|example|\[password\]|\[project-ref\]/i.test(databaseUrl)) {
    console.error('SUPABASE_DATABASE_URL is required to run database setup.');
    console.error('Add it to .env locally, or run SUPABASE_RUN_THIS.sql manually in the Supabase SQL editor.');
    process.exitCode = 1;
    return;
  }

  const migrationsDir = path.resolve(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations folder not found: ${migrationsDir}`);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    throw new Error(`No SQL migrations found in ${migrationsDir}`);
  }

  const sql = migrationFiles
    .map((file) => {
      const filePath = path.join(migrationsDir, file);
      return `\n-- =========================================================\n-- ${file}\n-- =========================================================\n${readSqlFile(filePath)}\n`;
    })
    .join('\n');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log(`Supabase schema applied successfully from ${migrationFiles.length} migrations.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Database setup failed:', error.message);
  process.exitCode = 1;
});
