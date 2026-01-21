import { atom } from "recoil";

const STORAGE_KEY = "tutorialSeen";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "1" || value === "true";
  } catch {
    return false;
  }
}

function write(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const tutorialSeenAtom = atom<boolean>({
  key: "tutorialSeen",
  default: false,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      if (typeof window === "undefined") return;

      setSelf(read());

      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        setSelf(event.newValue === "1" || event.newValue === "true");
      };

      window.addEventListener("storage", onStorage);
      onSet((value) => write(value));

      return () => window.removeEventListener("storage", onStorage);
    },
  ],
});

export const tutorialOpenAtom = atom<boolean>({
  key: "tutorialOpen",
  default: false,
});
