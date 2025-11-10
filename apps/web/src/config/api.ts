export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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
