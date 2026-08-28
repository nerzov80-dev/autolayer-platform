import type { Context } from "hono";
import {
  createClient,
  deleteClient,
  getClientById,
  listClients,
  updateClient,
  type CreateClientInput,
  type UpdateClientInput,
} from "./service";

interface ClientsEnv {
  DB: D1Database;
}

export async function getClients(
  c: Context<{ Bindings: ClientsEnv }>,
) {
  try {
    const clients = await listClients(c.env.DB);

    return c.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("List clients error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to retrieve clients.",
      },
      500,
    );
  }
}

export async function getClient(
  c: Context<{ Bindings: ClientsEnv }>,
) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Client ID is required.",
        },
        400,
      );
    }

    const client = await getClientById(c.env.DB, id);

    if (!client) {
      return c.json(
        {
          success: false,
          error: "Client not found.",
        },
        404,
      );
    }

    return c.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("Get client error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to retrieve client.",
      },
      500,
    );
  }
}

export async function postClient(
  c: Context<{ Bindings: ClientsEnv }>,
) {
  try {
    const body = await c.req.json<CreateClientInput>();

    const client = await createClient(c.env.DB, body);

    return c.json(
      {
        success: true,
        client,
      },
      201,
    );
  } catch (error) {
    console.error("Create client error:", error);

    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create client.",
      },
      400,
    );
  }
}

export async function putClient(
  c: Context<{ Bindings: ClientsEnv }>,
) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Client ID is required.",
        },
        400,
      );
    }

    const body = await c.req.json<UpdateClientInput>();

    const client = await updateClient(c.env.DB, id, body);

    if (!client) {
      return c.json(
        {
          success: false,
          error: "Client not found.",
        },
        404,
      );
    }

    return c.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("Update client error:", error);

    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update client.",
      },
      400,
    );
  }
}

export async function removeClient(
  c: Context<{ Bindings: ClientsEnv }>,
) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: "Client ID is required.",
        },
        400,
      );
    }

    const deleted = await deleteClient(c.env.DB, id);

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: "Client not found.",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    console.error("Delete client error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to delete client.",
      },
      500,
    );
  }
        }
