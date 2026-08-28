import type { Context } from "hono";

interface LandingPagesEnv {
  DB: D1Database;
}

interface LandingPageRecord {
  id: string;
  client_id: string;
  template_id: string;
  status: "draft" | "published";
  slug: string;
  custom_domain: string | null;
  tracking_meta_pixel: string | null;
  tracking_tiktok_pixel: string | null;
  tracking_ga_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateLandingPageInput {
  clientId: string;
  templateId: string;
  slug: string;
  customDomain?: string | null;
  trackingMetaPixel?: string | null;
  trackingTiktokPixel?: string | null;
  trackingGaId?: string | null;
}

interface UpdateLandingPageInput {
  templateId?: string;
  status?: "draft" | "published";
  slug?: string;
  customDomain?: string | null;
  trackingMetaPixel?: string | null;
  trackingTiktokPixel?: string | null;
  trackingGaId?: string | null;
}

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

async function getLandingPageById(
  db: D1Database,
  id: string,
): Promise<LandingPageRecord | null> {
  return db
    .prepare(
      `SELECT
        id,
        client_id,
        template_id,
        status,
        slug,
        custom_domain,
        tracking_meta_pixel,
        tracking_tiktok_pixel,
        tracking_ga_id,
        created_at,
        updated_at
      FROM landing_pages
      WHERE id = ?
      LIMIT 1`,
    )
    .bind(id)
    .first<LandingPageRecord>();
}

export async function getLandingPages(
  c: Context<{ Bindings: LandingPagesEnv }>,
) {
  try {
    const clientId = c.req.query("clientId");

    const query = clientId
      ? `SELECT
          id,
          client_id,
          template_id,
          status,
          slug,
          custom_domain,
          tracking_meta_pixel,
          tracking_tiktok_pixel,
          tracking_ga_id,
          created_at,
          updated_at
        FROM landing_pages
        WHERE client_id = ?
        ORDER BY created_at DESC`
      : `SELECT
          id,
          client_id,
          template_id,
          status,
          slug,
          custom_domain,
          tracking_meta_pixel,
          tracking_tiktok_pixel,
          tracking_ga_id,
          created_at,
          updated_at
        FROM landing_pages
        ORDER BY created_at DESC`;

    const statement = clientId
      ? c.env.DB.prepare(query).bind(clientId)
      : c.env.DB.prepare(query);

    const result = await statement.all<LandingPageRecord>();

    return c.json({
      success: true,
      landingPages: result.results ?? [],
    });
  } catch (error) {
    console.error("List landing pages error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to retrieve landing pages.",
      },
      500,
    );
  }
}

export async function getLandingPage(
  c: Context<{ Bindings: LandingPagesEnv }>,
) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Landing page ID is required.",
        },
        400,
      );
    }

    const landingPage = await getLandingPageById(c.env.DB, id);

    if (!landingPage) {
      return c.json(
        {
          success: false,
          error: "Landing page not found.",
        },
        404,
      );
    }

    return c.json({
      success: true,
      landingPage,
    });
  } catch (error) {
    console.error("Get landing page error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to retrieve landing page.",
      },
      500,
    );
  }
}

