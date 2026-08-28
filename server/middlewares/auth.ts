import type { Context, Next } from "hono";
import { verifyToken, type AuthTokenPayload } from "../modules/auth/jwt";

export interface AuthEnv {
  JWT_SECRET: string;
}

export interface AuthVariables {
  userId: string;
  email: string;
  role: "admin" | "client";
  clientId: string | null;
  auth: AuthTokenPayload;
}

export async function authMiddleware(
  c: Context<{ Bindings: AuthEnv; Variables: AuthVariables }>,
  next: Next,
) {
  const authorization = c.req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: "Authentication required.",
      },
      401,
    );
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return c.json(
      {
        success: false,
        error: "Authentication token is missing.",
      },
      401,
    );
  }

  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    c.set("userId", payload.userId);
    c.set("email", payload.email);
    c.set("role", payload.role);
    c.set("clientId", payload.clientId ?? null);
    c.set("auth", payload);

    await next();
  } catch (error) {
    console.error("Authentication error:", error);

    return c.json(
      {
        success: false,
        error: "Invalid or expired authentication token.",
      },
      401,
    );
  }
}

export function requireRole(
  ...allowedRoles: Array<"admin" | "client">
) {
  return async (
    c: Context<{
      Bindings: AuthEnv;
      Variables: AuthVariables;
    }>,
    next: Next,
  ) => {
    const role = c.get("role");

    if (!role || !allowedRoles.includes(role)) {
      return c.json(
        {
          success: false,
          error: "You do not have permission to access this resource.",
        },
        403,
      );
    }

    await next();
  };
}
