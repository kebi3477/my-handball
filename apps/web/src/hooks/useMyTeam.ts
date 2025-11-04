// src/hooks/useMyTeam.ts
import { useCallback, useEffect, useState } from "react";
import type { MyTeam } from "@/types/team";

const KEY = "myTeam";

export function useMyTeam() {
  const [team, setTeam] = useState<MyTeam | null>(null);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(KEY);
        setTeam(raw ? (JSON.parse(raw) as MyTeam) : null);
      } catch {
        setTeam(null);
      }
    };

    load();

    // 다른 탭/컴포넌트에서 변경돼도 반영되도록 storage 이벤트 구독
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = useCallback((t: MyTeam | null) => {
    setTeam(t);
    try {
      if (t) localStorage.setItem(KEY, JSON.stringify(t));
      else localStorage.removeItem(KEY);
    } catch {
      // 스토리지가 막힌 환경 등은 조용히 무시
    }
  }, []);

  return { team, save };
}
