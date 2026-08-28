export const APP_NAME = "AutoLayer Platform";

export const API_PREFIX = "/api";

export const ROUTES = {
  health: "/health",
  setup: "/setup",
  auth: {
    login: "/auth/login",
    me: "/auth/me",
    setup: "/auth/setup",
  },
  clients: "/clients",
  landingPages: "/landing-pages",
} as const;

export const AUTH = {
  TOKEN_KEY: "autolayer_token",
  HEADER_NAME: "Authorization",
  BEARER_PREFIX: "Bearer ",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;
