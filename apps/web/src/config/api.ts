import type { Gender } from "@/types/team";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const API_ENDPOINTS = {
  schedule: `${API_BASE_URL}/api/schedule`,
  team: `${API_BASE_URL}/api/team`,
  ranking: `${API_BASE_URL}/api/ranking`
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

export function buildRankingUrl({
  gender,
  season,
  type = "1",
}: {
  gender: Gender | "";
  season: string;
  type?: string;
}) {
  const g = gender === "M" ? "M" : "W";
  const url = new URL(API_ENDPOINTS.ranking);
  url.searchParams.set("gender", g);
  url.searchParams.set("season", season);
  url.searchParams.set("type", type);
  return url.toString();
}