import { useMemo, useState } from "react";
import styles from "./Schedule.module.scss";
import { useSchedule } from "@/hooks/useSchedule";
import { GENDER_LABEL } from "@/constants/schedule";
import type { GameItem } from "@/types/schedule";
import type { Gender } from "@/types/team";
import SkeletonSchedule from "@/components/skeletons/SkeletonSchedule";
import Error from "@/components/Error";
import { useSeason } from "@/hooks/useSeason";
import { Link, useLocation } from "react-router-dom";

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="3" y="3" width="10" height="2" rx="1" fill="currentColor" />
    <rect x="3" y="7" width="10" height="2" rx="1" fill="currentColor" />
    <rect x="3" y="11" width="10" height="2" rx="1" fill="currentColor" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="2" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <rect x="2" y="6" width="12" height="2" fill="currentColor" />
    <path d="M6 2V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M10 2V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

function Logo({ src, alt }: { src: string | null; alt: string }) {
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

function BroadcastChips({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className={styles.card__chips} aria-label="방송">
      {items.map((b, i) => (
        <span className={styles.card__chip} key={`${b}-${i}`}>
          {b}
        </span>
      ))}
    </div>
  );
}

function GameCard({ g }: { g: GameItem }) {
  return (
    <article className={styles.card} role="listitem">
      <div className={styles.card__grid}>
        <div className={styles.card__side}>
          <Logo src={g.home.logoUrl} alt={`${g.home.name} 로고`} />
          <div className={styles.card__team} title={g.home.name}>
            {g.home.name}
          </div>
        </div>

        <div className={styles.card__center}>
          <div className={styles.card__score}>{g.scoreText ?? "- : -"}</div>
          <div className={styles.card__meta}>
            {g.time && <div className={styles.card__meta_item}>{g.time}</div>}
            {g.venue && <div className={styles.card__meta_item}>{g.venue}</div>}
          </div>
        </div>

        <div className={styles.card__side} data-align="right">
          <Logo src={g.away.logoUrl} alt={`${g.away.name} 로고`} />
          <div className={styles.card__team} title={g.away.name}>
            {g.away.name}
          </div>
        </div>
      </div>

      <BroadcastChips items={g.broadcast} />
    </article>
  );
}

function Schedule() {
  const [gender, setGender] = useState<Gender | "">("");
  const { season } = useSeason();
  const [query, setQuery] = useState("");
  const leagueType = "1";
  const location = useLocation();
  const isSchedule = location.pathname === "/schedule";

  const { data, loading, error } = useSchedule({
    gender,
    season,
    type: leagueType,
  });

  const filteredDays = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const match = (g: GameItem) => {
      const text = `${g.home.name} ${g.away.name} ${g.venue ?? ""} ${(g.broadcast ?? []).join(" ")}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      return true;
    };
    return data.days
      .map((d) => ({ ...d, games: d.games.filter(match) }))
      .filter((d) => d.games.length > 0);
  }, [data, query]);

  const titleGender = data
    ? GENDER_LABEL[data.leagueGender]
    : gender
      ? GENDER_LABEL[gender]
      : "전체";

  if (error) {
    return <Error />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.header__top}>
          <h1 className={styles.header__title}>{titleGender} 일정</h1>

          <div className={styles.header__actions}>
            <div className={styles.viewSwitch} role="group" aria-label="보기 전환">
              <Link
                to="/schedule"
                className={styles.viewSwitch__button}
                aria-pressed={isSchedule}
                aria-label="리스트 보기"
              >
                <ListIcon />
              </Link>
              <Link
                to="/calendar"
                className={styles.viewSwitch__button}
                aria-pressed={!isSchedule}
                aria-label="캘린더 보기"
              >
                <CalendarIcon />
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.seg} role="tablist" aria-label="성별 선택">
          <button
            type="button"
            role="tab"
            aria-selected={gender === ""}
            className={`${styles.seg__button} ${gender === "" ? styles.active : ""}`}
            onClick={() => setGender("")}
          >
            전체
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={gender === "W"}
            className={`${styles.seg__button} ${gender === "W" ? styles.active : ""}`}
            onClick={() => setGender("W")}
          >
            여자부
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={gender === "M"}
            className={`${styles.seg__button} ${gender === "M" ? styles.active : ""}`}
            onClick={() => setGender("M")}
          >
            남자부
          </button>
        </div>

        <div className={styles.search}>
          <input
            type="search"
            placeholder="팀/장소/방송 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="검색"
          />
        </div>
      </header>

      {loading && (
        <SkeletonSchedule />)
      }
      
      {!loading && !error && filteredDays.length === 0 && (
        <div className={styles.empty} role="status" aria-live="polite">
          <div className={styles.empty__badge}>일정</div>
          <div className={styles.empty__text}>
            조건에 맞는 경기가 없어요.<br />
            검색어를 지우거나 다른 시즌을 선택해 주세요.
          </div>
        </div>
      )}

      {!loading && !error && filteredDays.length > 0 && (
        <main className={styles.list} role="list">
          {filteredDays.map((d) => (
            <section key={d.dateISO ?? d.dateLabel} className={styles.day}>
              <div className={styles.day__label} aria-label="날짜">
                <span className={styles.day__date}>{d.dateLabel}</span>
                {d.dateISO && <span className={styles.day__iso}>{d.dateISO}</span>}
              </div>
              <div className={styles.day__cards}>
                {d.games.map((g, i) => (
                  <GameCard key={`${d.dateISO}-${i}-${g.home.name}-${g.away.name}`} g={g} />
                ))}
              </div>
            </section>
          ))}
        </main>
      )}
    </div>
  );
}

export default Schedule;
