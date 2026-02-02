import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import BellIcon from "@/assets/icons/icon-bell.svg?react";
import { useAnnouncementRead } from "@/hooks/useAnnouncementRead";
import styles from "./AnnouncementBell.module.scss";

type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const ANNOUNCEMENTS: Announcement[] = [
  { 
    id: "notice-1",
    title: "마이핸드볼 출시",
    body: "안녕하세요. 마이핸드볼 개발자입니다.\n제가 직접 핸드볼 일정을 쉽게 확인하고 싶어 만들게 되었습니다.\n\n 막상 만들다보니 핸드볼을 좋아하시는 많은 분들께서도 사용하시면 좋을 것 같아 출시하게 되었습니다!\n핸드볼을 좋아하시는 주변분들에게 많은 소문을 전해주세요.\n안드로이드 앱은 현재 심사 중이지만, 저에게 직접 연락주시면 사용하실 수 있게 테스터로 등록해드리겠습니다. (kebi3477@naver.com)\n\n많은 이용 부탁드리며, 버그 제보나 개선사항은 언제든지 환영합니다. 감사합니다!\n\n",
    createdAt: "2026-01-30",
  },
];

export default function AnnouncementBell() {
  const { readIds, markRead } = useAnnouncementRead();
  const [panelOpen, setPanelOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  const announcements = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    return [...ANNOUNCEMENTS]
      .filter((item) => {
        if (!item.createdAt) return false;
        const ts = Date.parse(item.createdAt);
        if (Number.isNaN(ts)) return false;
        return now - ts <= weekMs;
      })
      .sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }, []);

  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const unreadCount = announcements.filter((item) => !readSet.has(item.id)).length;
  const hasUnread = unreadCount > 0;

  const openPanel = () => setPanelOpen(true);
  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setDetailOpen(false);
    setSelected(null);
  }, []);

  const closeDetail = () => {
    setDetailOpen(false);
  };

  const openDetail = (item: Announcement) => {
    markRead(item.id);
    setSelected(item);
    setDetailOpen(true);
  };

  const bellLabel = hasUnread ? `공지사항 (안 읽음 ${unreadCount}개)` : "공지사항";

  useEffect(() => {
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;
    if (panelOpen || detailOpen) closePanel();
  }, [closePanel, detailOpen, panelOpen, location.pathname]);

  return (
    <>
      <button type="button" className={styles.bell} onClick={openPanel} aria-label={bellLabel}>
        <BellIcon />
        {hasUnread && <span className={styles.bell__dot} aria-hidden="true" />}
      </button>

      {panelOpen && (
        <div className={styles.modal}>
          <div className={styles.modal__overlay} onClick={closePanel} />
          <div className={styles.modal__sheet} role="dialog" aria-modal="true" aria-label="Notice 목록">
            <div className={styles.header}>
              <strong className={styles.header__title}>공지사항</strong>
              <button type="button" className={styles.header__close} onClick={closePanel} aria-label="닫기">
                ✕
              </button>
            </div>

            <div className={styles.list}>
              {announcements.length === 0 && (
                <p className={styles.empty}>등록된 공지사항이 없습니다.</p>
              )}
              {announcements.map((item) => {
                const isRead = readSet.has(item.id);
                const title = item.title ?? item.body.split("\n")[0];

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.item} ${isRead ? styles.item_read : ""}`}
                    onClick={() => openDetail(item)}
                  >
                    <div className={styles.item__header}>
                      <strong className={styles.item__title}>{title}</strong>
                      {item.createdAt && (
                        <span className={styles.item__date}>{item.createdAt}</span>
                      )}
                    </div>
                    <p className={styles.item__body}>{item.body}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {detailOpen && selected && (
        <div className={`${styles.modal} ${styles.modal_detail}`}>
          <div className={styles.modal__overlay} onClick={closeDetail} />
          <div
            className={`${styles.modal__sheet} ${styles.modal__sheet_detail}`}
            role="dialog"
            aria-modal="true"
            aria-label="Notice 상세"
          >
            <div className={styles.header}>
              <strong className={styles.header__title}>Notice</strong>
              <button type="button" className={styles.header__close} onClick={closeDetail} aria-label="닫기">
                ✕
              </button>
            </div>

            <div className={styles.detail}>
              <h3 className={styles.detail__title}>{selected.title ?? selected.body.split("\n")[0]}</h3>
              {selected.createdAt && (
                <p className={styles.detail__date}>{selected.createdAt}</p>
              )}
              <p className={styles.detail__body}>{selected.body}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