export async function postLandingPage(
  c: Context<{ Bindings: LandingPagesEnv }>,
) {
  try {
    const body = await c.req.json<CreateLandingPageInput>();

    const clientId = body.clientId?.trim();
    const templateId = body.templateId?.trim();
    const slug = normalizeSlug(body.slug ?? "");

    if (!clientId || !templateId || !slug) {
      return c.json(
        {
          success: false,
          error: "clientId, templateId and slug are required.",
        },
        400,
      );
    }

    const client = await c.env.DB
      .prepare("SELECT id FROM clients WHERE id = ? LIMIT 1")
      .bind(clientId)
      .first<{ id: string }>();

    if (!client) {
      return c.json(
        {
          success: false,
          error: "Client not found.",
        },
        404,
      );
    }

    const existingSlug = await c.env.DB
      .prepare(
        "SELECT id FROM landing_pages WHERE slug = ? LIMIT 1",
      )
      .bind(slug)
      .first<{ id: string }>();

    if (existingSlug) {
      return c.json(
        {
          success: false,
          error: "A landing page with this slug already exists.",
        },
        409,
      );
    }

    const id = crypto.randomUUID();

    await c.env.DB
      .prepare(
        `INSERT INTO landing_pages (
          id,
          client_id,
          template_id,
          status,
          slug,
          custom_domain,
          tracking_meta_pixel,
          tracking_tiktok_pixel,
          tracking_ga_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      )
      .bind(
        id,
        clientId,
        templateId,
        slug,
        body.customDomain?.trim() || null,
        body.trackingMetaPixel?.trim() || null,
        body.trackingTiktokPixel?.trim() || null,
        body.trackingGaId?.trim() || null,
      )
      .run();

    const landingPage = await getLandingPageById(c.env.DB, id);

    return c.json(
      {
        success: true,
        landingPage,
      },
      201,
    );
  } catch (error) {
    console.error("Create landing page error:", error);

    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create landing page.",
      },
      400,
    );
  }
}

export async function putLandingPage(
  c: Context<{ Bindings: LandingPagesEnv }>,
) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Landing page ID is required.",
        },
        400,
      );
    }

    const existing = await getLandingPageById(c.env.DB, id);

    if (!existing) {
      return c.json(
        {
          success: false,
          error: "Landing page not found.",
        },
        404,
      );
    }

    const body = await c.req.json<UpdateLandingPageInput>();

    const templateId =
      body.templateId?.trim() || existing.template_id;

    const slug =
      body.slug !== undefined
        ? normalizeSlug(body.slug)
        : existing.slug;

    if (!templateId || !slug) {
      return c.json(
        {
          success: false,
          error: "templateId and slug are required.",
        },
        400,
      );
    }

    if (slug !== existing.slug) {
      const duplicate = await c.env.DB
        .prepare(
          "SELECT id FROM landing_pages WHERE slug = ? AND id != ? LIMIT 1",
        )
        .bind(slug, id)
        .first<{ id: string }>();

      if (duplicate) {
        return c.json(
          {
            success: false,
            error: "A landing page with this slug already exists.",
          },
          409,
        );
      }
    }

    await c.env.DB
      .prepare(
        `UPDATE landing_pages
        SET
          template_id = ?,
          status = ?,
          slug = ?,
          custom_domain = ?,
          tracking_meta_pixel = ?,
          tracking_tiktok_pixel = ?,
          tracking_ga_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      )
      .bind(
        templateId,
        body.status ?? existing.status,
        slug,
        body.customDomain !== undefined
          ? body.customDomain?.trim() || null
          : existing.custom_domain,
        body.trackingMetaPixel !== undefined
          ? body.trackingMetaPixel?.trim() || null
          : existing.tracking_meta_pixel,
        body.trackingTiktokPixel !== undefined
          ? body.trackingTiktokPixel?.trim() || null
          : existing.tracking_tiktok_pixel,
        body.trackingGaId !== undefined
          ? body.trackingGaId?.trim() || null
          : existing.tracking_ga_id,
        id,
      )
      .run();

    const landingPage = await getLandingPageById(c.env.DB, id);

    return c.json({
      success: true,
      landingPage,
    });
  } catch (error) {
    console.error("Update landing page error:", error);

    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update landing page.",
      },
      400,
    );
  }
}

export async function deleteLandingPage(
  c: Context<{ Bindings: LandingPagesEnv }>,
) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Landing page ID is required.",
        },
        400,
      );
    }

    const result = await c.env.DB
      .prepare("DELETE FROM landing_pages WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return c.json(
        {
          success: false,
          error: "Landing page not found.",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "Landing page deleted successfully.",
    });
  } catch (error) {
    console.error("Delete landing page error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to delete landing page.",
      },
      500,
    );
  }
        }
