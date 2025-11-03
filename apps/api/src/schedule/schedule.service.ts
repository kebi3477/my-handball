import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as cheerio from "cheerio";
import type { CheerioAPI, Cheerio as CheerioType } from "cheerio";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { DayBlock, GameItem, ScheduleResponse, TeamInfo } from "./types";

dayjs.locale("ko");

const BASE = "https://www.koreahandball.com";

function absUrl(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${BASE}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function textOrNull(x?: string): string | null {
  const t = (x ?? "").trim();
  return t.length ? t : null;
}

function parseDateISO(dateLabel: string): string | null {
  // 예: "2026.01.10 (토)"
  const m = dateLabel.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}`;
  const d = dayjs(iso, "YYYY-MM-DD", true);
  return d.isValid() ? d.format("YYYY-MM-DD") : null;
}

function parseTeam($team: CheerioType<any>): TeamInfo {
  const name = ($team.find("p.name").first().text() ?? "").trim();
  const logoRel = $team.find("img").attr("src") ?? null;
  const logoUrl = absUrl(logoRel);
  return { name, logoUrl };
}

function parseGame($: CheerioAPI, $li: CheerioType<any>, containerId: string | null): GameItem {
  const $score = $li.find(".game_score").first();

  const home = parseTeam($score.find(".team.home").first());
  const away = parseTeam($score.find(".team.away").first());
  const scoreText = textOrNull($score.find(".score").first().text());

  // game_info 안의 <span>들은 순서가 유동적(방송 없을 수 있음). 마지막은 장소.
  const $spans = $li.find(".game_info span");
  const parts = $spans.map((_, el) => ($(el).text() ?? "").trim()).get();

  let time: string | null = null;
  let broadcast: string[] = [];
  let venue: string | null = null;

  if (parts.length >= 2) {
    time = textOrNull(parts[0]);
    venue = textOrNull(parts[parts.length - 1]);
    if (parts.length > 2) {
      const braw = parts.slice(1, parts.length - 1).join(",");
      // "MAXPORTS, NAVER, 다음" -> ["MAXPORTS","NAVER","다음"]
      broadcast = braw.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
    }
  } else if (parts.length === 1) {
    venue = textOrNull(parts[0]);
  }

  return { home, away, scoreText, time, broadcast, venue, containerId };
}

@Injectable()
export class ScheduleService {
  private buildUrl(league_gender: string, league_season: string, league_type: string) {
    const u = new URL(`${BASE}/game/schedule_list.php`);
    u.searchParams.set("league_gender", league_gender);
    u.searchParams.set("league_season", league_season);
    u.searchParams.set("league_type", league_type);
    return u.toString();
  }

  async fetchSchedule(
    league_gender: "W" | "M" = "W",
    league_season = "2025",
    league_type = "1",
  ): Promise<ScheduleResponse> {
    const url = this.buildUrl(league_gender, league_season, league_type);

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        "Accept-Language": "ko,en;q=0.9",
      },
      timeout: 15000,
      responseType: "text",
      maxRedirects: 3,
      validateStatus: s => s >= 200 && s < 400,
    });

    const $ = cheerio.load(html);
    const $blocks = $(".record_list .cont");

    const days: DayBlock[] = [];

    $blocks.each((_, block) => {
      const $block = $(block);
      const dateLabel = ($block.find("p.date").first().text() ?? "").trim();
      const dateISO = parseDateISO(dateLabel);

      // 한 날짜 블록의 ul id (예: m1768057200)
      const containerId = $block.find("ul.list").attr("id") ?? null;

      const games: GameItem[] = [];
      $block.find("ul.list > li").each((__, li) => {
        games.push(parseGame($, $(li), containerId));
      });

      if (games.length) {
        days.push({ dateLabel, dateISO, games });
      }
    });

    return {
      url,
      leagueGender: league_gender,
      leagueSeason: league_season,
      leagueType: league_type,
      days,
    };
  }
}
