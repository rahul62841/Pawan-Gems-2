import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function ensureDbTables() {
  // Create minimal users and sessions tables if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      is_admin boolean DEFAULT false,
      created_at timestamptz DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      session_id text PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now()
    );

    -- ensure products table exists (matches shared/schema.ts)
    CREATE TABLE IF NOT EXISTS products (
      id serial PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL,
      price integer NOT NULL,
      image_url text NOT NULL,
      category text NOT NULL,
      is_featured boolean DEFAULT false,
      created_at timestamptz DEFAULT now()
    );

    -- order requests from customers to admins
    CREATE TABLE IF NOT EXISTS order_requests (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity integer NOT NULL DEFAULT 1,
      message text,
      status text NOT NULL DEFAULT 'pending',
      admin_message text,
      created_at timestamptz DEFAULT now()
    );

    -- ensure existing users table has is_admin column (added for older databases)
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='is_admin'
      ) THEN
        ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
      END IF;
    END$$;
  `);
}
