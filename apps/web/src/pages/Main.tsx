import { useEffect, useMemo, useRef } from "react";
import styles from "./Main.module.scss";
import { useSchedule } from "@/hooks/useSchedule";
import { useMyTeam } from "@/hooks/useMyTeam";
import { DEFAULT_SEASON_YEAR } from "@/constants/schedule";
import type { DayBlock, GameItem } from "@/types/schedule";
import type { Gender } from "@/types/team";

/** 날짜/시간 → Date 객체 */
function toGameDate(d: DayBlock, g: GameItem): Date {
  const base = (d.dateISO ?? "").trim(); // YYYY-MM-DD
  const time = (g.time ?? "12:00").trim();
  const [y, m, day] = base.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y || 1970, (m || 1) - 1, day || 1, hh || 12, mm || 0, 0, 0);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

  const gender: Gender | "" = myTeamName ? myTeamGender || "" : "";
  const { data, loading, err } = useSchedule({
    gender,
    season: DEFAULT_SEASON_YEAR,
    type: "1",
  });

  const slides = useMemo<SlideItem[]>(() => {
    if (!data) return [];
    const tmp: SlideItem[] = [];
    for (const d of data.days) {
      for (const g of d.games) {
        const dt = toGameDate(d, g);
        const isMine =
          !!myTeamName &&
          (g.home.name.includes(myTeamName) || g.away.name.includes(myTeamName));
        tmp.push({
          id: `${d.dateISO ?? d.dateLabel}-${g.home.name}-${g.away.name}-${g.time ?? ""}`,
          date: dt,
          dateLabel: d.dateLabel,
          game: g,
          isMyTeam: isMine,
        });
      }
    }
    const filtered = myTeamName ? tmp.filter((x) => x.isMyTeam) : tmp;
    filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
    return filtered;
  }, [data, myTeamName]);

  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!slides.length || !railRef.current) return;
    const now = new Date();
    const todayIdx = slides.findIndex((x) => isSameDay(x.date, now));
    let idx = todayIdx >= 0 ? todayIdx : 0;
    if (todayIdx < 0) {
      let best = 0;
      let bestDiff = Infinity;
      slides.forEach((s, i) => {
        const diff = Math.abs(s.date.getTime() - now.getTime());
        if (diff < bestDiff) {
          best = i;
          bestDiff = diff;
        }
      });
      idx = best;
    }
    const el = itemRefs.current[idx];
    if (el) {
      const left = el.offsetLeft - 12; // 패딩 보정
      railRef.current.scrollTo({ left, behavior: "auto" });
    }
  }, [slides.length]);

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
        {err && <p className={styles.stateError}>에러: {err}</p>}
        {!loading && !err && slides.length === 0 && (
          <p className={styles.state}>
            {myTeamName ? "마이팀 경기 일정이 없어요." : "표시할 경기가 없어요."}
          </p>
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

      <section className={styles.bottom} aria-label="테이블 영역(추가 예정)">
        <div className={styles.tablePlaceholder}>아래 영역엔 표가 들어갈 예정이에요.</div>
      </section>
    </div>
  );
}
