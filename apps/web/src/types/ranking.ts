import type { Gender } from "./team";

export type RankTeamInfo = {
  name: string;
  logoUrl: string | null;
};

export type RankItem = {
  rank: number;
  team: RankTeamInfo;
  played: number;       
  points: number;      
  wins: number;       
  draws: number;      
  losses: number;     
  goalsFor: number;    
  goalsAgainst: number;
  goalDiff: number;     
  last5: ("W" | "L" | "D")[];
};

export type RankingResponse = {
  url: string;
  leagueGender: Gender;
  leagueSeason: string;
  leagueType: string;
  items: RankItem[];
};

export type RankingRequest = {
  gender: Gender | "";
  season: string;
  type?: string;
};
