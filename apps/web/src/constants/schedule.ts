import type { Gender } from "@/types/team";

export const GENDER_LABEL: Record<Gender | "", string> = {
  W: "여자부",
  M: "남자부",
  "": "전체",
};

export const SEASON_LABELS: Record<string, string> = {
  "2025": "25-26",
  "2024": "24-25",
  "2023": "23-24",
  "2022": "22-23",
  "2021": "21-22",
};

export type SeasonKey = keyof typeof SEASON_LABELS;

const seasonYears = Object.keys(SEASON_LABELS)
  .sort((a, b) => Number(b) - Number(a)) as SeasonKey[];

export const SEASON_YEARS = seasonYears;

export const DEFAULT_SEASON_YEAR = (seasonYears[0] ?? "2025") as SeasonKey;
