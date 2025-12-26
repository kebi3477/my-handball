import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { seasonAtom } from "@/state/season";
import type { SeasonKey } from "@/constants/schedule";

export function useSeason() {
  const [season, setSeason] = useRecoilState(seasonAtom);

  const save = useCallback((next: SeasonKey) => {
    setSeason(next);
  }, [setSeason]);

  return { season, save };
}
