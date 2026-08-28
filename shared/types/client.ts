export interface Client {
  id: string;
  name: string;
  email: string;
  domain?: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  name: string;
  email: string;
  domain?: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  domain?: string | null;
  status?: "active" | "inactive";
}
