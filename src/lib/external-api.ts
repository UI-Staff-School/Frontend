const DEFAULT_BASE_URL = "https://ui-staff-school-backend.onrender.com";

/**
 * Central place for the external (Render-hosted) API base.
 * Falls back to the previously hard-coded domain when env vars are missing.
 */
export const EXTERNAL_API_BASE_URL =
  process.env.RESULT_API_BASE_URL ||
  process.env.EXTERNAL_API_BASE_URL ||
  DEFAULT_BASE_URL;

/**
 * Builds a fully-qualified URL for the downstream API, ensuring
 * there is exactly one slash between the base and the provided path.
 */
export function buildExternalApiUrl(path: string): string {
  const normalizedBase = EXTERNAL_API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

