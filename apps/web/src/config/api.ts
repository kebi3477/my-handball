import { RankingRequest } from "@/types/ranking";
import { ScheduleMyTeamRequest, ScheduleRequest } from "@/types/schedule";
import type { TeamRequest } from "@/types/team";

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

export function buildScheduleUrl({ 
  gender, season, type, month 
} : ScheduleRequest) {
  const url = resolveApiUrl(API_ENDPOINTS.schedule);
  url.searchParams.set("gender", gender);
  url.searchParams.set("season", season ?? '');
  url.searchParams.set("type", type ?? '');
  url.searchParams.set("month", `${month}`);
  return url.toString();
}

export function buildScheduleMyTeamIcsUrl({
  gender,
  season,
  type,
  teamName
}: ScheduleMyTeamRequest) {
  const url = resolveApiUrl(API_ENDPOINTS.scheduleMyTeamIcs);
  url.searchParams.set("gender", gender);
  url.searchParams.set("season", season ?? '');
  url.searchParams.set("type", type ?? '');
  url.searchParams.set("teamName", teamName);
  return url.toString();
}

export function buildRankingUrl({
  gender,
  season,
  type = "1",
}: RankingRequest) {
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