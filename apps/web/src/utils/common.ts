import { DayBlock, GameItem } from "@/types/schedule";

export const shortTeamName = (name: string) => Array.from(name).slice(0, 2).join("");

export const toGameDate = (d: DayBlock, g: GameItem): Date => {
  const base = (d.dateISO ?? "").trim(); // YYYY-MM-DD
  const time = (g.time ?? "12:00").trim();
  const [y, m, day] = base.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y || 1970, (m || 1) - 1, day || 1, hh || 12, mm || 0, 0, 0);
}