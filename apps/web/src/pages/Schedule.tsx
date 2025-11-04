import { useMemo, useState } from "react";
import styles from "./Schedule.module.scss";
import { useSchedule } from "@/hooks/useSchedule";
import { DEFAULT_SEASON_YEAR, GENDER_LABEL, SEASON_LABELS, SEASON_YEARS } from "@/constants/schedule";
import type { GameItem } from "@/types/schedule";
import type { Gender } from "@/types/team";
import type { SeasonKey } from "@/constants/schedule";

function Logo({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <div className={styles.logoFallback} aria-label={alt} />;
  return <img className={styles.logo} src={src} alt={alt} loading="lazy" />;
}

function BroadcastChips({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className={styles.chips} aria-label="방송">
      {items.map((b, i) => (
        <span className={styles.chip} key={`${b}-${i}`}>
          {b}
        </span>
      ))}
    </div>
  );
}

function Score({ text }: { text: string | null }) {
  return <div className={styles.score}>{text ?? "- : -"}</div>;
}

function GameCard({ g }: { g: GameItem }) {
  return (
    <article className={styles.card} role="listitem">
      <div className={styles.teams}>
        <div className={styles.team}>
          <Logo src={g.home.logoUrl} alt={`${g.home.name} 로고`} />
          <div className={styles.teamName} title={g.home.name}>
            {g.home.name}
          </div>
        </div>

        <Score text={g.scoreText} />

        <div className={styles.team} data-align="right">
          <Logo src={g.away.logoUrl} alt={`${g.away.name} 로고`} />
          <div className={styles.teamName} title={g.away.name}>
            {g.away.name}
          </div>
        </div>
      </div>

      <div className={styles.meta}>
        {g.time && (
          <div className={styles.metaItem} aria-label="경기 시작">
            <span className={styles.metaIcon}>🕒</span>
            <span>{g.time}</span>
          </div>
        )}
        {g.venue && (
          <div className={styles.metaItem} aria-label="경기장">
            <span className={styles.metaIcon}>📍</span>
            <span>{g.venue}</span>
          </div>
        )}
      </div>

      <BroadcastChips items={g.broadcast} />
    </article>
  );
}

function Schedule() {
  const [gender, setGender] = useState<Gender | "">("");
  const [season, setSeason] = useState<SeasonKey>(DEFAULT_SEASON_YEAR);
  const leagueType = "1";

  const { data, loading, err } = useSchedule({ gender, season, type: leagueType });
  const [query, setQuery] = useState("");

  const filteredDays = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const pred = (g: GameItem) => {
      const text = `${g.home.name} ${g.away.name} ${g.venue ?? ""} ${(g.broadcast ?? []).join(" ")}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      return true;
    };
    return data.days
      .map((d) => ({ ...d, games: d.games.filter(pred) }))
      .filter((d) => d.games.length > 0);
  }, [data, query]);

  const titleGender = data ? GENDER_LABEL[data.leagueGender] : GENDER_LABEL[gender];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            {titleGender} 일정
          </h1>

          <label className={styles.visuallyHidden} htmlFor="season-select">시즌 선택</label>
          <div className={styles.seasonBox}>
            <select
              id="season-select"
              className={styles.seasonSelect}
              value={season}
              onChange={(e) => setSeason(e.target.value as SeasonKey)}
              aria-label="시즌 선택"
            >
              {SEASON_YEARS.map((y) => (
                <option key={y} value={y}>{SEASON_LABELS[y]}</option>
              ))}
            </select>
          </div>
          {data?.url && (
            <a
              className={styles.link}
              href={data.url}
              target="_blank"
              rel="noreferrer"
              aria-label="공식 일정 페이지"
            >
              공식페이지 ↗
            </a>
          )}
        </div>

        {/* 성별 전환 탭 */}
        <div className={styles.tabs} role="tablist" aria-label="성별 선택">
          <button
            role="tab"
            aria-selected={gender === ""}
            className={`${styles.tab} ${gender === "" ? styles.tabActive : ""}`}
            onClick={() => setGender("")}
          >
            전체
          </button>
          <button
            role="tab"
            aria-selected={gender === "W"}
            className={`${styles.tab} ${gender === "W" ? styles.tabActive : ""}`}
            onClick={() => setGender("W")}
          >
            여자부
          </button>
          <button
            role="tab"
            aria-selected={gender === "M"}
            className={`${styles.tab} ${gender === "M" ? styles.tabActive : ""}`}
            onClick={() => setGender("M")}
          >
            남자부
          </button>
        </div>

        {/* 검색 */}
        <div className={styles.controls}>
          <input
            className={styles.search}
            type="search"
            placeholder="팀/장소/방송 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="검색"
          />
        </div>
      </header>

      {loading && <p className={styles.state}>불러오는 중…</p>}
      {err && <p className={styles.stateError}>에러: {err}</p>}
      {!loading && !err && filteredDays.length === 0 && <p className={styles.state}>조건에 맞는 경기가 없어요.</p>}

      <main className={styles.list} role="list">
        {filteredDays.map((d) => (
          <section key={d.dateISO ?? d.dateLabel} className={styles.daySection}>
            <div className={styles.stickyDate} aria-label="날짜">
              <span className={styles.dateBig}>{d.dateLabel}</span>
              {d.dateISO && <span className={styles.dateISO}>{d.dateISO}</span>}
            </div>
            <div className={styles.cards}>
              {d.games.map((g, i) => (
                <GameCard key={`${d.dateISO}-${i}-${g.home.name}-${g.away.name}`} g={g} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default Schedule;
