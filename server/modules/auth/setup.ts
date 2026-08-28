import { hashPassword } from "./hash";

export interface SetupEnv {
  DB: D1Database;
}

export interface SetupAdminInput {
  email: string;
  password: string;
}

export async function setupAdmin(
  env: SetupEnv,
  input: SetupAdminInput,
): Promise<{ id: string; email: string; role: "admin" }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email) {
    throw new Error("Admin email is required.");
  }

  if (!password || password.length < 8) {
    throw new Error("Admin password must be at least 8 characters.");
  }

  const existing = await env.DB
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .bind(email)
    .first<{ id: string }>();

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await env.DB
    .prepare(
      `INSERT INTO users (
        id,
        email,
        password_hash,
        role,
        client_id,
        created_at
      ) VALUES (?, ?, ?, 'admin', NULL, CURRENT_TIMESTAMP)`,
    )
    .bind(id, email, passwordHash)
    .run();

  return {
    id,
    email,
    role: "admin",
  };
}

export async function hasAdmin(env: SetupEnv): Promise<boolean> {
  const admin = await env.DB
    .prepare(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
    )
    .first<{ id: string }>();

  return Boolean(admin);
}
