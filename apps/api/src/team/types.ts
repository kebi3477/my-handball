export type Gender = "W" | "M";

export interface TeamItem {
  teamNum: number;
  name: string;
  logoUrl: string | null;
  href: string | null; // 원 페이지의 팀 탭 이동용 상대링크 또는 절대링크
}

export interface TeamListResponse {
  url: string;
  gender: Gender;
  teams: TeamItem[];
}
