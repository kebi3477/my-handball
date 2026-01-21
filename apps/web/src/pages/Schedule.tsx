import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Schedule.module.scss";
import { useSchedule } from "@/hooks/useSchedule";
import { GENDER_LABEL } from "@/constants/schedule";
import type { GameItem, LiveLink } from "@/types/schedule";
import type { Gender } from "@/types/team";
import SkeletonSchedule from "@/components/skeletons/SkeletonSchedule";
import Error from "@/components/Error";
import { useSeason } from "@/hooks/useSeason";
import { Link, useLocation } from "react-router-dom";
import { useMyTeam } from "@/hooks/useMyTeam";
import ListIcon from '@/assets/icons/icon-list.svg?react';
import CalendarIcon from "@/assets/icons/icon-calendar.svg?react";
import { parseISODate } from "@/utils/schedule";
import { normalizeExternalUrl, openExternalUrl } from "@/utils/external";

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

type BroadcastChipsProps = {
  liveLinks: LiveLink[];
};

const EXTERNAL_OPEN_ERROR = "링크를 열 수 없습니다. 잠시 후 다시 시도해 주세요.";

function labelForProvider(provider?: string) {
  const key = (provider ?? "").toLowerCase();
  if (key === "naver") return "NAVER";
  if (key === "daum") return "DAUM";
  return "생중계";
}

