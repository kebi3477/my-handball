import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Main.module.scss";
import { useSchedule } from "@/hooks/useSchedule";
import { useRanking } from "@/hooks/useRanking";
import { useMyTeam } from "@/hooks/useMyTeam";
import { DEFAULT_SEASON_YEAR, SEASON_YEARS, SEASON_LABELS } from "@/constants/schedule";
import type { GameItem } from "@/types/schedule";
import type { Gender } from "@/types/team";
import { shortTeamName, toGameDate } from "@/utils/common";

function pickIndex(list: { date: Date }[], now = Date.now()) {
  let best = -1;
  let bestDiff = Number.POSITIVE_INFINITY;
  list.forEach((s, i) => {
    const diff = s.date.getTime() - now;
    if (diff >= 0 && diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });
  return best >= 0 ? best : Math.max(0, list.length - 1);
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

  const { data, loading, error } = useSchedule({
    gender: myTeamGender,
    season: DEFAULT_SEASON_YEAR,
    type: "1",
  });

  const slides = useMemo<SlideItem[]>(() => {
    if (!data) return [];

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

    const base = myTeamName ? all.filter((x) => x.isMyTeam) : all;
    return base.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data, myTeamName]);

  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!slides.length || !railRef.current) return;

    const idx = pickIndex(slides);
    const el = itemRefs.current[idx];
    if (el) {
      const left = el.offsetLeft - 12; // 패딩 보정
      railRef.current.scrollTo({ left, behavior: "auto" });
    }
  }, [slides]);

  const [rankGender, setRankGender] = useState<Gender | "">(myTeamGender || "W");
  const [rankSeason, setRankSeason] = useState<string>(DEFAULT_SEASON_YEAR);

  const {
    data: ranking,
    loading: rankLoading,
    error: rankErr,
  } = useRanking({
    gender: rankGender,
    season: rankSeason,
    type: "1",
  });

  return (
    <div className={styles.page}>
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
        {error && <p className={styles.stateError}>에러: {error}</p>}
        {!loading && !error && slides.length === 0 && (
          <p className={styles.state}>앞으로 예정된 경기가 없어요.</p>
        )}

        {!loading && !error && slides.length > 0 && (
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

      <section className={styles.bottom} aria-label="팀 랭킹">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {rankGender === "M" ? "남자부" : "여자부"} 랭킹
          </h2>

          <div className={styles.rankControls}>
            <div className={styles.seg}>
              <button
                type="button"
                className={`${styles.segBtn} ${rankGender === "W" ? styles.segActive : ""}`}
                aria-pressed={rankGender === "W"}
                onClick={() => setRankGender("W")}
              >
                여자부
              </button>
              <button
                type="button"
                className={`${styles.segBtn} ${rankGender === "M" ? styles.segActive : ""}`}
                aria-pressed={rankGender === "M"}
                onClick={() => setRankGender("M")}
              >
                남자부
              </button>
            </div>

            <label className={styles.visuallyHidden} htmlFor="season-select">
              시즌 선택
            </label>
            <select
              id="season-select"
              className={styles.seasonSelect}
              value={rankSeason}
              onChange={(e) => setRankSeason(e.target.value)}
              aria-label="시즌 선택"
            >
              {SEASON_YEARS.map((y) => (
                <option key={y} value={y}>
                  {SEASON_LABELS[y]}
                </option>
              ))}
            </select>
          </div>
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
