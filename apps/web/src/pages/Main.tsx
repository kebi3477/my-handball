import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Main.module.scss";
import { useSchedule } from "@/hooks/useSchedule";
import { useRanking } from "@/hooks/useRanking";
import { useMyTeam } from "@/hooks/useMyTeam";
import { DEFAULT_SEASON_YEAR, SEASON_YEARS, SEASON_LABELS } from "@/constants/schedule";
import type { DayBlock, GameItem } from "@/types/schedule";
import type { Gender } from "@/types/team";
import { shortTeamName } from "@/utils/common";

/** ====== 스케줄 유틸 ====== */
function toGameDate(d: DayBlock, g: GameItem): Date {
  const base = (d.dateISO ?? "").trim(); // YYYY-MM-DD
  const time = (g.time ?? "12:00").trim();
  const [y, m, day] = base.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y || 1970, (m || 1) - 1, day || 1, hh || 12, mm || 0, 0, 0);
}
// 오늘 00:00 포함 이후만 true → 미래 중 가장 가까운 인덱스 찾기 용도
function isSameDay(a: Date, b: Date) {
  const today0 = new Date(b);
  today0.setHours(0, 0, 0, 0);
  return a.getTime() >= today0.getTime();
}

type SlideItem = {
  id: string;
  date: Date;
  dateLabel: string;
  game: GameItem;
  isMyTeam: boolean;
};

