import { Hono } from "hono";
import { cors } from "hono/cors";

import { login, me } from "./modules/auth/controller";
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

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    status: "ok",
    environment: c.env.APP_ENV || "production",
  });
});

app.post("/api/auth/login", login);

app.get("/api/auth/me", authMiddleware, me);

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

app.use("*", domainRouter);

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
