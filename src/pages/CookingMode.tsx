import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipe } from '../storage/recipes'
import type { RecipeJSON } from '../types/recipe'

// Small hook to load a recipe from IndexedDB by id
function useRecipe(id: string) {
    const [recipe, setRecipe] = useState<RecipeJSON | null>(null)

    useEffect(() => {
        if (!id) return
        getRecipe(id).then(r => setRecipe(r ?? null))
    }, [id])

    return recipe
}

interface Props {
    recipe: RecipeJSON
    onComplete: () => void
    onBack: () => void
}

export function CookingMode({ recipe, onComplete, onBack }: Props) {
    const [stage, setStage] = useState<'groceries' | 'preprep' | 'prep' | 'cook' | 'serve'>('groceries')

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <h1>{recipe.title}</h1>
            <p style={{ color: '#7A8C84' }}>Current stage: {stage}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={onBack}>← Back</button>
                <button onClick={onComplete}>Complete ✓</button>
            </div>
        </div>
    )
}

export default function CookingModeWrapper() {
    const { id } = useParams()
    const navigate = useNavigate()
    const recipe = useRecipe(id ?? '')

    if (!recipe) return <div style={{ padding: 40 }}>Loading recipe…</div>

    return (
        <CookingMode
            recipe={recipe}
            onComplete={() => navigate('/')}
            onBack={() => navigate(-1)}
        />
    )
}