import { Hono } from "hono";
import { cors } from "hono/cors";

import { login, me } from "./modules/auth/controller";
import { setupAdmin, hasAdmin } from "./modules/auth/setup";
import { authMiddleware, requireRole } from "./middlewares/auth";

import {
  getClients,
  getClient,
  postClient,
  putClient,
  removeClient,
} from "./modules/clients/controller";

import {
  getLandingPages,
  getLandingPage,
  postLandingPage,
  putLandingPage,
  deleteLandingPage,
} from "./modules/landing-pages/controller";

import { domainRouter } from "./middlewares/domain-router";

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  ASSETS: Fetcher;
  APP_ENV: string;
  JWT_SECRET: string;
};

type Variables = {
  userId: string;
  email: string;
  role: "admin" | "client";
  clientId: string | null;
  auth: {
    userId: string;
    email: string;
    role: "admin" | "client";
    clientId?: string | null;
  };
};

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

/* ---------------- HEALTH ---------------- */

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    status: "ok",
    environment: c.env.APP_ENV || "production",
  });
});

/* ---------------- INITIAL SETUP ---------------- */

app.get("/api/auth/setup/status", async (c) => {
  try {
    const adminExists = await hasAdmin(c.env);

    return c.json({
      success: true,
      adminExists,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to check setup status.",
      },
      500,
    );
  }
});

app.post("/api/auth/setup", async (c) => {
  try {
    const adminExists = await hasAdmin(c.env);

    if (adminExists) {
      return c.json(
        {
          success: false,
          error: "An administrator account already exists.",
        },
        409,
      );
    }

    const body = await c.req.json<{
      email?: string;
      password?: string;
    }>();

    if (!body.email || !body.password) {
      return c.json(
        {
          success: false,
          error: "Email and password are required.",
        },
        400,
      );
    }

    const admin = await setupAdmin(c.env, {
      email: body.email,
      password: body.password,
    });

    return c.json({
      success: true,
      user: admin,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create administrator account.",
      },
      400,
    );
  }
});

/* ---------------- AUTH ---------------- */

app.post("/api/auth/login", login);

app.get("/api/auth/me", authMiddleware, me);

/* ---------------- CLIENTS ---------------- */

app.get(
  "/api/clients",
  authMiddleware,
  requireRole("admin"),
  getClients,
);

app.get(
  "/api/clients/:id",
  authMiddleware,
  requireRole("admin"),
  getClient,
);

app.post(
  "/api/clients",
  authMiddleware,
  requireRole("admin"),
  postClient,
);

app.put(
  "/api/clients/:id",
  authMiddleware,
  requireRole("admin"),
  putClient,
);

app.delete(
  "/api/clients/:id",
  authMiddleware,
  requireRole("admin"),
  removeClient,
);

/* ---------------- LANDING PAGES ---------------- */

app.get(
  "/api/landing-pages",
  authMiddleware,
  requireRole("admin", "client"),
  getLandingPages,
);

app.get(
  "/api/landing-pages/:id",
  authMiddleware,
  requireRole("admin", "client"),
  getLandingPage,
);

app.post(
  "/api/landing-pages",
  authMiddleware,
  requireRole("admin", "client"),
  postLandingPage,
);

app.put(
  "/api/landing-pages/:id",
  authMiddleware,
  requireRole("admin", "client"),
  putLandingPage,
);

app.delete(
  "/api/landing-pages/:id",
  authMiddleware,
  requireRole("admin"),
  deleteLandingPage,
);

/* ---------------- DOMAIN ROUTER ---------------- */

app.use("*", domainRouter);

/* ---------------- FALLBACK ---------------- */

app.all("*", async (c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json(
      {
        success: false,
        error: "API route not found.",
      },
      404,
    );
  }

  const assetResponse = await c.env.ASSETS.fetch(c.req.raw);

  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const indexRequest = new Request(
    new URL("/index.html", c.req.url),
    c.req.raw,
  );

  return c.env.ASSETS.fetch(indexRequest);
});

export default app;
