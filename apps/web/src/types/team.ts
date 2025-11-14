export type Gender = "W" | "M";

export type TeamItem = {
  teamNum: number;
  name: string;
  logoUrl: string | null;
  href: string | null;
};

export type TeamApiRes = {
  gender: Gender;
  items: TeamItem[];
};

export type MyTeam = TeamItem & {
  gender?: Gender;
};
