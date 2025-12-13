import { useEffect, useState } from "react";
import { buildRankingUrl } from "@/config/api";
import type { RankingRequest, RankingResponse } from "@/types/ranking";

export type UseRankingResult = {
  data: RankingResponse | null;
  loading: boolean;
  error: string | null;
};

export function useRanking({
  gender,
  season,
  type = "1",
}: RankingRequest): UseRankingResult {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(buildRankingUrl({ gender, season, type }), { 
          cache: "no-cache", 
          signal: ctrl.signal 
        });

        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}`);
        }

        setData(await res.json());
      } catch (error: any) {
        if ((error as { name?: string })?.name === "AbortError") return;
        setError(error.message ?? "unknown error");
        setData(null);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }

    fetchRanking();
    return () => ctrl.abort();
  }, [gender, season, type]);

  return { data, loading, error };
}
