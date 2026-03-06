import { useState } from 'react'
import type { Step } from '@/types/recipe'

interface StepListProps {
  steps: Step[]
}

export function StepList({ steps }: StepListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [expandedAnnotations, setExpandedAnnotations] = useState<Set<string>>(new Set())

  function toggleChecked(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAnnotations(id: string) {
    setExpandedAnnotations((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section aria-labelledby="steps-heading">
      <h2 id="steps-heading" className="text-lg font-headline text-forest mb-3">
        Instructions
      </h2>

      <ol className="space-y-4">
        {steps.map((step) => {
          const isDone = checked.has(step.id)
          const hasAnnotations = step.annotations.length > 0
          const showAnnotations = expandedAnnotations.has(step.id)

          return (
            <li
              key={step.id}
              className={`flex gap-3 rounded-lg border p-4 transition-colors ${
                isDone ? 'border-mist-pale bg-surface opacity-60' : 'border-mist-pale bg-surface'
              } ${step.isCritical ? 'border-l-4 border-l-amber-400' : ''}`}
            >
              {/* Checkbox */}
              <div className="flex-shrink-0 pt-0.5">
                <input
                  type="checkbox"
                  id={`step-${step.id}`}
                  checked={isDone}
                  onChange={() => toggleChecked(step.id)}
                  aria-label={`Mark step ${step.index} as done`}
                  className="h-5 w-5 rounded border-mist-pale text-sage focus:ring-sage cursor-pointer"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <label
                    htmlFor={`step-${step.id}`}
                    className={`text-sm leading-relaxed cursor-pointer ${isDone ? 'line-through text-forest/40' : 'text-forest'}`}
                  >
                    <span className="font-semibold text-sage mr-1">
                      {step.index}.
                    </span>
                    {step.text}
                  </label>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    {step.timingMinutes != null && (
                      <span className="rounded bg-surface px-2 py-0.5 text-xs text-forest/60">
                        {step.timingMinutes} min
                      </span>
                    )}
                    {hasAnnotations && (
                      <button
                        onClick={() => toggleAnnotations(step.id)}
                        aria-expanded={showAnnotations}
                        className="rounded bg-surface px-2 py-0.5 text-xs text-sage hover:bg-mist-pale transition-colors"
                      >
                        Tips
                      </button>
                    )}
                  </div>
                </div>

                {step.isCritical && step.criticalNote && (
                  <p role="alert" className="text-xs text-amber-700 font-medium flex items-center gap-1">
                    <span aria-hidden="true">⚠</span>
                    {step.criticalNote}
                  </p>
                )}

                {showAnnotations && step.annotations.map((ann, i) => (
                  <div
                    key={i}
                    className="rounded bg-surface border border-mist px-3 py-2 text-xs text-forest"
                  >
                    <span className="font-semibold capitalize text-sage">{ann.type}: </span>
                    {ann.text}
                  </div>
                ))}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
