import type { Gender } from "./team";

export type TeamInfo = {
  name: string;
  logoUrl: string | null;
};

export type GameItem = {
  home: TeamInfo;
  away: TeamInfo;
  scoreText: string | null;
  time: string | null;
  broadcast: string[];
  venue: string | null;
  containerId: string | null;
};

export type DayBlock = {
  dateLabel: string;
  dateISO: string | null;
  games: GameItem[];
};

export type ScheduleResponse = {
  url: string;
  leagueGender: Gender;
  leagueSeason: string;
  leagueType: string;
  leagueMonth?: string;
  days: DayBlock[];
};

export type ScheduleFilters = {
  gender: Gender | "";
  season?: string;
  type?: string;
  month?: number;
};
