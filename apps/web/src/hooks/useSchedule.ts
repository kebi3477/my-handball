import { useEffect, useState } from "react";
import { buildScheduleUrl } from "@/config/api";
import type { ScheduleFilters, ScheduleResponse } from "@/types/schedule";

export type UseScheduleResult = {
  data: ScheduleResponse | null;
  loading: boolean;
  err: string | null;
};

export function useSchedule({
  gender,
  season,
  type = "1",
  month,
}: ScheduleFilters): UseScheduleResult {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const url = buildScheduleUrl({ gender, season, type, month });
        const res = await fetch(url, { cache: "no-cache", signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ScheduleResponse;
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
  }, [gender, season, type, month]);

  return { data, loading, err };
}
