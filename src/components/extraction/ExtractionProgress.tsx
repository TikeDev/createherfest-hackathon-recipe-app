import type { ExtractionStatus, ExtractionProgress } from '@/types/agent'

interface ExtractionProgressProps {
  status: ExtractionStatus
  progress: ExtractionProgress
  error: string | null
}

export function ExtractionProgressDisplay({ status, progress, error }: ExtractionProgressProps) {
  if (status === 'idle') return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Extraction progress"
      className="rounded-lg border border-mist-pale bg-surface p-4 space-y-3"
    >
      <h2 className="text-sm font-semibold text-forest">
        {status === 'error' ? 'No worries — let\'s try that again.' : 'Simmer is thinking...'}
      </h2>

      <ul className="space-y-2">
        {progress.completed.map((step) => (
          <li key={step} className="flex items-center gap-2 text-sm text-forest/60">
            <span aria-hidden="true" className="text-sage">✓</span>
            {step}
          </li>
        ))}

        {status !== 'done' && status !== 'error' && progress.step && (
          <li className="flex items-center gap-2 text-sm text-forest font-medium">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-full border-2 border-sage border-t-transparent animate-spin"
            />
            {progress.step}
          </li>
        )}
      </ul>

      {status === 'error' && error && (
        <p role="alert" className="text-sm text-[#B85C00] mt-2">
          {error}
        </p>
      )}

      {status === 'done' && (
        <p className="text-sm text-sage font-medium">Nice work. That recipe is saved.</p>
      )}
    </div>
  )
}
