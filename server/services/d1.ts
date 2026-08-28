export interface D1Env {
  DB: D1Database;
}

export function getDatabase(env: D1Env): D1Database {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured.");
  }

  return env.DB;
}

export async function query<T = Record<string, unknown>>(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<T>();

  return result.results ?? [];
}

export async function queryFirst<T = Record<string, unknown>>(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const result = await db
    .prepare(sql)
    .bind(...params)
    .first<T>();

  return result ?? null;
}

export async function execute(
  db: D1Database,
  sql: string,
  params: unknown[] = [],
): Promise<D1Result> {
  return db
    .prepare(sql)
    .bind(...params)
    .run();
}
