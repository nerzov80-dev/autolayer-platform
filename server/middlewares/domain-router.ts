import type { Context, Next } from "hono";

interface DomainRouterEnv {
  DB: D1Database;
}

export interface DomainRoute {
  clientId: string;
  landingPageId: string;
  slug: string;
  customDomain: string | null;
}

export async function domainRouter(
  c: Context<{ Bindings: DomainRouterEnv }>,
  next: Next,
) {
  const hostname = c.req
    .header("Host")
    ?.split(":")[0]
    .toLowerCase()
    .trim();

  if (!hostname) {
    await next();
    return;
  }

  try {
    const route = await c.env.DB
      .prepare(
        `SELECT
          client_id AS clientId,
          id AS landingPageId,
          slug,
          custom_domain AS customDomain
        FROM landing_pages
        WHERE custom_domain = ?
          AND status = 'published'
        LIMIT 1`,
      )
      .bind(hostname)
      .first<DomainRoute>();

    if (route) {
      c.set("domainRoute" as never, route as never);
    }
  } catch (error) {
    console.error("Domain routing error:", error);
  }

  await next();
}
