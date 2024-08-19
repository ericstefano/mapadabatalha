import { drizzle } from "drizzle-orm/node-postgres";
import type { H3Event } from 'h3';
import pg from 'pg';
import * as schema from '../database/schema';

async function createPostgresDb() {
  const { Pool } = pg;
  const { dbConnectionString } = useRuntimeConfig();
  const pool = new Pool({connectionString: dbConnectionString});
  await pool.connect();
  return drizzle(pool, {schema});
}

export function useDatabase(event: H3Event) {
  if (!!event.context.db) return event.context.db;
  const db =  createPostgresDb();
  event.context.db = db;
  return db;
}

declare module 'h3' {
  interface H3EventContext {
    db: ReturnType<typeof createPostgresDb> | undefined
  }
}
