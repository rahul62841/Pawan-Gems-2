import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "./db";

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  const normalized = email.toLowerCase();
  const hash = bcrypt.hashSync(password, 10);
  const res = await pool.query(
    `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email`,
    [name, normalized, hash]
  );
  return res.rows[0];
}

export async function findUserByEmail(email: string) {
  const res = await pool.query(
    `SELECT id, name, email, password_hash FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );
  return res.rows[0];
}

export async function verifyPassword(email: string, password: string) {
  const row = await findUserByEmail(email);
  if (!row) return null;
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return null;
  return { id: row.id, name: row.name, email: row.email };
}

export async function createSession(userId: number) {
  const sessionId = randomBytes(24).toString("hex");
  await pool.query(
    `INSERT INTO sessions (session_id, user_id) VALUES ($1,$2)`,
    [sessionId, userId]
  );
  return sessionId;
}

export async function getUserIdBySession(sessionId?: string | null) {
  if (!sessionId) return undefined;
  const res = await pool.query(
    `SELECT user_id FROM sessions WHERE session_id=$1`,
    [sessionId]
  );
  return res.rows[0]?.user_id;
}

export async function destroySession(sessionId?: string | null) {
  if (!sessionId) return;
  await pool.query(`DELETE FROM sessions WHERE session_id=$1`, [sessionId]);
}

export async function getUserById(id: number) {
  const res = await pool.query(
    `SELECT id, name, email, is_admin FROM users WHERE id=$1`,
    [id]
  );
  return res.rows[0];
}
