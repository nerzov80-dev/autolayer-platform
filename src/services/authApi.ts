const API_BASE = "/api";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "client";
  clientId: string | null;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

export interface MeResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

function getStoredToken(): string | null {
  return localStorage.getItem("autolayer_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("autolayer_token", token);
}

export function getAuthToken(): string | null {
  return getStoredToken();
}

export function clearAuthToken(): void {
  localStorage.removeItem("autolayer_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    throw new Error(
      typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
        ? data.error
        : "Request failed.",
    );
  }

  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.success && response.token) {
    setAuthToken(response.token);
  }

  return response;
}

export async function getCurrentUser(): Promise<MeResponse> {
  return request<MeResponse>("/auth/me");
}

export function logout(): void {
  clearAuthToken();
}
