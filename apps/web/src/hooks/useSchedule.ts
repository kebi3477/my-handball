import { useEffect, useState } from "react";
import { buildScheduleUrl, buildScheduleMyTeamIcsUrl } from "@/config/api";
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

type MyTeamIcsParams = {
  gender?: string | null;
  season: string;
  type?: string;
};

export async function downloadMyTeamIcs(
  { gender, season, type = "1" }: MyTeamIcsParams,
  teamName: string,
): Promise<void> {
  if (!teamName) {
    throw new Error("teamName이 없습니다.");
  }

  const url = buildScheduleMyTeamIcsUrl({
    gender: gender ?? "",
    season,
    type,
    teamName,
  });

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;
    return;
  }

  const res = await fetch(url, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`ICS 다운로드 실패 (HTTP ${res.status})`);
  }

  const blob = await res.blob();
  const objectUrl = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `myteam-${season}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}