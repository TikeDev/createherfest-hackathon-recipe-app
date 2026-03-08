import { useEffect, useState, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  useViewPreferences,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
} from "@/contexts/ViewPreferencesContext";
import { getAllRecipes } from "@/storage/recipes";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { handleRadioKeyDown } from "@/utils/a11y";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Home, Plus, BookOpen, User, PanelLeft, PanelRight } from "lucide-react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const FONT_FAMILY_OPTIONS = [
  { value: "nunito" as const, label: "Nunito" },
  { value: "opendyslexic" as const, label: "OpenDyslexic" },
  { value: "system" as const, label: "System" },
];

const COLORBLIND_OPTIONS = [
  { value: "off" as const, label: "Off" },
  { value: "red-green" as const, label: "Red-Green" },
  { value: "blue-yellow" as const, label: "Blue-Yellow" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium motion-safe:transition-colors ${
    isActive
      ? "bg-[color:color-mix(in_srgb,var(--color-sage)_15%,transparent)] text-forest dark:text-cream-text"
      : "text-forest/75 hover:bg-surface hover:text-forest dark:text-cream-text/70 dark:hover:bg-forest/60 dark:hover:text-cream"
  }`;

const segmentedBtnClass = (selected: boolean) =>
  `flex-1 rounded-lg px-2 py-1.5 text-xs font-medium motion-safe:transition-colors ${
    selected
      ? "bg-sage-dark text-white"
      : "bg-surface border border-mist-pale text-forest/80 hover:bg-mist-pale dark:text-cream-text/70 dark:border-forest"
  }`;

export default function SidePanel({ isOpen, onClose, isMobile }: SidePanelProps) {
  const { prefs, updatePrefs } = useViewPreferences();
  const [recipeCount, setRecipeCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Load recipe count
  useEffect(() => {
    void getAllRecipes().then((all) => setRecipeCount(all.length));
  }, [isOpen]);

  // Focus trap for mobile overlay
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    // Focus close button on open
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, isOpen, onClose]);

  const panelContent = (
    <div
      ref={panelRef}
      id="side-panel"
      role={isMobile ? "dialog" : "region"}
      aria-modal={isMobile ? true : undefined}
      aria-labelledby={isMobile ? "side-panel-title" : undefined}
      aria-label={isMobile ? undefined : "Settings sidebar"}
      className={`flex h-full w-72 flex-col bg-cream border-mist-pale overflow-y-auto dark:border-forest ${
        prefs.panelSide === "left" ? "border-r" : "border-l"
      }`}
    >
      {/* Header — extra left padding when panel is left to clear the fixed hamburger button */}
      <div
        className={`flex items-center justify-between pt-5 pb-4 ${prefs.panelSide === "left" ? "pl-[4.5rem] pr-4" : "px-4"}`}
      >
        <Link
          to="/"
          id="side-panel-title"
          className="flex items-center gap-2 mx-auto text-2xl font-headline text-sage-dark dark:text-mist no-underline"
          onClick={isMobile ? onClose : undefined}
        >
          <img src="/simmer-logo-192.png" alt="Simmer logo" className="h-10 w-10" />
          Simmer
        </Link>
        {isMobile && (
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
          >
            <span aria-hidden="true" className="text-lg">
              &times;
            </span>
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="px-3 space-y-1">
        <NavLink to="/" className={navLinkClass} end onClick={isMobile ? onClose : undefined}>
          <Home className="w-5 h-5" aria-hidden="true" />
          Home
        </NavLink>
        <NavLink to="/extract" className={navLinkClass} onClick={isMobile ? onClose : undefined}>
          <Plus className="w-5 h-5" aria-hidden="true" />
          Add Recipe
        </NavLink>
        <NavLink to="/recipes" className={navLinkClass} onClick={isMobile ? onClose : undefined}>
          <BookOpen className="w-5 h-5" aria-hidden="true" />
          <span className="flex-1">Saved Recipes</span>
          <span
            className="rounded-full bg-[color:color-mix(in_srgb,var(--color-sage)_20%,transparent)] px-2 py-0.5 text-xs font-semibold text-forest dark:text-cream-text"
            aria-label={`${recipeCount} recipes saved`}
          >
            {recipeCount}
          </span>
        </NavLink>
        <NavLink to="/profile" className={navLinkClass} onClick={isMobile ? onClose : undefined}>
          <User className="w-5 h-5" aria-hidden="true" />
          My Profile
        </NavLink>
      </nav>

      <Separator className="mx-4 my-4" />

      {/* Display Settings */}
      <div className="px-4 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-cream-text/80">
          Display Settings
        </h3>

        {/* Font Size Stepper */}
        <div className="space-y-2" role="group" aria-labelledby="font-size-label">
          <span
            id="font-size-label"
            className="text-xs font-semibold text-forest/80 dark:text-cream-text/80"
          >
            Font Size
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => updatePrefs({ fontSize: prefs.fontSize - 1 })}
              disabled={prefs.fontSize <= FONT_SIZE_MIN}
              aria-label="Decrease font size"
            >
              &minus;
            </Button>
            <span
              className="min-w-[3rem] text-center text-sm font-medium text-forest"
              aria-live="polite"
            >
              {prefs.fontSize}px
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => updatePrefs({ fontSize: prefs.fontSize + 1 })}
              disabled={prefs.fontSize >= FONT_SIZE_MAX}
              aria-label="Increase font size"
            >
              +
            </Button>
          </div>
          {prefs.fontSize !== 16 && (
            <button
              type="button"
              onClick={() => updatePrefs({ fontSize: 16 })}
              className="text-xs text-sage-dark hover:text-forest focus:outline-none focus:underline dark:text-mist dark:hover:text-cream-text"
            >
              Reset to default
            </button>
          )}
        </div>

        {/* Font Family */}
        <fieldset className="space-y-2" role="radiogroup">
          <legend className="text-xs font-semibold text-forest/80 dark:text-cream-text/80">
            Font Family
          </legend>
          <div className="flex gap-1">
            {FONT_FAMILY_OPTIONS.map((opt) => {
              const selected = prefs.fontFamily === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => updatePrefs({ fontFamily: opt.value })}
                  onKeyDown={(e) =>
                    handleRadioKeyDown(
                      e,
                      FONT_FAMILY_OPTIONS.map((o) => o.value),
                      prefs.fontFamily,
                      (v) => updatePrefs({ fontFamily: v })
                    )
                  }
                  className={segmentedBtnClass(selected)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Theme */}
        <ThemeToggle />

        {/* Contrast */}
        <div className="flex items-center justify-between">
          <span
            id="high-contrast-label"
            className="text-xs font-semibold text-forest/80 dark:text-cream-text/80"
          >
            High Contrast
          </span>
          <Switch
            checked={prefs.contrastMode === "high"}
            onCheckedChange={(checked) =>
              updatePrefs({ contrastMode: checked ? "high" : "default" })
            }
            aria-labelledby="high-contrast-label"
          />
        </div>

        {/* Color Blind Mode */}
        <fieldset className="space-y-2" role="radiogroup">
          <legend className="text-xs font-semibold text-forest/80 dark:text-cream-text/80">
            Color Blind Mode
          </legend>
          <div className="flex gap-1">
            {COLORBLIND_OPTIONS.map((opt) => {
              const selected = prefs.colorBlindMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => updatePrefs({ colorBlindMode: opt.value })}
                  onKeyDown={(e) =>
                    handleRadioKeyDown(
                      e,
                      COLORBLIND_OPTIONS.map((o) => o.value),
                      prefs.colorBlindMode,
                      (v) => updatePrefs({ colorBlindMode: v })
                    )
                  }
                  className={segmentedBtnClass(selected)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <Separator className="mx-4 my-4" />

      {/* Panel Position */}
      <fieldset className="px-4 space-y-2" role="radiogroup">
        <legend className="text-xs font-semibold text-forest/80 dark:text-cream-text/80">
          Panel Position
        </legend>
        <div className="flex gap-1">
          {(["left", "right"] as const).map((side) => {
            const selected = prefs.panelSide === side;
            const Icon = side === "left" ? PanelLeft : PanelRight;
            return (
              <button
                key={side}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => updatePrefs({ panelSide: side })}
                onKeyDown={(e) =>
                  handleRadioKeyDown(e, ["left", "right"] as const, prefs.panelSide, (v) =>
                    updatePrefs({ panelSide: v })
                  )
                }
                className={`${segmentedBtnClass(selected)} capitalize flex items-center gap-1.5 justify-center`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {side}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Spacer */}
      <div className="flex-1" />

      {/* About / Help */}
      <div className="px-4 py-4 border-t border-mist-pale dark:border-forest">
        <button
          type="button"
          disabled
          aria-label="About Simmer (coming soon)"
          className="text-xs text-forest/80 hover:text-sage motion-safe:transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-cream-text/80 dark:hover:text-sage"
        >
          About Simmer
        </button>
      </div>
    </div>
  );

  // Mobile: overlay with backdrop
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 motion-safe:transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        {/* Panel */}
        <div
          className={`fixed inset-y-0 z-40 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-in-out ${
            prefs.panelSide === "left" ? "left-0" : "right-0"
          } ${
            isOpen
              ? "translate-x-0"
              : prefs.panelSide === "left"
                ? "-translate-x-full"
                : "translate-x-full"
          }`}
        >
          {panelContent}
        </div>
      </>
    );
  }

  // Desktop: inline panel
  return (
    <div
      className={`hidden md:block motion-safe:transition-[width,margin] motion-safe:duration-300 ${
        isOpen ? "w-72" : "w-0"
      } overflow-hidden flex-shrink-0`}
    >
      {panelContent}
    </div>
  );
}
