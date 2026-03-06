import { useState } from 'react'
import type { ExtractionStatus } from '@/types/agent'

type InputTab = 'url' | 'text'

interface RecipeInputProps {
  status: ExtractionStatus
  onSubmit: (input: { type: 'url'; value: string } | { type: 'text'; value: string }) => void
}

export function RecipeInput({ status, onSubmit }: RecipeInputProps) {
  const [tab, setTab] = useState<InputTab>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const isLoading = status === 'fetching' || status === 'extracting' || status === 'saving'

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    if (tab === 'url') {
      const trimmed = url.trim()
      if (!trimmed) return
      onSubmit({ type: 'url', value: trimmed })
    } else {
      const trimmed = text.trim()
      if (!trimmed) return
      onSubmit({ type: 'text', value: trimmed })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tab toggle */}
      <div role="tablist" className="flex rounded-lg border border-mist-pale p-1 gap-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'url'}
          onClick={() => setTab('url')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === 'url'
              ? 'bg-sage text-white'
              : 'text-forest/70 hover:text-forest'
          }`}
        >
          From URL
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'text'}
          onClick={() => setTab('text')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === 'text'
              ? 'bg-sage text-white'
              : 'text-forest/70 hover:text-forest'
          }`}
        >
          Paste Text
        </button>
      </div>

      {tab === 'url' ? (
        <div>
          <label htmlFor="recipe-url" className="block text-sm font-medium text-forest mb-1">
            Recipe URL
          </label>
          <input
            id="recipe-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.example.com/recipes/chocolate-cake"
            disabled={isLoading}
            className="w-full rounded-lg border border-mist-pale px-4 py-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-50"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="recipe-text" className="block text-sm font-medium text-forest mb-1">
            Recipe Text
          </label>
          <textarea
            id="recipe-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full recipe here — ingredients, steps, and any intro notes."
            rows={10}
            disabled={isLoading}
            className="w-full rounded-lg border border-mist-pale px-4 py-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-50 resize-y"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || (tab === 'url' ? !url.trim() : !text.trim())}
        className="w-full rounded-lg bg-sage px-6 py-3 text-sm font-semibold text-white hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Simmer is thinking...' : 'Extract Recipe'}
      </button>
    </form>
  )
}
