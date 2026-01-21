import { useMemo, useState } from "react";
import styles from "./Ranking.module.scss";
import { useRanking } from "@/hooks/useRanking";
import { useSeason } from "@/hooks/useSeason";
import { useMyTeam } from "@/hooks/useMyTeam";
import type { Gender } from "@/types/team";
import SkeletonRank from "@/components/skeletons/SkeletonRank";
import Error from "@/components/Error";

export default function Ranking() {
  const { season } = useSeason();
  const { team } = useMyTeam();
  const [gender, setGender] = useState<Gender | "">((team?.gender as Gender | "") || "M");

  const { data, loading, error } = useRanking({ gender, season, type: "1" });

  const ranks = useMemo(
    () => (data ? [...data.items].sort((a, b) => a.rank - b.rank) : []),
    [data],
  );

  if (error) return <Error />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.header__title}>팀 랭킹</h1>
        <div className={styles.seg} role="tablist" aria-label="성별 선택" data-tutorial-id="ranking-gender">
          <button
            type="button"
            role="tab"
            aria-selected={gender === "M"}
            className={`${styles.seg__button} ${gender === "M" ? styles.active : ""}`}
            onClick={() => setGender("M")}
          >
            남자부
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
        </div>
      </header>

      {loading && <SkeletonRank />}

      {!loading && data && ranks.length > 1 && (
        <div className={styles.rank} data-tutorial-id="ranking-list">
          <div className={styles.rank__header} aria-hidden={true}>
            <div className={`${styles.rank__col} ${styles.rank__colTeam}`}>팀명/순위</div>
            <div className={styles.rank__col}>경기수</div>
            <div className={styles.rank__col}>승점</div>
            <div className={styles.rank__col}>승</div>
            <div className={styles.rank__col}>무</div>
            <div className={styles.rank__col}>패</div>
          </div>

          <div className={styles.rank__list}>
            {ranks.map((item) => (
              <div key={item.rank} className={styles.rank__row}>
                <div className={`${styles.rank__col} ${styles.rank__colTeam}`}>
                  <div className={styles.rank__logo}>
                    {item.team.logoUrl ? (
                      <img src={item.team.logoUrl} alt={`${item.team.name} 로고`} />
                    ) : (
                      <div className={styles.rank__logo__fallback} aria-label={`${item.team.name} 로고`} />
                    )}
                  </div>
                  <div className={styles.rank__teamInfo}>
                    <span className={styles.rank__position}>{item.rank}위</span>
                    <span className={styles.rank__name}>{item.team.name}</span>
                  </div>
                </div>
                <div className={styles.rank__col}>{item.played}</div>
                <div className={styles.rank__col}>{item.points}</div>
                <div className={styles.rank__col}>{item.wins}</div>
                <div className={styles.rank__col}>{item.draws}</div>
                <div className={styles.rank__col}>{item.losses}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (!data || data.items.length <= 1) && (
        <div
          className={styles.rank__empty}
          role="status"
          aria-live="polite"
          data-tutorial-id="ranking-list"
        >
          <div className={styles.rank__empty__badge}>랭킹</div>
          <div className={styles.rank__empty__text}>
            아직 불러올 랭킹 데이터가 없어요.<br />
            시즌/성별을 바꿔 다시 확인해 주세요.
          </div>
        </div>
      )}
    </div>
  );
}
