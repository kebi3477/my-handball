import type { Gender } from "./team";

export type TeamInfo = {
  name: string;
  logoUrl: string | null;
};

export type LiveLink = {
  provider: string;
  url: string;
};

export type GameItem = {
  home: TeamInfo;
  away: TeamInfo;
  scoreText: string | null;
  time: string | null;
  broadcast: string[];
  liveLinks: LiveLink[];
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

export type ScheduleRequest = {
  gender: Gender | "";
  season?: string;
  type?: string;
  month?: number;
};

export type ScheduleMyTeamRequest = {
  gender: Gender | "";
  season: string;
  type: string;
  teamName: string;
}
