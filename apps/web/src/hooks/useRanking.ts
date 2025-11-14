import { useEffect, useState } from "react";
import { buildRankingUrl } from "@/config/api";
import type { RankingFilters, RankingResponse } from "@/types/ranking";

export type UseRankingResult = {
  data: RankingResponse | null;
  loading: boolean;
  err: string | null;
};

export function useRanking({
  gender,
  season,
  type = "1",
}: RankingFilters): UseRankingResult {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const url = buildRankingUrl({ gender, season, type });
        const res = await fetch(url, { cache: "no-cache", signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as RankingResponse;
        setData(json);
      } catch (error: unknown) {
        if ((error as { name?: string })?.name === "AbortError") return;
        const message =
          error instanceof Error ? error.message : typeof error === "string" ? error : "unknown error";
        setErr(message);
        setData(null);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [gender, season, type]);

  return { data, loading, err };
}
