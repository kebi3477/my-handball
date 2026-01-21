export type TutorialPage = "main" | "schedule" | "ranking" | "my";

export type TutorialPlacement = "top" | "bottom" | "left" | "right";

export type TutorialStep = {
  id: string;
  page: TutorialPage;
  step: number;
  route: string;
  targetId: string;
  title: string;
  description: string;
  placement: TutorialPlacement;
  allowTargetInteraction?: boolean;
};

export const TUTORIAL_PAGE_LABELS: Record<TutorialPage, string> = {
  main: "메인",
  schedule: "일정",
  ranking: "랭킹",
  my: "MY",
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "main-upcoming",
    page: "main",
    step: 1,
    route: "/",
    targetId: "main-upcoming",
    title: "가까운 경기 카드",
    description: "다가오는 경기 카드를 좌우로 넘겨가며 확인할 수 있어요.",
    placement: "bottom",
  },
  {
    id: "main-upcoming-action",
    page: "main",
    step: 2,
    route: "/",
    targetId: "main-upcoming-action",
    title: "일정 바로가기",
    description: "내 팀 또는 전체 일정을 빠르게 확인할 수 있어요.",
    placement: "bottom",
  },
  {
    id: "main-rank-toggle",
    page: "main",
    step: 3,
    route: "/",
    targetId: "main-rank-toggle",
    title: "랭킹 성별 전환",
    description: "남자부/여자부 탭으로 순위를 바꿔 볼 수 있어요.",
    placement: "top",
  },
  {
    id: "main-menu",
    page: "main",
    step: 4,
    route: "/",
    targetId: "menu-tabs",
    title: "탭 메뉴",
    description: "하단 탭으로 홈, 일정, 랭킹, MY를 이동합니다.",
    placement: "top",
  },
  {
    id: "schedule-view-switch",
    page: "schedule",
    step: 1,
    route: "/schedule",
    targetId: "schedule-view-switch",
    title: "보기 전환",
    description: "리스트/캘린더 보기를 전환할 수 있어요.",
    placement: "bottom",
  },
  {
    id: "schedule-calendar-sync",
    page: "schedule",
    step: 2,
    route: "/calendar",
    targetId: "calendar-sync",
    title: "일정 연동",
    description: "마이팀 일정을 캘린더 파일로 내려받을 수 있어요.",
    placement: "bottom",
  },
  {
    id: "schedule-filter",
    page: "schedule",
    step: 3,
    route: "/schedule",
    targetId: "schedule-filter",
    title: "성별 필터",
    description: "원하는 성별만 골라 볼 수 있어요.",
    placement: "bottom",
  },
  {
    id: "schedule-search",
    page: "schedule",
    step: 4,
    route: "/schedule",
    targetId: "schedule-search",
    title: "빠른 검색",
    description: "팀/장소/방송 키워드로 일정을 찾습니다.",
    placement: "bottom",
  },
  {
    id: "ranking-gender",
    page: "ranking",
    step: 1,
    route: "/ranking",
    targetId: "ranking-gender",
    title: "성별 필터",
    description: "남자부/여자부 순위를 전환하세요.",
    placement: "bottom",
  },
  {
    id: "ranking-list",
    page: "ranking",
    step: 2,
    route: "/ranking",
    targetId: "ranking-list",
    title: "팀 순위 표",
    description: "순위와 승점을 한눈에 확인할 수 있어요.",
    placement: "top",
  },
  {
    id: "my-team",
    page: "my",
    step: 1,
    route: "/my",
    targetId: "my-team",
    title: "마이팀 설정",
    description: "응원 팀을 선택하면 홈과 일정에 바로 반영됩니다.",
    placement: "bottom",
  },
  {
    id: "my-season",
    page: "my",
    step: 2,
    route: "/my",
    targetId: "my-season",
    title: "조회 시즌",
    description: "보고 싶은 시즌을 선택해 데이터를 바꿀 수 있어요.",
    placement: "top",
  },
  {
    id: "my-theme",
    page: "my",
    step: 3,
    route: "/my",
    targetId: "my-theme",
    title: "테마 변경",
    description: "라이트/다크/시스템 테마를 선택하세요.",
    placement: "top",
  },
  {
    id: "my-tutorial",
    page: "my",
    step: 4,
    route: "/my",
    targetId: "my-tutorial-replay",
    title: "튜토리얼 다시 보기",
    description: "언제든 온보딩을 다시 시작할 수 있어요.",
    placement: "top",
  },
];
