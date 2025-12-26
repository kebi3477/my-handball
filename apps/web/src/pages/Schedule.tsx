import { useMemo, useState } from "react";
import styles from "./Schedule.module.scss";
import { useSchedule } from "@/hooks/useSchedule";
import {
  DEFAULT_SEASON_YEAR,
  GENDER_LABEL,
  SEASON_LABELS,
  SEASON_YEARS,
} from "@/constants/schedule";
import type { GameItem } from "@/types/schedule";
import type { Gender } from "@/types/team";
import type { SeasonKey } from "@/constants/schedule";
import SkeletonSchedule from "@/components/skeletons/SkeletonSchedule";
import Error from "@/components/Error";

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
  const [season, setSeason] = useState<SeasonKey>(DEFAULT_SEASON_YEAR);
  const [query, setQuery] = useState("");
  const leagueType = "1";

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
            <label className={styles.visuallyHidden} htmlFor="season-select">시즌 선택</label>
            <select
              id="season-select"
              className={styles.select}
              value={season}
              onChange={(e) => setSeason(e.target.value as SeasonKey)}
              aria-label="시즌 선택"
            >
              {SEASON_YEARS.map((y) => (
                <option key={y} value={y}>{SEASON_LABELS[y]}</option>
              ))}
            </select>

            {data?.url && (
              <a
                className={styles.header__link}
                href={data.url}
                target="_blank"
                rel="noreferrer"
                aria-label="공식 일정 페이지"
              >
                공식페이지 ↗
              </a>
            )}
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
