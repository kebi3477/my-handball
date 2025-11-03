import { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./SlideMenu.module.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SlideMenu({ isOpen, onClose }: Props) {
  // 추후 로컬스토리지 등에서 가져오도록 확장 가능
  const myTeam: string | null = null;
  const myTeamLabel = useMemo(
    () => (myTeam ? myTeam : "팀을 선택해 주세요"),
    [myTeam]
  );

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.show : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`${styles.panel} ${isOpen ? styles.open : ""}`}
        aria-hidden={!isOpen}
        aria-label="사이드 메뉴"
      >
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>메뉴</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="메뉴 닫기">✕</button>
        </div>

        <nav className={styles.nav}>
          {/* 마이팀 */}
          <button className={styles.item} type="button" onClick={() => {/* TODO: 마이팀 선택 팝업 */}}>
            <div className={styles.itemTitle}>마이팀</div>
            <div className={styles.itemDesc}>{myTeamLabel}</div>
          </button>

          {/* 구분선 */}
          <hr className={styles.divider} />

          {/* 달력 (향후 연결 예정) */}
          <button className={styles.item} type="button" onClick={() => {/* TODO: 달력 화면 연결 */}}>
            <div className={styles.itemTitle}>달력</div>
          </button>

          {/* 전체 일정 */}
          <Link className={styles.itemLink} to="/schedule" onClick={onClose}>
            <div className={styles.itemTitle}>전체 일정</div>
            <div className={styles.itemDesc}>리그 전체 일정 보기</div>
          </Link>
        </nav>
      </aside>
    </>
  );
}