function Logo({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <div className={styles.logoFallback} aria-label={alt} />;
  return <img className={styles.logo} src={src} alt={alt} loading="lazy" />;
}

export default function Main() {
  const { team: myTeam } = useMyTeam();
  const myTeamName = myTeam?.name ?? "";
  const myTeamGender = (myTeam?.gender as Gender | "") ?? "";

  /** ====== 컨트롤 상태 (성별/시즌) ====== */
  const [gender, setGender] = useState<Gender | "">(myTeamName ? myTeamGender || "W" : "W");
  const [season, setSeason] = useState<string>(DEFAULT_SEASON_YEAR);

  /** 상단: 가까운 경기 */
  const { data, loading, err } = useSchedule({
    gender,
    season,
    type: "1",
  });

  const slides = useMemo<SlideItem[]>(() => {
    if (!data) return [];
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);

    const all: SlideItem[] = [];
    for (const d of data.days) {
      for (const g of d.games) {
        const dt = toGameDate(d, g);
        const isMine =
          !!myTeamName &&
          (g.home.name.includes(myTeamName) || g.away.name.includes(myTeamName));
        all.push({
          id: `${d.dateISO ?? d.dateLabel}-${g.home.name}-${g.away.name}-${g.time ?? ""}`,
          date: dt,
          dateLabel: d.dateLabel,
          game: g,
          isMyTeam: isMine,
        });
      }
    }

    const filtered = (myTeamName ? all.filter((x) => x.isMyTeam) : all)
      .filter((x) => x.date.getTime() >= today0.getTime())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return filtered;
  }, [data, myTeamName]);

  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!slides.length || !railRef.current) return;
    const el = itemRefs.current[0];
    if (el) {
      const left = el.offsetLeft - 12; // 패딩 보정
      railRef.current.scrollTo({ left, behavior: "auto" });
    }
  }, [slides.length, gender, season]);

  /** 하단: 랭킹 (성별/시즌 선택과 연동) */
  const { data: ranking, loading: rankLoading, err: rankErr } = useRanking({
    gender,
    season,
    type: "1",
  });

  return (
    <div className={styles.page}>
      {/* 상단: 컨트롤 (성별/시즌) */}
      <section className={styles.controlsBar} aria-label="필터">
        <div className={styles.seg}>
          <button
            type="button"
            className={`${styles.segBtn} ${gender === "W" ? styles.segActive : ""}`}
            aria-pressed={gender === "W"}
            onClick={() => setGender("W")}
          >
            여자부
          </button>
          <button
            type="button"
            className={`${styles.segBtn} ${gender === "M" ? styles.segActive : ""}`}
            aria-pressed={gender === "M"}
            onClick={() => setGender("M")}
          >
            남자부
          </button>
        </div>

        <label className={styles.visuallyHidden} htmlFor="season-select">시즌 선택</label>
        <select
          id="season-select"
          className={styles.seasonSelect}
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          aria-label="시즌 선택"
        >
          {SEASON_YEARS.map((y) => (
            <option key={y} value={y}>{SEASON_LABELS[y]}</option>
          ))}
        </select>
      </section>

      {/* 상단: 가까운 경기 */}
      <section className={styles.top} aria-label="가까운 경기">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>가까운 경기</h2>
          {myTeamName ? (
            <span className={styles.badge}>MY: {myTeamName}</span>
          ) : (
            <span className={styles.badgeMuted}>전체 경기</span>
          )}
        </header>

        {loading && <p className={styles.state}>불러오는 중…</p>}
        {err && <p className={styles.stateError}>에러: {err}</p>}
        {!loading && !err && slides.length === 0 && (
          <p className={styles.state}>앞으로 예정된 경기가 없어요.</p>
        )}

        {!loading && !err && slides.length > 0 && (
          <div className={styles.rail} ref={railRef}>
            {slides.map((s, i) => {
              const g = s.game;
              return (
                <div
                  key={s.id}
                  className={styles.card}
                  ref={(el) => {
                    if (el) itemRefs.current[i] = el;
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.dateBadge}>{s.dateLabel}</div>
                    {s.isMyTeam && <div className={styles.myTag}>MY</div>}
                  </div>

                  <div className={styles.cardGrid}>
                    <div className={styles.sideCol}>
                      <Logo src={g.home.logoUrl} alt={`${g.home.name} 로고`} />
                      <div className={styles.teamName} title={g.home.name}>
                        {g.home.name}
                      </div>
                    </div>

                    <div className={styles.centerCol}>
                      <div className={styles.score}>{g.scoreText ?? "- : -"}</div>
                      <div className={styles.timeLine}>
                        {s.dateLabel.replace(/\s*\(.+\)\s*/g, "")}
                        {g.time ? ` ${g.time}` : ""}
                      </div>
                      {g.venue && <div className={styles.venue}>{g.venue}</div>}
                    </div>

                    <div className={styles.sideCol}>
                      <Logo src={g.away.logoUrl} alt={`${g.away.name} 로고`} />
                      <div className={styles.teamName} title={g.away.name}>
                        {g.away.name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 하단: 랭킹 테이블 */}
      <section className={styles.bottom} aria-label="팀 랭킹">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {ranking?.leagueGender === "M" ? "남자부" : "여자부"} 랭킹
          </h2>
          <span className={styles.badgeMuted}>
            시즌 {ranking?.leagueSeason ?? season}
          </span>
        </header>

        {rankLoading && <p className={styles.state}>랭킹 불러오는 중…</p>}
        {rankErr && <p className={styles.stateError}>에러: {rankErr}</p>}
        {!rankLoading && !rankErr && (!ranking || ranking.items.length <= 1) && (
          <p className={styles.state}>랭킹 데이터가 없어요.</p>
        )}

        {!rankLoading && !rankErr && ranking && ranking.items.length > 1 && (
          <div className={styles.rankWrap}>
            <table className={styles.rankTable}>
              <thead>
                <tr>
                  <th className={styles.thRank}>순위</th>
                  <th className={styles.thTeam}>팀</th>
                  <th>경기</th>
                  <th>승점</th>
                  <th>승</th>
                  <th>무</th>
                  <th>패</th>
                  <th>득</th>
                  <th>실</th>
                  <th>득실</th>
                </tr>
              </thead>
              <tbody>
                {ranking.items.map((row) => {
                  const isMine = myTeamName && row.team.name.includes(myTeamName);
                  return (
                    <tr key={row.team.name} className={isMine ? styles.rowMyTeam : ""}>
                      <td className={styles.tdRank}>{row.rank}</td>
                      <td className={styles.tdTeam}>
                        {row.team.logoUrl ? (
                          <img
                            className={styles.teamLogoSm}
                            src={row.team.logoUrl}
                            alt={`${row.team.name} 로고`}
                            loading="lazy"
                          />
                        ) : (
                          <span className={styles.teamLogoFallbackSm} aria-hidden />
                        )}
                        <span className={styles.teamText} title={row.team.name}>
                          {shortTeamName(row.team.name)}
                        </span>
                      </td>
                      <td>{row.played}</td>
                      <td className={styles.tdPoints}>{row.points}</td>
                      <td>{row.wins}</td>
                      <td>{row.draws}</td>
                      <td>{row.losses}</td>
                      <td>{row.goalsFor}</td>
                      <td>{row.goalsAgainst}</td>
                      <td className={row.goalDiff >= 0 ? styles.pos : styles.neg}>
                        {row.goalDiff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}