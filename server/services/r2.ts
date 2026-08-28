export interface R2Env {
  R2: R2Bucket;
}

export function getR2(env: R2Env): R2Bucket {
  if (!env.R2) {
    throw new Error("R2 bucket binding is not configured.");
  }

  return env.R2;
}

export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
  contentType?: string,
): Promise<R2Object> {
  return bucket.put(key, body, {
    httpMetadata: contentType
      ? {
          contentType,
        }
      : undefined,
  });
}

export async function getFile(
  bucket: R2Bucket,
  key: string,
): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

export async function deleteFile(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  await bucket.delete(key);
}
