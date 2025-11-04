import type { GameItem } from "@/types/schedule";

export function parseISODate(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map((part) => parseInt(part, 10));
  if (!year || !month || !day) return null;
  const result = new Date(year, month - 1, day);
  return Number.isNaN(result.getTime()) ? null : result;
}

export type MonthMatrixCell = {
  y: number;
  m: number;
  d: number | null;
};

export function getMonthMatrix(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const cells: MonthMatrixCell[] = [];

  for (let i = 0; i < first.getDay(); i += 1) {
    cells.push({ y: year, m: month, d: null });
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    cells.push({ y: year, m: month, d: day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ y: year, m: month, d: null });
  }

  const weeks: MonthMatrixCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

export type GameSummary = {
  opponentLogo: string | null;
  scoreText: string;
  result: "승" | "패" | "무" | null;
};

export function summarizeGameForTeam(teamName: string, game: GameItem): GameSummary | null {
  const isHome = game.home.name === teamName;
  const isAway = game.away.name === teamName;
  if (!isHome && !isAway) return null;

  const opponent = isHome ? game.away : game.home;
  const scoreDigits = game.scoreText?.replace(/\s/g, "") ?? "";
  const match = scoreDigits.match(/^(\d+):(\d+)$/);

  if (!match) {
    return {
      opponentLogo: opponent.logoUrl,
      scoreText: game.scoreText ?? "- : -",
      result: null,
    };
  }

  const [homeScore, awayScore] = match.slice(1).map((part) => parseInt(part, 10));
  if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    return {
      opponentLogo: opponent.logoUrl,
      scoreText: game.scoreText ?? "- : -",
      result: null,
    };
  }

  const myScore = (isHome ? homeScore : awayScore) as number;
  const otherScore = (isHome ? awayScore : homeScore) as number;
  let result: GameSummary["result"] = "무";
  if (myScore > otherScore) result = "승";
  else if (myScore < otherScore) result = "패";

  return {
    opponentLogo: opponent.logoUrl,
    scoreText: game.scoreText ?? "- : -",
    result,
  };
}
