import { useMemo, useState } from "react";
import styles from "./Calendar.module.scss";
import { useMyTeam } from "@/hooks/useMyTeam";
import { useSchedule } from "@/hooks/useSchedule";
import { DEFAULT_SEASON_YEAR, SEASON_LABELS, SEASON_YEARS } from "@/constants/schedule";
import { getMonthMatrix, parseISODate, summarizeGameForTeam } from "@/utils/schedule";
import type { GameSummary } from "@/utils/schedule";
import type { Gender } from "@/types/team";
import type { SeasonKey } from "@/constants/schedule";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  /** 디폴트 시즌 (예: "2025") */
  defaultSeason?: SeasonKey;
  /** 디폴트 리그 타입 */
  leagueType?: string; // 기본 "1"
};

export default function Calendar({ defaultSeason = DEFAULT_SEASON_YEAR, leagueType = "1" }: Props) {
  const { team: myTeam } = useMyTeam();

  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1); // 1~12
  const [season, setSeason] = useState<SeasonKey>(defaultSeason);

  // gender는 마이팀 설정이 있으면 따르고, 없으면 전체("")로 조회
  const gender: Gender | "" = myTeam?.gender ?? "";

  const { data, loading, err } = useSchedule({
    gender,
    season,
    type: leagueType,
    month,
  });

  // 날짜별로 "마이팀 경기"만 골라 매핑
  const byDate = useMemo(() => {
    const map = new Map<string, GameSummary[]>();
    if (!data || !myTeam) return map;

    data.days.forEach((day) => {
      if (!day.dateISO) return;
      const dt = parseISODate(day.dateISO);
      if (!dt) return;
      const key = day.dateISO; // "YYYY-MM-DD"

      day.games.forEach((g) => {
        const summary = summarizeGameForTeam(myTeam.name, g);
        if (!summary) return; // 마이팀 경기 아님
        const list = map.get(key) ?? [];
        list.push(summary);
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
              onChange={(e) => setSeason(e.target.value as SeasonKey)}
              aria-label="시즌 선택"
            >
              {SEASON_YEARS.map((y) => (
                <option key={y} value={y}>
                  {SEASON_LABELS[y]}
                </option>
              ))}
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
