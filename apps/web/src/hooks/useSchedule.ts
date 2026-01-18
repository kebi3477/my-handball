import { useEffect, useState } from "react";
import { buildScheduleUrl, buildScheduleMyTeamIcsUrl } from "@/config/api";
import type { ScheduleRequest, ScheduleResponse, ScheduleMyTeamRequest } from "@/types/schedule";

export type UseScheduleResult = {
  data: ScheduleResponse | null;
  loading: boolean;
  error: string | null;
};

export function useSchedule({
  gender,
  season,
  type = "1",
  month,
}: ScheduleRequest): UseScheduleResult {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(buildScheduleUrl({ gender, season, type, month }), {
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

    fetchSchedule();
    return () => ctrl.abort();
  }, [gender, season, type, month]);

  return { data, loading, error };
}

export async function downloadMyTeamIcs(
  { gender, season, type = "1", teamName }: ScheduleMyTeamRequest,
): Promise<void> {
  if (!teamName) {
    throw new Error("teamName이 없습니다.");
  }

  const url = buildScheduleMyTeamIcsUrl({
    gender,
    season,
    type,
    teamName,
  } as ScheduleMyTeamRequest);

  const ua = navigator.userAgent ?? "";
  const isIOS = /iPad|iPhone|iPod/i.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const userAgentData = ("userAgentData" in navigator
    ? (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData
    : undefined);
  const isMobile = (userAgentData?.mobile ?? /Android|iPhone|iPad|iPod/i.test(ua));

  if (isMobile || isIOS) {
    window.location.assign(url);
    return;
  }

  try {
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
  } catch {
    window.location.assign(url);
  }
}