function BroadcastChips({ liveLinks }: BroadcastChipsProps) {
  const validLinks = (liveLinks ?? []).filter((link) =>
    normalizeExternalUrl(link.url),
  );
  if (validLinks.length === 0) return null;
  return (
    <div className={styles.card__chips} aria-label="방송">
      {validLinks.map((link, i) => (
        <button
          key={`${link.provider}-${i}`}
          type="button"
          className={`${styles.card__chip} ${styles.card__chipLink}`}
          onClick={async () => {
            const ok = await openExternalUrl(link.url);
            if (!ok) alert(EXTERNAL_OPEN_ERROR);
          }}
          aria-label={`${labelForProvider(link.provider)} 생중계 바로가기`}
        >
          {labelForProvider(link.provider)}
          <span className={styles.card__chipIcon} aria-hidden>
            <svg viewBox="0 0 24 24" width="12" height="12" focusable="false" aria-hidden="true">
              <path
                d="M7 17L17 7M9 7h8v8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
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

      <BroadcastChips liveLinks={g.liveLinks ?? []} />
    </article>
  );
}

function Schedule() {
  const [gender, setGender] = useState<Gender | "">("");
  const [query, setQuery] = useState<string>("");
  
  const { season } = useSeason();
  const { team: myTeam } = useMyTeam();
  const { data, loading, error } = useSchedule({
    gender,
    season,
  });
  
  const location = useLocation();
  const myTeamName = myTeam?.name ?? "";
  const isSchedule = location.pathname === "/schedule";
  const hasMyTeam = !!myTeamName;
  
  const [showMyTeam, setShowMyTeam] = useState<boolean>(hasMyTeam);

  const filteredDays = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const match = (g: GameItem) => {
      const text = `${g.home.name} ${g.away.name} ${g.venue ?? ""} ${(g.broadcast ?? []).join(" ")}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      if (showMyTeam && myTeamName) {
        const mine = g.home.name.includes(myTeamName) || g.away.name.includes(myTeamName);
        if (!mine) return false;
      }
      return true;
    };
    return data.days
      .map((d) => ({ ...d, games: d.games.filter(match) }))
      .filter((d) => d.games.length > 0);
  }, [data, query, showMyTeam, myTeamName]);

  const targetInfo = useMemo(() => {
    if (!filteredDays.length) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayIndex = -1;
    let futureIndex = -1;
    let futureDiff = Number.POSITIVE_INFINITY;
    let closestIndex = -1;
    let closestDiff = Number.POSITIVE_INFINITY;

    filteredDays.forEach((day, index) => {
      const parsed = parseISODate(day.dateISO ?? "");
      if (!parsed) return;
      const diff = parsed.getTime() - today.getTime();
      const abs = Math.abs(diff);

      if (diff === 0 && todayIndex === -1) {
        todayIndex = index;
      }
      if (diff >= 0 && diff < futureDiff) {
        futureDiff = diff;
        futureIndex = index;
      }
      if (abs < closestDiff) {
        closestDiff = abs;
        closestIndex = index;
      }
    });
    
    const label = "최근 경기로";
    if (todayIndex >= 0) {
      return { index: todayIndex, label };
    }
    if (futureIndex >= 0) {
      return { index: futureIndex, label };
    }
    if (closestIndex >= 0) {
      return { index: closestIndex, label };
    }
    return null;
  }, [filteredDays]);

  const [showJump, setShowJump] = useState(false);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (!targetInfo) {
      setShowJump(false);
      return;
    }

    setShowJump(true);
    hasScrolledRef.current = false;

    const findTarget = () =>
      document.querySelector<HTMLElement>(`[data-day-index="${targetInfo.index}"]`);
    const getScrollRoot = () => document.getElementById("root");

    let rafId = 0;
    const update = () => {
      if (!hasScrolledRef.current) return;
      const target = findTarget();
      const root = getScrollRoot();
      if (!root) return;
      if (!target) {
        setShowJump(false);
        return;
      }
      const rect = target.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const rootHeight = rootRect.height || window.innerHeight;
      const inView = rect.top < rootRect.bottom && rect.bottom > rootRect.top;
      const isPastTarget = rect.top - rootRect.top <= rootHeight * 0.3;
      setShowJump(!inView && !isPastTarget);
    };

    const onScroll = () => {
      if (!hasScrolledRef.current) {
        hasScrolledRef.current = true;
      }
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    const root = getScrollRoot();
    root?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      root?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [targetInfo]);

  const handleJump = () => {
    if (!targetInfo) return;
    const target = document.querySelector<HTMLElement>(`[data-day-index="${targetInfo.index}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (error) {
    return <Error />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.header__top}>
          <h1 className={styles.header__title}>일정</h1>

          <div className={styles.header__actions}>
            <div
              className={styles.viewSwitch}
              role="group"
              aria-label="보기 전환"
              data-tutorial-id="schedule-view-switch"
            >
              <Link
                to="/schedule"
                className={styles.viewSwitch__button}
                aria-pressed={isSchedule}
                aria-label="리스트 보기"
            >
              <ListIcon />
            </Link>
            {hasMyTeam ? (
              <Link
                to="/calendar"
                className={styles.viewSwitch__button}
                aria-pressed={!isSchedule}
                aria-label="캘린더 보기"
              >
                <CalendarIcon />
              </Link>
            ) : (
              <button
                type="button"
                className={styles.viewSwitch__button}
                aria-disabled="true"
                aria-label="마이팀을 선택해 주세요"
                title="마이팀을 선택해 주세요"
                disabled
              >
                <CalendarIcon />
              </button>
            )}
          </div>
        </div>
        </div>

        <div className={styles.filters}>
          <div
            className={styles.seg}
            role="tablist"
            aria-label="성별 선택"
            data-tutorial-id="schedule-filter"
          >
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

          <button
            type="button"
            className={`${styles.myToggle} ${showMyTeam ? styles.active : ""}`}
            aria-pressed={showMyTeam}
            onClick={() => setShowMyTeam((prev) => !prev)}
            disabled={!myTeamName}
            aria-label={myTeamName ? "마이팀 경기만 보기" : "마이팀을 선택해 주세요"}
            title={myTeamName ? "마이팀 경기만 보기" : "마이팀을 선택해 주세요"}
          >
            <span className={styles.myToggle__thumb} />
            <span className={styles.myToggle__label}>MY</span>
          </button>
        </div>

        <div className={styles.search} data-tutorial-id="schedule-search">
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
          {filteredDays.map((d, index) => (
            <section
              key={d.dateISO ?? d.dateLabel}
              className={styles.day}
              data-day-index={index}
              data-day-date={d.dateISO ?? ""}
            >
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

      {targetInfo && showJump && (
        <button
          type="button"
          className={styles.jump_button}
          onClick={handleJump}
          aria-label={targetInfo.label}
        >
          {targetInfo.label}
        </button>
      )}
    </div>
  );
}

export default Schedule;
