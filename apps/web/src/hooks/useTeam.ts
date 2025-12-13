import { useEffect, useState } from "react";
import { buildTeamUrl } from "@/config/api";
import type { TeamRequest, TeamResponse } from "@/types/team";

export type UseTeamResult = {
  data: TeamResponse | null;
  loading: boolean;
  error: string | null;
};

export function useTeam({
  gender,
}: TeamRequest): UseTeamResult {
  const [data, setData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    
    const fetchTeam = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(buildTeamUrl({ gender }), { 
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
    };

    fetchTeam();
    return () => ctrl.abort();
  }, [gender]);

  return { data, loading, error };
}