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
  } catch (error) {
    console.error('❌ Error during E2E teardown:', error);
  } finally {
    await client.end();
  }
};
