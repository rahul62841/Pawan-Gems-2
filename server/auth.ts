import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

type StoredUser = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

const users = new Map<string, StoredUser>(); // key = email
let nextId = 1;

const sessions = new Map<string, number>(); // sessionId -> userId

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  const normalized = email.toLowerCase();
  if (users.has(normalized)) throw new Error("User already exists");
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const user: StoredUser = {
    id: nextId++,
    name,
    email: normalized,
    passwordHash: hash,
  };
  users.set(normalized, user);
  return { id: user.id, name: user.name, email: user.email };
}

export async function findUserByEmail(email: string) {
  return users.get(email.toLowerCase());
}

export async function verifyPassword(email: string, password: string) {
  const user = users.get(email.toLowerCase());
  if (!user) return null;
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export function createSession(userId: number) {
  const sessionId = randomBytes(24).toString("hex");
  sessions.set(sessionId, userId);
  return sessionId;
}

export function getUserIdBySession(sessionId?: string | null) {
  if (!sessionId) return undefined;
  return sessions.get(sessionId);
}

export function destroySession(sessionId?: string | null) {
  if (!sessionId) return;
  sessions.delete(sessionId);
}

export function getUserById(id: number) {
  for (const u of users.values())
    if (u.id === id) return { id: u.id, name: u.name, email: u.email };
  return undefined;
}
