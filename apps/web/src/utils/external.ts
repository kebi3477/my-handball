const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

type ExternalOpenBridge = {
  openExternal: (url: string) => void | Promise<void>;
};

type NativeBridgeMessage = {
  type: "OPEN_URL_EXTERNAL";
  payload: {
    url: string;
  };
};

type NativeBridgeHandler = {
  postMessage: (message: NativeBridgeMessage) => void;
};

function getNativeBridgeHandler(): NativeBridgeHandler | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    webkit?: {
      messageHandlers?: {
        nativeBridge?: NativeBridgeHandler;
      };
    };
    __NATIVE_BRIDGE__?: boolean;
  };

  if (w.webkit?.messageHandlers?.nativeBridge) {
    return w.webkit.messageHandlers.nativeBridge;
  }

  if (w.__NATIVE_BRIDGE__) {
    console.warn("[openUrl] __NATIVE_BRIDGE__ is true, but nativeBridge handler is missing.");
  }

  return null;
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

export function openUrl(value?: string | null): void {
  if (typeof window === "undefined") return;

  const url = normalizeExternalUrl(value);
  if (!url) {
    console.warn("[openUrl] Invalid URL:", value);
    return;
  }

  const nativeBridge = getNativeBridgeHandler();
  if (nativeBridge) {
    try {
      nativeBridge.postMessage({
        type: "OPEN_URL_EXTERNAL",
        payload: { url },
      });
    } catch (error) {
      console.error("[openUrl] nativeBridge postMessage failed:", error);
    }
    return;
  }

  try {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) {
      opened.opener = null;
      return;
    }
  } catch (error) {
    console.error("[openUrl] window.open failed:", error);
  }

  try {
    window.location.href = url;
  } catch (error) {
    console.error("[openUrl] location.href failed:", error);
  }
}