import { useEffect, useState, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useViewPreferences, FONT_SIZE_MIN, FONT_SIZE_MAX } from '@/contexts/ViewPreferencesContext'
import { getAllRecipes } from '@/storage/recipes'
import ThemeToggle from '@/components/ui/ThemeToggle'

/** Arrow-key handler for roving tabindex radio groups */
function handleRadioKeyDown<T>(e: React.KeyboardEvent, options: T[], current: T, onChange: (val: T) => void) {
  const idx = options.indexOf(current)
  if (idx === -1) return
  let next: number | null = null
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % options.length
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + options.length) % options.length
  if (next !== null) {
    e.preventDefault()
    onChange(options[next])
    // Focus the newly selected radio button
    const group = (e.target as HTMLElement).closest('[role="radiogroup"]')
    const buttons = group?.querySelectorAll<HTMLElement>('[role="radio"]')
    buttons?.[next]?.focus()
  }
}

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}

const FONT_FAMILY_OPTIONS = [
  { value: 'nunito' as const, label: 'Nunito' },
  { value: 'opendyslexic' as const, label: 'OpenDyslexic' },
  { value: 'system' as const, label: 'System' },
]

const COLORBLIND_OPTIONS = [
  { value: 'off' as const, label: 'Off' },
  { value: 'red-green' as const, label: 'Red-Green' },
  { value: 'blue-yellow' as const, label: 'Blue-Yellow' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium motion-safe:transition-colors ${
    isActive
      ? 'bg-sage/10 text-sage dark:text-sage'
      : 'text-forest/70 hover:bg-surface hover:text-forest dark:text-cream/70 dark:hover:bg-forest/50 dark:hover:text-cream'
  }`

export default function SidePanel({ isOpen, onClose, isMobile }: SidePanelProps) {
  const { prefs, updatePrefs } = useViewPreferences()
  const [recipeCount, setRecipeCount] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Load recipe count
  useEffect(() => {
    getAllRecipes().then((all) => setRecipeCount(all.length))
  }, [isOpen])

  // Focus trap for mobile overlay
  useEffect(() => {
    if (!isMobile || !isOpen) return

    // Focus close button on open
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, isOpen, onClose])

  const panelContent = (
    <div
      ref={panelRef}
      id="side-panel"
      role={isMobile ? 'dialog' : 'region'}
      aria-modal={isMobile ? true : undefined}
      aria-labelledby={isMobile ? 'side-panel-title' : undefined}
      aria-label={isMobile ? undefined : 'Settings sidebar'}
      className={`flex h-full w-72 flex-col bg-cream border-mist-pale overflow-y-auto dark:border-forest ${
        prefs.panelSide === 'left' ? 'border-r' : 'border-l'
      }`}
    >
      {/* Header — extra left padding when panel is left to clear the fixed hamburger button */}
      <div className={`flex items-center justify-between pt-5 pb-4 ${prefs.panelSide === 'left' ? 'pl-[4.5rem] pr-4' : 'px-4'}`}>
        <span id="side-panel-title" className="text-xl font-headline text-sage">Simmer</span>
        {isMobile && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-forest/50 hover:bg-surface hover:text-forest focus:outline-none focus:ring-2 focus:ring-sage dark:text-cream/50 dark:hover:bg-forest/50 dark:hover:text-cream"
          >
            <span aria-hidden="true" className="text-lg">&times;</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="px-3 space-y-1">
        <NavLink to="/recipes" className={navLinkClass} onClick={isMobile ? onClose : undefined}>
          <span aria-hidden="true">&#x1F3E0;</span>
          Home
        </NavLink>
        <NavLink to="/extract" className={navLinkClass} onClick={isMobile ? onClose : undefined}>
          <span aria-hidden="true">&#x2795;</span>
          Add Recipe
        </NavLink>
        <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-forest/70 dark:text-cream/70">
          <span className="flex items-center gap-3">
            <span aria-hidden="true">&#x1F4D6;</span>
            Saved Recipes
          </span>
          <span className="rounded-full bg-sage/10 px-2 py-0.5 text-xs font-semibold text-sage" aria-label={`${recipeCount} recipes saved`}>
            {recipeCount}
          </span>
        </div>
        <NavLink to="/profile" className={navLinkClass} onClick={isMobile ? onClose : undefined}>
          <span aria-hidden="true">&#x1F464;</span>
          My Profile
        </NavLink>
      </nav>

      {/* Divider */}
      <hr className="mx-4 my-4 border-mist-pale dark:border-forest" />

      {/* Display Settings */}
      <div className="px-4 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-cream/80">
          Display Settings
        </h3>

        {/* Font Size Stepper */}
        <div className="space-y-2" role="group" aria-labelledby="font-size-label">
          <span id="font-size-label" className="text-xs font-semibold text-forest/80 dark:text-cream/80">Font Size</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updatePrefs({ fontSize: prefs.fontSize - 1 })}
              disabled={prefs.fontSize <= FONT_SIZE_MIN}
              aria-label="Decrease font size"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-mist-pale text-sm font-bold text-forest hover:bg-surface focus:outline-none focus:ring-2 focus:ring-sage disabled:opacity-30 disabled:cursor-not-allowed dark:border-forest dark:hover:bg-forest/50"
            >
              &minus;
            </button>
            <span className="min-w-[3rem] text-center text-sm font-medium text-forest" aria-live="polite">
              {prefs.fontSize}px
            </span>
            <button
              type="button"
              onClick={() => updatePrefs({ fontSize: prefs.fontSize + 1 })}
              disabled={prefs.fontSize >= FONT_SIZE_MAX}
              aria-label="Increase font size"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-mist-pale text-sm font-bold text-forest hover:bg-surface focus:outline-none focus:ring-2 focus:ring-sage disabled:opacity-30 disabled:cursor-not-allowed dark:border-forest dark:hover:bg-forest/50"
            >
              +
            </button>
          </div>
          {prefs.fontSize !== 16 && (
            <button
              type="button"
              onClick={() => updatePrefs({ fontSize: 16 })}
              className="text-xs text-sage hover:text-sage-dark focus:outline-none focus:underline"
            >
              Reset to default
            </button>
          )}
        </div>

        {/* Font Family */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold text-forest/80 dark:text-cream/80">Font Family</legend>
          <div className="flex gap-1" role="radiogroup">
            {FONT_FAMILY_OPTIONS.map((opt) => {
              const selected = prefs.fontFamily === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => updatePrefs({ fontFamily: opt.value })}
                  onKeyDown={(e) => handleRadioKeyDown(e, FONT_FAMILY_OPTIONS.map(o => o.value), prefs.fontFamily, (v) => updatePrefs({ fontFamily: v }))}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium motion-safe:transition-colors ${
                    selected
                      ? 'bg-sage text-white'
                      : 'bg-surface border border-mist-pale text-forest/70 hover:bg-mist-pale dark:text-cream/70 dark:border-forest'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Theme */}
        <ThemeToggle />

        {/* Contrast */}
        <div className="flex items-center justify-between">
          <span id="high-contrast-label" className="text-xs font-semibold text-forest/80 dark:text-cream/80">High Contrast</span>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.contrastMode === 'high'}
            aria-labelledby="high-contrast-label"
            onClick={() => updatePrefs({ contrastMode: prefs.contrastMode === 'high' ? 'default' : 'high' })}
            className={`relative h-6 w-11 rounded-full motion-safe:transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 ${
              prefs.contrastMode === 'high' ? 'bg-sage' : 'bg-mist-pale dark:bg-forest'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm motion-safe:transition-transform ${
                prefs.contrastMode === 'high' ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        {/* Color Blind Mode */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold text-forest/80 dark:text-cream/80">Color Blind Mode</legend>
          <div className="flex gap-1" role="radiogroup">
            {COLORBLIND_OPTIONS.map((opt) => {
              const selected = prefs.colorBlindMode === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => updatePrefs({ colorBlindMode: opt.value })}
                  onKeyDown={(e) => handleRadioKeyDown(e, COLORBLIND_OPTIONS.map(o => o.value), prefs.colorBlindMode, (v) => updatePrefs({ colorBlindMode: v }))}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium motion-safe:transition-colors ${
                    selected
                      ? 'bg-sage text-white'
                      : 'bg-surface border border-mist-pale text-forest/70 hover:bg-mist-pale dark:text-cream/70 dark:border-forest'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      {/* Divider */}
      <hr className="mx-4 my-4 border-mist-pale dark:border-forest" />

      {/* Panel Position */}
      <fieldset className="px-4 space-y-2">
        <legend className="text-xs font-semibold text-forest/80 dark:text-cream/80">Panel Position</legend>
        <div className="flex gap-1" role="radiogroup">
          {(['left', 'right'] as const).map((side) => {
            const selected = prefs.panelSide === side
            return (
              <button
                key={side}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => updatePrefs({ panelSide: side })}
                onKeyDown={(e) => handleRadioKeyDown(e, ['left', 'right'] as const, prefs.panelSide, (v) => updatePrefs({ panelSide: v }))}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium capitalize motion-safe:transition-colors ${
                  selected
                    ? 'bg-sage text-white'
                    : 'bg-surface border border-mist-pale text-forest/70 hover:bg-mist-pale dark:text-cream/70 dark:border-forest'
                }`}
              >
                {side}
              </button>
            )
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
          className="text-xs text-forest/80 hover:text-sage motion-safe:transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-cream/80 dark:hover:text-sage"
        >
          About Simmer
        </button>
      </div>
    </div>
  )

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
            prefs.panelSide === 'left' ? 'left-0' : 'right-0'
          } ${
            isOpen
              ? 'translate-x-0'
              : prefs.panelSide === 'left'
                ? '-translate-x-full'
                : 'translate-x-full'
          }`}
        >
          {panelContent}
        </div>
      </>
    )
  }

  // Desktop: inline panel
  return (
    <div
      className={`hidden md:block motion-safe:transition-[width,margin] motion-safe:duration-300 ${
        isOpen ? 'w-72' : 'w-0'
      } overflow-hidden flex-shrink-0`}
    >
      {panelContent}
    </div>
  )
}
