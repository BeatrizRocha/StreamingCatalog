import { execSync } from 'child_process';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '.env.test') });

export default async () => {
  const adminUrl = 'postgresql://user:password@localhost:5432/postgres';
  const dbName = 'streaming_catalog_test';
  const client = new Client({ connectionString: adminUrl });

  try {
    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`\n✅ Database ${dbName} created successfully.`);

    console.log('⏳ Running Prisma migrations on test database...');
    execSync('npx prisma db push', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });
    console.log('✅ Schema synchronization complete.');
  } catch (error) {
    console.error('❌ Error during E2E setup:', error);
    throw error;
  } finally {
    await client.end();
  }
};
