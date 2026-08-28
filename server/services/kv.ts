export interface KVEnv {
  KV: KVNamespace;
}

export function getKV(env: KVEnv): KVNamespace {
  if (!env.KV) {
    throw new Error("KV namespace binding is not configured.");
  }

  return env.KV;
}

export async function getValue<T = string>(
  kv: KVNamespace,
  key: string,
): Promise<T | null> {
  return kv.get<T>(key, "json");
}

export async function putValue(
  kv: KVNamespace,
  key: string,
  value: unknown,
  expirationTtl?: number,
): Promise<void> {
  const options = expirationTtl
    ? { expirationTtl }
    : undefined;

  await kv.put(key, JSON.stringify(value), options);
}

export async function deleteValue(
  kv: KVNamespace,
  key: string,
): Promise<void> {
  await kv.delete(key);
}
