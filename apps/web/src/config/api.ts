import type { Gender, TeamRequest } from "@/types/team";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const DEFAULT_ORIGIN =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "http://localhost:4173";

const API_PATHS = {
  schedule: "/api/schedule",
  scheduleMyTeamIcs: "/api/schedule/ics/my-team",
  team: "/api/team",
  ranking: "/api/ranking",
} as const;

export const API_ENDPOINTS = API_PATHS;

export function resolveApiBase() {
  return API_BASE_URL || DEFAULT_ORIGIN;
}

export function resolveApiUrl(path: string) {
  return new URL(path, resolveApiBase());
}

export type ScheduleEndpointParams = Record<string, string | number | undefined | null>;

export function buildScheduleUrl(params: ScheduleEndpointParams = {}) {
  const url = resolveApiUrl(API_ENDPOINTS.schedule);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

export function buildScheduleMyTeamIcsUrl(params: ScheduleEndpointParams = {}) {
  const url = resolveApiUrl(API_ENDPOINTS.scheduleMyTeamIcs);
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
  const url = resolveApiUrl(API_ENDPOINTS.ranking);
  url.searchParams.set("gender", g);
  url.searchParams.set("season", season);
  url.searchParams.set("type", type);
  return url.toString();
}

export function buildTeamUrl({
  gender,
}: TeamRequest) {
  const url = resolveApiUrl(API_ENDPOINTS.team);
  url.searchParams.set("gender", gender);
  return url.toString();
}