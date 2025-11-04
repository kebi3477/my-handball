const DEFAULT_API_BASE_URL = "http://localhost:3000";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const API_BASE_URL = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : DEFAULT_API_BASE_URL;

export const API_ENDPOINTS = {
  schedule: `${API_BASE_URL}/api/schedule`,
  team: `${API_BASE_URL}/api/team`,
} as const;

export type ScheduleEndpointParams = Record<string, string | number | undefined | null>;

export function buildScheduleUrl(params: ScheduleEndpointParams = {}) {
  const url = new URL(API_ENDPOINTS.schedule);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}
