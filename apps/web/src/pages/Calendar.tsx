import { useEffect, useMemo, useState } from "react";
import styles from "./Calendar.module.scss";
import { useMyTeam } from "@/hooks/useMyTeam";
import type { Gender } from "@/types/team";

/** 기존 Schedule 응답과 동일한 타입(필요 부분만) */
type TeamInfo = {
  name: string;
  logoUrl: string | null;
};
type GameItem = {
  home: TeamInfo;
  away: TeamInfo;
  scoreText: string | null; // 예: "83 : 79" 또는 "83:79" (없으면 null)
  time: string | null;
  broadcast: string[];
  venue: string | null;
};
type DayBlock = {
  dateLabel: string;        // "12/03" 같은 레이블
  dateISO: string | null;   // "2025-12-03"
  games: GameItem[];
};
type ScheduleResponse = {
  url: string;
  leagueGender: "W" | "M";
  leagueSeason: string;     // "2025" 등
  leagueType: string;       // "1" 등
  days: DayBlock[];
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** month는 1~12 */
function useMonthSchedule(params: { gender: Gender | ""; season: string; type?: string; month: number }) {
  const { gender, season, type = "1", month } = params;
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const url = `http://localhost:3000/api/schedule?gender=${gender}&season=${season}&type=${type}&month=${month}`;
        const res = await fetch(url, { cache: "no-cache", signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ScheduleResponse;
        setData(json);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setErr(e?.message ?? "unknown error");
          setData(null);
        }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [gender, season, type, month]);

  return { data, loading, err };
}

function parseISODate(d?: string | null) {
  if (!d) return null;
  // "YYYY-MM-DD"
  const [y, m, day] = d.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !day) return null;
  const dt = new Date(y, m - 1, day);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function getMonthMatrix(year: number, month: number) {
  // month: 1~12
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0); // 말일
  const firstWeekday = first.getDay(); // 0(일)~6(토)
  const daysInMonth = last.getDate();

  const cells: Array<{ y: number; m: number; d: number | null }> = [];
  // 앞의 빈칸
  for (let i = 0; i < firstWeekday; i++) cells.push({ y: year, m: month, d: null });
  // 날짜 채우기
  for (let d = 1; d <= daysInMonth; d++) cells.push({ y: year, m: month, d });

  // 7의 배수로 끝 맞추기
  while (cells.length % 7 !== 0) cells.push({ y: year, m: month, d: null });

  // 주 단위로 분할
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function pickOpponentAndResult(myTeamName: string, g: GameItem) {
  const isHome = g.home.name === myTeamName;
  const isAway = g.away.name === myTeamName;
  if (!isHome && !isAway) return null;

  const opponent = isHome ? g.away : g.home;

  // scoreText 파싱
  const score = g.scoreText?.replace(/\s/g, "") ?? "";
  const m = score.match(/^(\d+):(\d+)$/);
  let myScore: number | null = null;
  let oppScore: number | null = null;
  let resultLabel: "승" | "패" | "무" | null = null;

  if (m) {
    const a = parseInt(m[1] ?? '', 10);
    const b = parseInt(m[2] ?? '', 10);
    myScore = isHome ? a : b;
    oppScore = isHome ? b : a;
    if (myScore > oppScore) resultLabel = "승";
    else if (myScore < oppScore) resultLabel = "패";
    else resultLabel = "무";
  }

  return {
    opponentLogo: opponent.logoUrl,
    scoreText: g.scoreText ?? "- : -",
    result: resultLabel, // 점수 없으면 null
  };
}

type Props = {
  /** 디폴트 시즌 (예: "2025") */
  defaultSeason?: string;
  /** 디폴트 리그 타입 */
  leagueType?: string; // 기본 "1"
};

export default function Calendar({ defaultSeason = "2025", leagueType = "1" }: Props) {
  const { team: myTeam } = useMyTeam();

  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1); // 1~12
  const [season, setSeason] = useState<string>(defaultSeason);

  // gender는 마이팀 설정이 있으면 따르고, 없으면 전체("")로 조회
  const gender: Gender | "" = myTeam?.gender ?? "";

  const { data, loading, err } = useMonthSchedule({
    gender,
    season,
    type: leagueType,
    month,
  });

  // 날짜별로 "마이팀 경기"만 골라 매핑
  const byDate = useMemo(() => {
    const map = new Map<string, Array<ReturnType<typeof pickOpponentAndResult> & { game: GameItem }>>();
    if (!data || !myTeam) return map;

    data.days.forEach((day) => {
      if (!day.dateISO) return;
      const dt = parseISODate(day.dateISO);
      if (!dt) return;
      const key = day.dateISO; // "YYYY-MM-DD"

      day.games.forEach((g) => {
        const brief = pickOpponentAndResult(myTeam.name, g);
        if (!brief) return; // 마이팀 경기 아님
        const list = map.get(key) ?? [];
        list.push({ ...brief, game: g });
        map.set(key, list);
      });
    });
    return map;
  }, [data, myTeam]);

  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const canPrev = true;
  const canNext = true;

  const goPrevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };
  const goNextMonth = () => {
    const d = new Date(year, month, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>마이팀 캘린더</h1>

          <div className={styles.controls}>
            <button className={styles.navBtn} onClick={goPrevMonth} disabled={!canPrev} aria-label="이전 달">◀</button>
            <div className={styles.monthLabel}>
              {year}년 {month}월
            </div>
            <button className={styles.navBtn} onClick={goNextMonth} disabled={!canNext} aria-label="다음 달">▶</button>

            <label className={styles.visuallyHidden} htmlFor="season-select">시즌 선택</label>
            <select
              id="season-select"
              className={styles.seasonSelect}
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              aria-label="시즌 선택"
            >
              {/* 필요 시 옵션 확장 */}
              <option value="2025">25-26</option>
              <option value="2024">24-25</option>
              <option value="2023">23-24</option>
              <option value="2022">22-23</option>
              <option value="2021">21-22</option>
            </select>
          </div>

          <div className={styles.myTeamChip} aria-label="선택된 마이팀">
            {myTeam ? (
              <>
                {myTeam.logoUrl ? (
                  <img className={styles.myTeamLogo} src={myTeam.logoUrl} alt={`${myTeam.name} 로고`} />
                ) : (
                  <span className={styles.myTeamLogoFallback} aria-hidden />
                )}
                <span className={styles.myTeamName}>{myTeam.name}</span>
              </>
            ) : (
              <span className={styles.myTeamName}>마이팀을 선택해 주세요</span>
            )}
          </div>
        </div>

        {err && <p className={styles.stateError}>에러: {err}</p>}
        {loading && <p className={styles.state}>불러오는 중…</p>}
      </header>

      <main className={styles.calendar}>
        {/* 요일 헤더 */}
        <div className={styles.weekHeader}>
          {DAY_LABELS.map((d) => (
            <div key={d} className={styles.weekHeaderCell} aria-hidden>
              {d}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className={styles.grid} role="grid" aria-label="월간 캘린더">
          {matrix.map((week, wi) => (
            <div key={wi} className={styles.weekRow} role="row">
              {week.map((cell, di) => {
                const dateKey =
                  cell.d ? `${cell.y.toString().padStart(4, "0")}-${cell.m.toString().padStart(2, "0")}-${cell.d.toString().padStart(2, "0")}` : null;
                const items = dateKey ? byDate.get(dateKey) ?? [] : [];

                return (
                  <div key={`${wi}-${di}`} className={styles.dayCell} role="gridcell" aria-selected={!!items.length}>
                    <div className={styles.dayNumber} aria-label="날짜">
                      {cell.d ?? ""}
                    </div>

                    <div className={styles.events}>
                      {items.map((it, idx) => (
                        <article key={idx} className={styles.eventCard} role="listitem" aria-label="마이팀 경기">
                          {/* ✅ 로고만 */}
                          {it.opponentLogo ? (
                            <img
                              className={styles.opponentLogo}
                              src={it.opponentLogo}
                              alt="" // 장식용
                              loading="lazy"
                            />
                          ) : (
                            <span className={styles.opponentLogoFallback} aria-hidden />
                          )}

                          {/* ✅ 점수 */}
                          <div className={styles.score}>{it.scoreText}</div>

                          {/* ✅ 승/패/무 */}
                          <div
                            className={`${styles.result} ${
                              it.result === "승"
                                ? styles.win
                                : it.result === "패"
                                ? styles.lose
                                : it.result === "무"
                                ? styles.draw
                                : styles.pending
                            }`}
                          >
                            {it.result ?? ""}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {!loading && !err && myTeam && byDate.size === 0 && (
          <p className={styles.state}>이 달에는 마이팀 경기가 없어요.</p>
        )}
        {!loading && !err && !myTeam && (
          <p className={styles.state}>먼저 마이팀을 설정하면 경기 일정이 보입니다.</p>
        )}
      </main>
    </div>
  );
}