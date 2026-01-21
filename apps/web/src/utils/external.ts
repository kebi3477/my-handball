const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

type ExternalOpenBridge = {
  openExternal: (url: string) => void | Promise<void>;
};

function getBridge(): ExternalOpenBridge | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    api?: ExternalOpenBridge;
    electron?: ExternalOpenBridge;
  };

  return w.api ?? w.electron ?? null;
}

export function normalizeExternalUrl(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function openExternalUrl(value?: string | null) {
  if (typeof window === "undefined") return false;

  const url = normalizeExternalUrl(value);
  if (!url) return false;

  const bridge = getBridge();
  if (bridge?.openExternal) {
    await Promise.resolve(bridge.openExternal(url));
    return true;
  }

  const opened = window.open(url, "_blank");
  if (opened) {
    opened.opener = null;
    return true;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
  return true;
}
