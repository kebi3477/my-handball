// src/types/team.ts
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

// MyTeam은 현재 UI 요구사항과 맞춰 TeamItem을 기본으로 하고,
// 필요 시 gender만 옵션으로 담을 수 있게 했어(호환성↑).
export type MyTeam = TeamItem & {
  gender?: Gender;
};
