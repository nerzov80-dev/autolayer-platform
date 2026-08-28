import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface AuthTokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "client";
  clientId?: string | null;
}

function getSecret(secret: string): Uint8Array {
  if (!secret) {
    throw new Error("JWT secret is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createToken(
  payload: AuthTokenPayload,
  secret: string,
  expiresIn: string | number = "7d",
): Promise<string> {
  const expiration =
    typeof expiresIn === "number"
      ? `${expiresIn}s`
      : expiresIn;

  return new SignJWT({
    email: payload.email,
    role: payload.role,
    clientId: payload.clientId ?? null,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(getSecret(secret));
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<AuthTokenPayload> {
  if (!token) {
    throw new Error("Authentication token is required.");
  }

  const { payload } = await jwtVerify(token, getSecret(secret), {
    algorithms: ["HS256"],
  });

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    (payload.role !== "admin" && payload.role !== "client")
  ) {
    throw new Error("Invalid authentication token.");
  }

  return {
    ...payload,
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    clientId:
      typeof payload.clientId === "string"
        ? payload.clientId
        : null,
  };
}
