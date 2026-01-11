import { DayBlock, GameItem } from "@/types/schedule";

export const shortTeamName = (name: string) => Array.from(name).slice(0, 2).join("");

export const toGameDate = (d: DayBlock, g: GameItem): Date => {
  const base = (d.dateISO ?? "").trim();
  const time = (g.time ?? "12:00").trim();
  const [y, m, day] = base.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y || 1970, (m || 1) - 1, day || 1, hh || 12, mm || 0, 0, 0);
}

export const getCardDateLabel = (date: Date) => {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const dow = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()];
  const hour = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${yy}.${mm}.${dd} ${dow} ${hour}:${minutes}`;
};