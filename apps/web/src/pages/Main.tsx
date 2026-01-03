import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Main.module.scss";
import { useSchedule } from "@/hooks/useSchedule";
import { useRanking } from "@/hooks/useRanking";
import { useMyTeam } from "@/hooks/useMyTeam";
import { useSeason } from "@/hooks/useSeason";
import type { GameItem } from "@/types/schedule";
import type { Gender } from "@/types/team";
import { getCardDateLabel, toGameDate } from "@/utils/common";
import SkeletonCard from "@/components/skeletons/SkeletonCard";
import SkeletonRank from "@/components/skeletons/SkeletonRank";
import Error from "@/components/Error";

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

function Logo({ src, alt }: { src: string | null | undefined; alt: string }) {
  return (
    <div className={styles.logoWrapper}>
      {src ? (
        <img className={styles.logo} src={src} alt={alt} loading="lazy" />
      ) : (
        <div className={styles.logoFallback} aria-label={alt} />
      )}
    </div>
  );
}

export default function Main() {
  const { team: myTeam } = useMyTeam();
  const myTeamName = myTeam?.name ?? "";
  const myTeamGender = (myTeam?.gender as Gender | "") ?? "";
  const { season } = useSeason();

  const { data, loading, error } = useSchedule({
    gender: myTeamGender,
    season,
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
          dateLabel: getCardDateLabel(dt),
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
    console.log('idx', idx, el);
    if (el) {
      const left = el.offsetLeft - 12;
      console.log('left', left);
      railRef.current.scrollTo({ left, behavior: "auto" });
    }
  }, [slides]);

  const [rankGender, setRankGender] = useState<Gender | "">(myTeamGender || "M");

  const {
    data: ranking,
    loading: rankLoading,
    error: rankError,
  } = useRanking({
    gender: rankGender,
    season,
    type: "1",
  });

  const topRank = [2, 1, 3].map((r) => ranking?.items.find((item) => item.rank === r))
  const otherRank = ranking?.items.filter(item => item.rank > 3);

  if (error || rankError) {
    return <Error />
  }
  
  return (
    <div className={styles.page}>
      <section className={styles.top} aria-label="가까운 경기">
        <header className={styles.header}>
          <h2 className={styles.header__title}>가까운 경기</h2>
          <button className={styles.header__button}>{myTeam ? `${myTeamName} 일정` : '전체 일정'}</button>
        </header>

        {loading && (
          <SkeletonCard />
        )}

        {!loading && !error && slides.length === 0 && (
          <div className={styles.rail__empty} role="status" aria-live="polite">
            <div className={styles.rail__empty__badge}>일정</div>
            <div className={styles.rail__empty__text}>
              앞으로 예정된 경기가 없어요.<br />
              다른 시즌을 확인해 보세요.
            </div>
          </div>
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
                  <div className={styles.card__header}>
                    <div className={styles.card__badge}>Closed</div>
                  </div>

                  <div className={styles.card__info}>
                    <div className={styles.timeline}>
                      {s.dateLabel}
                    </div>
                    {g.venue && <div className={styles.venue}>{g.venue}</div>}
                  </div>

                  <div className={styles.card__grid}>
                    <div className={styles.card__grid__side}>
                      <Logo src={g.home.logoUrl} alt={`${g.home.name} 로고`} />
                      <div className={styles.team} title={g.home.name}>
                        {g.home.name}
                      </div>
                    </div>

                    <div className={styles.card__grid__center}>
                      <div className={styles.score}>{g.scoreText ?? "- : -"}</div>
                    </div>

                    <div className={styles.card__grid__side}>
                      <Logo src={g.away.logoUrl} alt={`${g.away.name} 로고`} />
                      <div className={styles.team} title={g.away.name}>
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
        <header className={styles.header}>
          <h2 className={styles.header__title}>
            팀 순위
          </h2>

          <div className={styles.seg}>
            <button
              type="button"
              className={`${styles.seg__button} ${rankGender === "M" ? styles.active : ""}`}
              aria-pressed={rankGender === "M"}
              onClick={() => setRankGender("M")}
            >
              남자부
            </button>
            <button
              type="button"
              className={`${styles.seg__button} ${rankGender === "W" ? styles.active : ""}`}
              aria-pressed={rankGender === "W"}
              onClick={() => setRankGender("W")}
            >
              여자부
            </button>
          </div>
        </header>

        {rankLoading && (
          <SkeletonRank />
        )}

        {!rankLoading && !rankError && (!ranking || ranking.items.length <= 1) && (
          <div className={styles.rank__empty} role="status" aria-live="polite">
            <div className={styles.rank__empty__badge}>랭킹</div>
            <div className={styles.rank__empty__text}>
              아직 불러올 랭킹 데이터가 없어요.<br />
              시즌/성별을 바꿔 다시 확인해 주세요.
            </div>
          </div>
        )}

        {!rankLoading && !rankError && ranking && ranking.items.length > 1 && (
          <div className={styles.rank}>
            <div className={styles.rank__top}>
              { topRank && topRank.map(r => (
                <div className={styles.rank__top__wrap}>
                  <div className={styles.rank__top__title}>
                    {r?.rank}위
                  </div>
                  <div className={styles.rank__top__card}>
                    <div className={styles.rank__top__card__image}>
                      <img src={r?.team.logoUrl ?? ''} alt={`${r?.team.name} 로고`} />
                    </div> 
                    <div className={styles.rank__top__card__name}>
                      {r?.team.name}
                    </div>
                    <div className={styles.rank__top__card__point}>
                      {r?.points}점
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.rank__scroll}>
              { otherRank?.map((r) => (
                <div className={styles.rank__item}>
                  <div className={styles.rank__title}>
                    {r.rank}위
                  </div>

                  <div className={styles.rank__card}>
                    <div className={styles.rank__card__image}>
                      <img src={r?.team.logoUrl ?? ''} alt={`${r?.team.name} 로고`} />
                    </div> 
                    <div className={styles.rank__card__name}>
                      {r?.team.name}
                    </div>
                    <div className={styles.rank__card__point}>
                      {r?.points}점
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
