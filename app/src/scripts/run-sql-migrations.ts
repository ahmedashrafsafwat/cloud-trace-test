import path from 'path';
import fs from 'fs';
import knex from 'knex';
import config from '../config';

async function main() {
  if (!['development', 'test', 'testing'].includes(process.env.NODE_ENV)) {
    throw new Error('run-sql-migrations can only be run in dev environment');
  }

  const db = knex({
    client: 'pg',
    connection: config.DATABASE_URL,
    debug: false,
  });
  const baseDir = path.join(__dirname, '../db/queries');
  const files = fs.readdirSync(baseDir);
  files.sort();
  for (const file of files) {
    const content = fs.readFileSync(path.join(baseDir, file), 'utf8');
    const statements = content.split(';');
    // Run unsafe queries one by one. Never run this against production!
    for (const statement of statements) {
      await db.raw(statement);
    }
  }
}
main()
  .then(() => void process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
