import { useState } from "react";
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

  const topRank = [2, 1, 3].map((r) => data?.items.find((item) => item.rank === r));
  const otherRank = data?.items.filter((item) => item.rank > 3);

  if (error) return <Error />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.header__title}>팀 랭킹</h1>
        <div className={styles.seg} role="tablist" aria-label="성별 선택">
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

      {!loading && data && data.items.length > 1 && (
        <div className={styles.rank}>
          <div className={styles.rank__top}>
            {topRank.map((r, idx) => (
              <div key={idx} className={styles.rank__top__wrap}>
                <div className={styles.rank__top__title}>{r ? `${r.rank}위` : "-"}</div>
                <div className={styles.rank__top__card}>
                  <div className={styles.rank__top__card__image}>
                    <img src={r?.team.logoUrl ?? ""} alt={r ? `${r.team.name} 로고` : "랭킹 팀 로고"} />
                  </div>
                  <div className={styles.rank__top__card__name}>{r?.team.name ?? "-"}</div>
                  <div className={styles.rank__top__card__point}>{r ? `${r.points}점` : ""}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.rank__scroll}>
            {otherRank?.map((r) => (
              <div key={r.rank} className={styles.rank__item}>
                <div className={styles.rank__title}>{r.rank}위</div>
                <div className={styles.rank__card}>
                  <div className={styles.rank__card__image}>
                    <img src={r.team.logoUrl ?? ""} alt={`${r.team.name} 로고`} />
                  </div>
                  <div className={styles.rank__card__name}>{r.team.name}</div>
                  <div className={styles.rank__card__point}>{r.points}점</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (!data || data.items.length <= 1) && (
        <div className={styles.rank__empty} role="status" aria-live="polite">
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
