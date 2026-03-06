import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PLACEHOLDERS = [
  'tired but craving something warm and spicy...',
  'lots of energy, want to try something new...',
  'brain fog day, something simple from home...',
  'medium energy, feeling like Korean food...',
]

export type EnergyLevel = 'low' | 'medium' | 'high'

const ENERGY_OPTIONS: { value: EnergyLevel; emoji: string; label: string }[] = [
  { value: 'low',    emoji: '🌿', label: 'Low energy' },
  { value: 'medium', emoji: '☀️', label: 'Medium' },
  { value: 'high',   emoji: '⚡', label: 'Feeling good' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [energy, setEnergy] = useState<EnergyLevel | null>(null)
  const [note, setNote] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)

  // Cycle placeholder text with a crossfade
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
        setPlaceholderVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const canSubmit = energy !== null || note.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    navigate('/recipes', { state: { energy, note: note.trim() } })
  }

  function handleEnergyClick(value: EnergyLevel) {
    setEnergy((prev) => (prev === value ? null : value))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-10">

        {/* Brand header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline text-sage">Simmer</h1>
          <p className="text-sm text-forest/60">Cook what your brain and body need today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Energy level chips */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-forest">
              How much energy do you have today?
            </legend>
            <div className="flex gap-3" role="group">
              {ENERGY_OPTIONS.map((opt) => {
                const selected = energy === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleEnergyClick(opt.value)}
                    aria-pressed={selected}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                      selected
                        ? 'border-sage bg-surface text-sage shadow-sm'
                        : 'border-mist-pale bg-white text-forest/60 hover:border-mist hover:text-forest'
                    }`}
                  >
                    <span className="text-xl" aria-hidden="true">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {/* Craving text input */}
          <div className="space-y-3">
            <label htmlFor="craving-input" className="block text-sm font-semibold text-forest">
              What sounds good to eat?
            </label>
            <div className="relative">
              <textarea
                id="craving-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder=""
                className="w-full rounded-xl border-2 border-mist-pale bg-white px-4 py-3 text-sm text-forest focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none transition-colors"
              />
              {/* Animated placeholder overlay — hidden once user starts typing */}
              {!note && (
                <div
                  aria-hidden="true"
                  className={`absolute top-3 left-4 right-4 text-sm text-forest/40 pointer-events-none select-none transition-opacity duration-300 ${
                    placeholderVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {PLACEHOLDERS[placeholderIdx]}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-sage py-4 text-sm font-semibold text-white hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            Find my recipe →
          </button>
        </form>

        {/* Browse without session */}
        <p className="text-center text-xs text-forest/50">
          Already know what you want?{' '}
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="text-sage underline hover:text-sage-dark transition-colors"
          >
            Browse all recipes
          </button>
        </p>

      </div>
    </div>
  )
}
