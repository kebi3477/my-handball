import { useCallback, useEffect, useState } from "react";

export type Gender = "W" | "M";
export type TeamItem = {
  teamNum: number;
  name: string;
  logoUrl: string | null;
  href: string | null;
};
export type TeamApiRes = { gender: Gender; items: TeamItem[] };

const KEY = "myTeam";

export type MyTeam = {
  gender: Gender;
  teamNum: number;
  name: string;
  logoUrl: string | null;
};

export function useMyTeam() {
  const [team, setTeam] = useState<MyTeam | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setTeam(JSON.parse(raw));
    } catch {}
  }, []);

  const save = useCallback((t: MyTeam | null) => {
    setTeam(t);
    try {
      if (t) localStorage.setItem(KEY, JSON.stringify(t));
      else localStorage.removeItem(KEY);
    } catch {}
  }, []);

  return { team, save };
}

export function useTeams(gender: Gender) {
  const [data, setData] = useState<TeamItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setData(null);
        const res = await fetch(`/api/team?gender=${gender}`, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as TeamApiRes;
        if (alive) setData(json.items);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [gender]);

  return { data, loading, err };
}