import { useMemo, useState } from "react";
import styles from "./Calendar.module.scss";
import { useMyTeam } from "@/hooks/useMyTeam";
import { useSchedule, downloadMyTeamIcs } from "@/hooks/useSchedule";
import { DEFAULT_SEASON_YEAR, SEASON_LABELS, SEASON_YEARS } from "@/constants/schedule";
import { getMonthMatrix, parseISODate, summarizeGameForTeam } from "@/utils/schedule";
import type { GameSummary } from "@/utils/schedule";
import type { Gender } from "@/types/team";
import type { SeasonKey } from "@/constants/schedule";
import Error from "@/components/Error";
import SkeletonCalendar from "@/components/skeletons/SkeletonCalendar";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  defaultSeason?: SeasonKey;
  leagueType?: string;
};

export default function Calendar({ defaultSeason = DEFAULT_SEASON_YEAR, leagueType = "1" }: Props) {
  const { team: myTeam } = useMyTeam();

  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [season, setSeason] = useState<SeasonKey>(defaultSeason);

  const gender: Gender | "" = myTeam?.gender ?? "";

  const { data, loading, error } = useSchedule({
    gender,
    season,
    type: leagueType,
    month,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, GameSummary[]>();
    if (!data || !myTeam) return map;

    data.days.forEach((day) => {
      if (!day.dateISO) return;
      const dt = parseISODate(day.dateISO);
      if (!dt) return;
      const key = day.dateISO;

      day.games.forEach((g) => {
        const summary = summarizeGameForTeam(myTeam.name, g);
        if (!summary) return;
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

   const handleSyncMyTeamCalendar = async () => {
    if (!myTeam) {
      alert("먼저 마이팀을 설정해 주세요.");
      return;
    }

    try {
      await downloadMyTeamIcs({
        gender,
        season,
        type: leagueType,
        teamName: myTeam.name,
      });
    } catch (e) {
      console.error(e);
      alert("캘린더 파일 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.header__row}>
          <div className={styles.header__title_group}>
            <h1 className={styles.header__title}>마이팀 캘린더</h1>
            <div className={styles.header__chip} aria-label="선택된 마이팀">
              {myTeam ? (
                <>
                  {myTeam.logoUrl ? (
                    <img className={styles.header__chip_logo} src={myTeam.logoUrl} alt={`${myTeam.name} 로고`} />
                  ) : (
                    <span className={styles.header__chip_logo_fallback} aria-hidden />
                  )}
                  <span className={styles.header__chip_name}>{myTeam.name}</span>
                </>
              ) : (
                <span className={styles.header__chip_name}>마이팀을 선택해 주세요</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={styles.header__sync}
            onClick={handleSyncMyTeamCalendar}
          >
            일정 연동
          </button>
        </div>

        <div className={styles.header__actions}>
          <div className={styles.header__nav}>
            <button className={styles.header__nav_btn} onClick={goPrevMonth} disabled={!canPrev} aria-label="이전 달">◀</button>
            <div className={styles.header__month}>
              {year}년 {month}월
            </div>
            <button className={styles.header__nav_btn} onClick={goNextMonth} disabled={!canNext} aria-label="다음 달">▶</button>
          </div>

          <div className={styles.header__select}>
            <label className={styles.visuallyHidden} htmlFor="season-select">시즌 선택</label>
            <select
              id="season-select"
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
        </div>

      </header>

      <main className={styles.calendar} aria-busy={loading}>
        {error && <Error />}

        {!error && loading && <SkeletonCalendar />}

        {!error && !loading && (
          <>
            <div className={styles.calendar__week}>
              {DAY_LABELS.map((d) => (
                <div key={d} className={styles.calendar__week_day} aria-hidden>
                  {d}
                </div>
              ))}
            </div>

            <div className={styles.calendar__grid} role="grid" aria-label="월간 캘린더">
              {matrix.map((week, wi) => (
                <div key={wi} className={styles.calendar__row} role="row">
                  {week.map((cell, di) => {
                    const dateKey =
                      cell.d ? `${cell.y.toString().padStart(4, "0")}-${cell.m.toString().padStart(2, "0")}-${cell.d.toString().padStart(2, "0")}` : null;
                    const items = dateKey ? byDate.get(dateKey) ?? [] : [];

                    return (
                      <div key={`${wi}-${di}`} className={styles.calendar__day} role="gridcell" aria-selected={!!items.length}>
                        <div className={styles.calendar__day_number} aria-label="날짜">
                          {cell.d ?? ""}
                        </div>

                        <div className={styles.calendar__events}>
                          {items.map((it, idx) => (
                            <article key={idx} className={styles.calendar__event} role="listitem" aria-label="마이팀 경기">
                              {it.opponentLogo ? (
                                <img
                                  className={styles.calendar__event_logo}
                                  src={it.opponentLogo}
                                  alt=""
                                  loading="lazy"
                                />
                              ) : (
                                <span className={styles.calendar__event_logo_fallback} aria-hidden />
                              )}

                              <div className={styles.calendar__event_score}>{it.scoreText}</div>

                              <div
                                className={`${styles.calendar__event_result} ${
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
          </>
        )}
      </main>
    </div>
  );
}
