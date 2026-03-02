import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const dbUrl = process.env.DATABASE_URL!;
const connStr = dbUrl.includes('sslmode=') ? dbUrl : (dbUrl.includes('?') ? `${dbUrl}&sslmode=require&uselibpqcompat=true` : `${dbUrl}?sslmode=require&uselibpqcompat=true`);

const pool = new Pool({
  connectionString: connStr,
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

async function verifyConnection(retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      const client = await pool.connect();
      client.release();
      console.log('Database pool connection verified');
      return;
    } catch (err: any) {
      console.error(`Database connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) await new Promise(r => setTimeout(r, i * 500));
    }
  }
}

verifyConnection();

export const db = drizzle(pool, { schema });
