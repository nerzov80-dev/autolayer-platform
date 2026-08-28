export interface LandingPage {
  id: string;
  clientId: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingPageInput {
  clientId: string;
  slug: string;
  title: string;
  content: string;
}

export interface UpdateLandingPageInput {
  slug?: string;
  title?: string;
  content?: string;
  status?: "draft" | "published";
}
