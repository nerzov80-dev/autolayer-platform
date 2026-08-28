import { getAuthToken } from "./authApi";

const API_BASE = "/api";

export interface LandingPage {
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

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface LandingPagesResponse extends ApiResponse {
  landingPages?: LandingPage[];
}

export interface LandingPageResponse extends ApiResponse {
  landingPage?: LandingPage;
}

export interface ClientResponse extends ApiResponse {
  client?: ClientProfile;
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

export async function getClientLandingPages(
  clientId?: string,
): Promise<LandingPagesResponse> {
  const query = clientId
    ? `?clientId=${encodeURIComponent(clientId)}`
    : "";

  return request<LandingPagesResponse>(
    `/landing-pages${query}`,
  );
}

export async function getLandingPage(
  id: string,
): Promise<LandingPageResponse> {
  return request<LandingPageResponse>(
    `/landing-pages/${encodeURIComponent(id)}`,
  );
}

export async function createLandingPage(input: {
  clientId: string;
  templateId: string;
  slug: string;
  customDomain?: string | null;
  trackingMetaPixel?: string | null;
  trackingTiktokPixel?: string | null;
  trackingGaId?: string | null;
}): Promise<LandingPageResponse> {
  return request<LandingPageResponse>("/landing-pages", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateLandingPage(
  id: string,
  input: {
    templateId?: string;
    status?: "draft" | "published";
    slug?: string;
    customDomain?: string | null;
    trackingMetaPixel?: string | null;
    trackingTiktokPixel?: string | null;
    trackingGaId?: string | null;
  },
): Promise<LandingPageResponse> {
  return request<LandingPageResponse>(
    `/landing-pages/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteLandingPage(
  id: string,
): Promise<ApiResponse> {
  return request<ApiResponse>(
    `/landing-pages/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export async function getClientProfile(
  clientId: string,
): Promise<ClientResponse> {
  const response = await request<{
    success: boolean;
    client?: ClientProfile;
    error?: string;
  }>(`/clients/${encodeURIComponent(clientId)}`);

  return response;
  }
