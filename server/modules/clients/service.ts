export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface CreateClientInput {
  name: string;
  phone: string;
}

export interface UpdateClientInput {
  name?: string;
  phone?: string;
  status?: "active" | "inactive";
}

export async function listClients(
  db: D1Database,
): Promise<ClientRecord[]> {
  const result = await db
    .prepare(
      `SELECT
        id,
        name,
        phone,
        status,
        created_at
      FROM clients
      ORDER BY created_at DESC`,
    )
    .all<ClientRecord>();

  return result.results ?? [];
}

export async function getClientById(
  db: D1Database,
  id: string,
): Promise<ClientRecord | null> {
  return db
    .prepare(
      `SELECT
        id,
        name,
        phone,
        status,
        created_at
      FROM clients
      WHERE id = ?
      LIMIT 1`,
    )
    .bind(id)
    .first<ClientRecord>();
}

export async function createClient(
  db: D1Database,
  input: CreateClientInput,
): Promise<ClientRecord> {
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (!name) {
    throw new Error("Client name is required.");
  }

  if (!phone) {
    throw new Error("Client phone is required.");
  }

  const id = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO clients (
        id,
        name,
        phone,
        status,
        created_at
      ) VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
    )
    .bind(id, name, phone)
    .run();

  const client = await getClientById(db, id);

  if (!client) {
    throw new Error("Failed to retrieve the created client.");
  }

  return client;
}

export async function updateClient(
  db: D1Database,
  id: string,
  input: UpdateClientInput,
): Promise<ClientRecord | null> {
  const existing = await getClientById(db, id);

  if (!existing) {
    return null;
  }

  const name = input.name?.trim() || existing.name;
  const phone = input.phone?.trim() || existing.phone;
  const status = input.status ?? existing.status;

  await db
    .prepare(
      `UPDATE clients
       SET
         name = ?,
         phone = ?,
         status = ?
       WHERE id = ?`,
    )
    .bind(name, phone, status, id)
    .run();

  return getClientById(db, id);
}

export async function deleteClient(
  db: D1Database,
  id: string,
): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM clients WHERE id = ?")
    .bind(id)
    .run();

  return result.meta.changes > 0;
}
