import type { Context } from "hono";
import { createToken } from "./jwt";
import { verifyPassword } from "./hash";

interface AuthEnv {
  DB: D1Database;
  JWT_SECRET: string;
}

interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: "admin" | "client";
  client_id: string | null;
}

export async function login(c: Context<{ Bindings: AuthEnv }>) {
  try {
    const body = await c.req.json<{
      email?: string;
      password?: string;
    }>();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return c.json(
        { success: false, error: "Email and password are required." },
        400,
      );
    }

    if (!c.env.JWT_SECRET) {
      return c.json(
        { success: false, error: "JWT secret is not configured." },
        500,
      );
    }

    const user = await c.env.DB
      .prepare(
        `SELECT
          id,
          email,
          password_hash,
          role,
          client_id
        FROM users
        WHERE email = ?
        LIMIT 1`,
      )
      .bind(email)
      .first<UserRecord>();

    if (!user) {
      return c.json(
        { success: false, error: "Invalid email or password." },
        401,
      );
    }

    const validPassword = await verifyPassword(
      password,
      user.password_hash,
    );

    if (!validPassword) {
      return c.json(
        { success: false, error: "Invalid email or password." },
        401,
      );
    }

    const token = await createToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        clientId: user.client_id,
      },
      c.env.JWT_SECRET,
    );

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.client_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to process login request.",
      },
      500,
    );
  }
}

export async function me(c: Context<{ Bindings: AuthEnv }>) {
  try {
    const userId = c.get("userId" as never) as string | undefined;

    if (!userId) {
      return c.json(
        { success: false, error: "Unauthorized." },
        401,
      );
    }

    const user = await c.env.DB
      .prepare(
        `SELECT
          id,
          email,
          role,
          client_id
        FROM users
        WHERE id = ?
        LIMIT 1`,
      )
      .bind(userId)
      .first<{
        id: string;
        email: string;
        role: "admin" | "client";
        client_id: string | null;
      }>();

    if (!user) {
      return c.json(
        { success: false, error: "User not found." },
        404,
      );
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.client_id,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to retrieve authenticated user.",
      },
      500,
    );
  }
}
