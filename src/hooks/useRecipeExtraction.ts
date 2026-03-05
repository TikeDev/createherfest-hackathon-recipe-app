import { useState, useCallback } from 'react'
import { runRecipeAgent } from '@/agent/recipeAgent'
import { fetchRecipeFromUrl } from '@/agent/fetcher'
import { saveRecipe } from '@/storage/recipes'
import type { RecipeJSON } from '@/types/recipe'
import type { ExtractionStatus, ExtractionProgress } from '@/types/agent'

interface UseRecipeExtractionReturn {
  status: ExtractionStatus
  progress: ExtractionProgress
  result: RecipeJSON | null
  error: string | null
  run: (input: { type: 'url'; value: string } | { type: 'text'; value: string }) => Promise<void>
  reset: () => void
}

const STEP_LABELS = {
  fetching: 'Scraping recipe...',
  extracting: 'Extracting recipe with AI...',
  saving: 'Saving recipe...',
  done: 'Done!',
}

export function useRecipeExtraction(): UseRecipeExtractionReturn {
  const [status, setStatus] = useState<ExtractionStatus>('idle')
  const [progress, setProgress] = useState<ExtractionProgress>({ step: '', completed: [] })
  const [result, setResult] = useState<RecipeJSON | null>(null)
  const [error, setError] = useState<string | null>(null)

  const advanceStep = useCallback((step: string) => {
    setProgress((prev) => ({
      step,
      completed: prev.step ? [...prev.completed, prev.step] : prev.completed,
    }))
  }, [])

  const run = useCallback(
    async (input: { type: 'url'; value: string } | { type: 'text'; value: string }) => {
      setStatus('idle')
      setProgress({ step: '', completed: [] })
      setResult(null)
      setError(null)

      try {
        let recipeText: string
        let sourceUrl: string | undefined
        let titleHint: string | undefined

        if (input.type === 'url') {
          setStatus('fetching')
          advanceStep(STEP_LABELS.fetching)
          const fetched = await fetchRecipeFromUrl(input.value)
          recipeText = JSON.stringify(fetched.scrapedRecipe, null, 2)
          sourceUrl = input.value
          titleHint = fetched.title
        } else {
          recipeText = input.value
        }

        setStatus('extracting')
        advanceStep(STEP_LABELS.extracting)

        const recipe = await runRecipeAgent({
          recipeText,
          sourceUrl,
          onProgress: (step) => {
            setProgress((prev) => ({ ...prev, step }))
          },
        })

        // If a URL was fetched and the model didn't extract a title, use the page title
        const finalRecipe: RecipeJSON =
          !recipe.title && titleHint
            ? { ...recipe, title: titleHint }
            : recipe

        setStatus('saving')
        advanceStep(STEP_LABELS.saving)
        await saveRecipe(finalRecipe)

        setStatus('done')
        advanceStep(STEP_LABELS.done)
        setResult(finalRecipe)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
        setError(message)
        setStatus('error')
      }
    },
    [advanceStep],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress({ step: '', completed: [] })
    setResult(null)
    setError(null)
  }, [])

  return { status, progress, result, error, run, reset }
}
