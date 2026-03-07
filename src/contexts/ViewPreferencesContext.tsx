import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";

export interface ViewPreferences {
  panelSide: "left" | "right";
  fontSize: number;
  fontFamily: "nunito" | "opendyslexic" | "system";
  theme: "light" | "dark" | "system";
  contrastMode: "default" | "high";
  colorBlindMode: "off" | "red-green" | "blue-yellow";
}

interface ViewPreferencesContextValue {
  prefs: ViewPreferences;
  updatePrefs: (patch: Partial<ViewPreferences>) => void;
  resolvedTheme: "light" | "dark";
}

const DEFAULTS: ViewPreferences = {
  panelSide: "left",
  fontSize: 16,
  fontFamily: "nunito",
  theme: "system",
  contrastMode: "default",
  colorBlindMode: "off",
};

const STORAGE_KEY = "simmer-view-prefs";
const FONT_SIZE_MIN = 14;
const FONT_SIZE_MAX = 24;
const OPENDYSLEXIC_HREF = "https://fonts.cdnfonts.com/css/opendyslexic";

function loadPrefs(): ViewPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ViewPreferences>;
      return { ...DEFAULTS, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS };
}

function savePrefs(prefs: ViewPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function syncToDOM(prefs: ViewPreferences, resolvedTheme: "light" | "dark") {
  const el = document.documentElement;

  // Font size
  const size = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, prefs.fontSize));
  if (size === 16) {
    el.style.removeProperty("font-size");
  } else {
    el.style.fontSize = `${size}px`;
  }

  // Font family
  if (prefs.fontFamily === "nunito") {
    el.removeAttribute("data-font-family");
  } else {
    el.setAttribute("data-font-family", prefs.fontFamily);
  }

  // Theme
  el.setAttribute("data-theme", resolvedTheme);

  // Contrast
  if (prefs.contrastMode === "default") {
    el.removeAttribute("data-contrast");
  } else {
    el.setAttribute("data-contrast", prefs.contrastMode);
  }

  // Color blind mode
  if (prefs.colorBlindMode === "off") {
    el.removeAttribute("data-colorblind");
  } else {
    el.setAttribute("data-colorblind", prefs.colorBlindMode);
  }
}

function manageDyslexicFont(fontFamily: string) {
  const id = "opendyslexic-link";
  const existing = document.getElementById(id);

  if (fontFamily === "opendyslexic" && !existing) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = OPENDYSLEXIC_HREF;
    document.head.appendChild(link);
  } else if (fontFamily !== "opendyslexic" && existing) {
    existing.remove();
  }
}

const ViewPreferencesContext = createContext<ViewPreferencesContextValue | null>(null);

/** Build a human-readable announcement for a preference change */
function describeChange(patch: Partial<ViewPreferences>): string | null {
  const parts: string[] = [];
  if (patch.theme) parts.push(`Theme changed to ${patch.theme}`);
  if (patch.contrastMode)
    parts.push(patch.contrastMode === "high" ? "High contrast enabled" : "High contrast disabled");
  if (patch.fontFamily) parts.push(`Font changed to ${patch.fontFamily}`);
  if (patch.colorBlindMode)
    parts.push(
      patch.colorBlindMode === "off"
        ? "Color blind mode disabled"
        : `Color blind mode: ${patch.colorBlindMode}`
    );
  if (patch.panelSide) parts.push(`Panel moved to ${patch.panelSide}`);
  // fontSize is handled by existing aria-live in SidePanel
  return parts.length > 0 ? parts.join(". ") : null;
}

export function ViewPreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ViewPreferences>(loadPrefs);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);
  const [announcement, setAnnouncement] = useState("");
  const announcementTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resolvedTheme = prefs.theme === "system" ? systemTheme : prefs.theme;

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sync to DOM and localStorage on every change
  useEffect(() => {
    syncToDOM(prefs, resolvedTheme);
    savePrefs(prefs);
    manageDyslexicFont(prefs.fontFamily);
  }, [prefs, resolvedTheme]);

  const updatePrefs = useCallback((patch: Partial<ViewPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      // Clamp font size
      if (patch.fontSize !== undefined) {
        next.fontSize = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, next.fontSize));
      }
      return next;
    });
    // Announce the change for screen readers
    const msg = describeChange(patch);
    if (msg) {
      clearTimeout(announcementTimeout.current);
      setAnnouncement(msg);
      announcementTimeout.current = setTimeout(() => setAnnouncement(""), 3000);
    }
  }, []);

  return (
    <ViewPreferencesContext.Provider value={{ prefs, updatePrefs, resolvedTheme }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      >
        {announcement}
      </div>
    </ViewPreferencesContext.Provider>
  );
}

export function useViewPreferences(): ViewPreferencesContextValue {
  const ctx = useContext(ViewPreferencesContext);
  if (!ctx) throw new Error("useViewPreferences must be used within ViewPreferencesProvider");
  return ctx;
}

export { FONT_SIZE_MIN, FONT_SIZE_MAX };
