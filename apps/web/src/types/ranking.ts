import type { Gender } from "./team";

export type RankTeamInfo = {
  name: string;
  logoUrl: string | null;
};

export type RankItem = {
  rank: number;
  team: RankTeamInfo;
  played: number;       // 경기수
  points: number;       // 승점
  wins: number;         // 승
  draws: number;        // 무
  losses: number;       // 패
  goalsFor: number;     // 득점
  goalsAgainst: number; // 실점
  goalDiff: number;     // 득실차
  last5: ("W" | "L" | "D")[]; // 최근 5경기
};

export type RankingResponse = {
  url: string;
  leagueGender: Gender;
  leagueSeason: string;
  leagueType: string;
  items: RankItem[];
};

export type RankingFilters = {
  gender: Gender | "";
  season: string;
  type?: string; // 기본 "1"
};
