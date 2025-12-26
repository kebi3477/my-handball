import { atom } from "recoil";
import { DEFAULT_SEASON_YEAR, type SeasonKey } from "@/constants/schedule";

const STORAGE_KEY = "season";

function read(): SeasonKey {
  if (typeof window === "undefined") return DEFAULT_SEASON_YEAR;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) as SeasonKey | null;
    return raw ?? DEFAULT_SEASON_YEAR;
  } catch {
    return DEFAULT_SEASON_YEAR;
  }
}

function write(value: SeasonKey) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore write errors
  }
}

export const seasonAtom = atom<SeasonKey>({
  key: "season",
  default: DEFAULT_SEASON_YEAR,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      if (typeof window === "undefined") return;

      setSelf(read());

      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        const next = (event.newValue ?? undefined) as SeasonKey | undefined;
        setSelf(next ?? DEFAULT_SEASON_YEAR);
      };

      window.addEventListener("storage", onStorage);
      onSet((next) => write(next));

      return () => window.removeEventListener("storage", onStorage);
    },
  ],
});
