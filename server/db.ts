import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 20000,
  statement_timeout: 60000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

pool.connect()
  .then(client => {
    client.release();
    console.log('Database pool connection verified');
  })
  .catch(err => {
    console.error('Database pool initial connection failed:', err.message);
  });

export const db = drizzle(pool, { schema });
