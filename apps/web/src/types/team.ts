export type Gender = "W" | "M";

export type TeamItem = {
  teamNum: number;
  name: string;
  logoUrl: string | null;
  href: string | null;
};

export type TeamRequest = {
  gender: Gender;
}

export type TeamResponse = {
  gender: Gender;
  teams: TeamItem[];
  url: string;
};

export type MyTeam = TeamItem & {
  gender?: Gender;
};
