import { useViewPreferences } from '@/contexts/ViewPreferencesContext'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Sun, Moon, Monitor } from 'lucide-react'

interface ThemeToggleProps {
  compact?: boolean
}

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
]

const segmentedBtnClass = (selected: boolean) =>
  `flex items-center justify-center flex-1 rounded-lg px-2 py-1.5 text-xs font-medium motion-safe:transition-colors ${
    selected
      ? 'bg-sage text-white'
      : 'bg-surface border border-mist-pale text-forest/70 hover:bg-mist-pale dark:text-cream-text/70 dark:border-forest'
  }`

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { prefs, updatePrefs } = useViewPreferences()

  if (compact) {
    const nextTheme = () => {
      const order = ['light', 'dark', 'system'] as const
      const idx = order.indexOf(prefs.theme)
      updatePrefs({ theme: order[(idx + 1) % 3] })
    }

    const current = THEME_OPTIONS.find((o) => o.value === prefs.theme)!

    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={nextTheme}
        aria-label={`Theme: ${current.label}. Click to change.`}
      >
        <Icon icon={current.icon} decorative size="sm" />
      </Button>
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-forest/80 dark:text-cream-text/80">Theme</legend>
      <div className="flex gap-1" role="radiogroup">
        {THEME_OPTIONS.map((opt) => {
          const selected = prefs.theme === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => updatePrefs({ theme: opt.value })}
              onKeyDown={(e) => {
                const values = THEME_OPTIONS.map(o => o.value)
                const idx = values.indexOf(prefs.theme)
                let next: number | null = null
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % values.length
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + values.length) % values.length
                if (next !== null) {
                  e.preventDefault()
                  updatePrefs({ theme: values[next] })
                  const group = (e.target as HTMLElement).closest('[role="radiogroup"]')
                  group?.querySelectorAll<HTMLElement>('[role="radio"]')?.[next]?.focus()
                }
              }}
              className={segmentedBtnClass(selected)}
            >
              <Icon icon={opt.icon} decorative size="xs" className="mr-1" />
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
