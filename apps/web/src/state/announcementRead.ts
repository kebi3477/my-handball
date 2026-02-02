import { atom } from "recoil";

const STORAGE_KEY = "readAnnouncements";

type ReadState = string[];

function read(): ReadState {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function write(value: ReadState) {
  if (typeof window === "undefined") return;
  if (!value.length) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export const readAnnouncementsAtom = atom<ReadState>({
  key: "readAnnouncements",
  default: [],
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      if (typeof window === "undefined") return;

      setSelf(read());

      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        setSelf(read());
      };

      window.addEventListener("storage", onStorage);
      onSet((value) => write(value));

      return () => window.removeEventListener("storage", onStorage);
    },
  ],
});
