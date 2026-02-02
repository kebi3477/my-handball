import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { readAnnouncementsAtom } from "@/state/announcementRead";

export function useAnnouncementRead() {
  const [readIds, setReadIds] = useRecoilState(readAnnouncementsAtom);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, [setReadIds]);

  const reset = useCallback(() => {
    setReadIds([]);
  }, [setReadIds]);

  return { readIds, markRead, reset, setReadIds };
}
