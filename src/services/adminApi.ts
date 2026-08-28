import {
  getAuthToken,
} from "./authApi";

const API_BASE = "/api";

export interface Client {
  id: string;
  name: string;
  phone: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface ClientsResponse extends ApiResponse<unknown> {
  clients?: Client[];
}

export interface ClientResponse extends ApiResponse<unknown> {
  client?: Client;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();

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

export async function getClients(): Promise<ClientsResponse> {
  return request<ClientsResponse>("/clients");
}

export async function getClient(
  id: string,
): Promise<ClientResponse> {
  return request<ClientResponse>(
    `/clients/${encodeURIComponent(id)}`,
  );
}

export async function createClient(input: {
  name: string;
  phone: string;
}): Promise<ClientResponse> {
  return request<ClientResponse>("/clients", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateClient(
  id: string,
  input: {
    name?: string;
    phone?: string;
    status?: "active" | "inactive";
  },
): Promise<ClientResponse> {
  return request<ClientResponse>(
    `/clients/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteClient(
  id: string,
): Promise<ApiResponse<unknown>> {
  return request<ApiResponse<unknown>>(
    `/clients/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
