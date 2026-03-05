import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipe } from '../storage/recipes'
import type { RecipeJSON, Step, Ingredient, GroceryCategory } from '../types/recipe'
import { classifyGroceries } from '../agent/classifyGroceries'


// ─── Brand tokens ────────────────────────────────────────────────
const C = {
    sage: '#6B9E78',
    sageDark: '#4e7a5a',
    sageLight: '#A8C5B0',
    sagePale: '#EEF5F0',
    cream: '#FAF4EF',
    forest: '#2D3B35',
    mist: '#D4E6DA',
    text: '#2D3B35',
    textMuted: '#7A8C84',
    textLight: '#AAB8B2',
    white: '#FFFFFF',
}

// ─── Hook ────────────────────────────────────────────────────────
function useRecipe(id: string) {
    const [recipe, setRecipe] = useState<RecipeJSON | null>(null)
    useEffect(() => {
        if (!id) return
        getRecipe(id).then(r => setRecipe(r ?? null))
    }, [id])
    return recipe
}

// ─── Shared UI ───────────────────────────────────────────────────
const Btn = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
}: {
    children: React.ReactNode
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
    disabled?: boolean
}) => {
    const styles = {
        primary: { backgroundColor: disabled ? C.sageLight : C.sage, color: C.white, border: 'none' },
        secondary: { backgroundColor: 'transparent', color: C.sage, border: `1.5px solid ${C.sage}` },
        ghost: { backgroundColor: 'transparent', color: C.textMuted, border: 'none' },
    }
    return (
        <button
            onClick={disabled ? undefined : onClick}
            style={{
                ...styles[variant],
                borderRadius: 10,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 700,
                cursor: disabled ? 'default' : 'pointer',
                fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.18s',
                width: '100%',
            }}
        >
            {children}
        </button>
    )
}

const Card = ({ children, style: s = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ backgroundColor: C.white, borderRadius: 16, padding: 24, boxShadow: '0 1px 12px rgba(45,59,53,0.07)', ...s }}>
        {children}
    </div>
)

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
        {children}
    </div>
)

// ─── Stage bar ───────────────────────────────────────────────────
type Stage = 'groceries' | 'preprep' | 'prep' | 'cook' | 'serve'
const STAGES: { key: Stage; icon: string; label: string }[] = [
    { key: 'groceries', icon: '🛒', label: 'Groceries' },
    { key: 'preprep', icon: '🌙', label: 'Pre-Prep' },
    { key: 'prep', icon: '🔪', label: 'Prep' },
    { key: 'cook', icon: '🔥', label: 'Cook' },
    { key: 'serve', icon: '🍽️', label: 'Serve' },
]

const StageBar = ({ current }: { current: Stage }) => {
    const currentIdx = STAGES.findIndex(s => s.key === current)
    return (
        <div style={{ padding: '14px 48px', backgroundColor: C.white, borderBottom: `1px solid ${C.mist}`, display: 'flex', alignItems: 'center' }}>
            {STAGES.map((s, i) => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < 4 ? 1 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: 15,
                            backgroundColor: i === currentIdx ? C.sage : i < currentIdx ? C.sageLight : C.mist,
                            border: i === currentIdx ? `2px solid ${C.sageDark}` : '2px solid transparent',
                            transition: 'all 0.25s',
                        }}>{s.icon}</div>
                        <span style={{
                            fontSize: 13, fontWeight: i === currentIdx ? 800 : 500, whiteSpace: 'nowrap',
                            color: i === currentIdx ? C.sage : i < currentIdx ? C.sageLight : C.textLight
                        }}>
                            {s.label}
                        </span>
                    </div>
                    {i < 4 && <div style={{ flex: 1, height: 2, margin: '0 10px', backgroundColor: i < currentIdx ? C.sageLight : C.mist }} />}
                </div>
            ))}
        </div>
    )
}

// ─── Step layout (shared for preprep/prep/cook) ──────────────────
const StepLayout = ({
    icon, title, stepLabel, stepContent, progressBar, sidebar,
}: {
    icon: string; title: string; stepLabel: string
    stepContent: React.ReactNode; progressBar?: React.ReactNode; sidebar: React.ReactNode
}) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}>
        <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>
                {stepLabel}
            </div>
            {stepContent}
            {progressBar}
        </div>
        <div style={{ position: 'sticky', top: 130, alignSelf: 'start' }}>
            <Card style={{ textAlign: 'center', marginBottom: 16, padding: 36 }}>
                <div style={{ fontSize: 60, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Lora', serif", color: C.forest }}>{title}</div>
            </Card>
            {sidebar}
        </div>
    </div>
)

// ─── Groceries ───────────────────────────────────────────────────
const CATEGORY_ICONS: Record<GroceryCategory, string> = {
    'Produce': '🥦',
    'Protein': '🥩',
    'Dairy': '🧀',
    'Pantry': '🫙',
    'Spices & Seasonings': '🌿',
    'Oils & Vinegars': '🫒',
    'Canned & Jarred': '🥫',
    'Frozen': '❄️',
    'Bakery': '🍞',
    'Beverages': '🥤',
    'Other': '📦',
}

function GroceriesStage({ recipe, onNext, onBack }: { recipe: RecipeJSON; onNext: () => void; onBack: () => void }) {
    const [checked, setChecked] = useState<Record<string, boolean>>({})
    const [categories, setCategories] = useState<Record<string, GroceryCategory> | null>(null)
    const [classifying, setClassifying] = useState(true)

    useEffect(() => {
        classifyGroceries(recipe.ingredients)
            .then(setCategories)
            .catch(() => setCategories({}))
            .finally(() => setClassifying(false))
    }, [recipe.ingredients])

    const toggle = (id: string) => setChecked(c => ({ ...c, [id]: !c[id] }))
    const total = recipe.ingredients.length
    const checkedCount = Object.values(checked).filter(Boolean).length

    // Group ingredients by category once classification is ready
    const grouped = new Map<GroceryCategory, Ingredient[]>()
    if (categories) {
        for (const ing of recipe.ingredients) {
            const cat = categories[ing.id] ?? 'Other'
            if (!grouped.has(cat)) grouped.set(cat, [])
            grouped.get(cat)!.push(ing)
        }
    }

    const renderIngredient = (ing: Ingredient, isLast: boolean) => (
        <div
            key={ing.id}
            onClick={() => toggle(ing.id)}
            style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '15px 22px',
                cursor: 'pointer', opacity: checked[ing.id] ? 0.4 : 1, transition: 'all 0.2s',
                borderBottom: isLast ? 'none' : `1px solid ${C.sagePale}`,
                backgroundColor: checked[ing.id] ? C.sagePale : 'transparent',
            }}
        >
            <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                backgroundColor: checked[ing.id] ? C.sage : 'transparent',
                border: `2px solid ${checked[ing.id] ? C.sage : C.mist}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}>
                {checked[ing.id] && <span style={{ color: C.white, fontSize: 13 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: C.text, textDecoration: checked[ing.id] ? 'line-through' : 'none' }}>
                    {ing.name}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{ing.raw}</div>
            </div>
        </div>
    )

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 36 }}>
            <div>
                <div style={{ marginBottom: 28 }}>
                    <h2 style={{ fontSize: 28, fontFamily: "'Lora', serif", fontWeight: 700, color: C.forest, margin: '0 0 6px' }}>
                        Groceries
                    </h2>
                    <p style={{ color: C.textMuted, margin: 0, fontSize: 14 }}>
                        {classifying ? 'Sorting by aisle…' : 'Check off everything you need before you start.'}
                    </p>
                </div>

                {/* Flat list while AI classifies — no spinner, no blocked UI */}
                {classifying ? (
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        {recipe.ingredients.map((ing, i) =>
                            renderIngredient(ing, i === recipe.ingredients.length - 1)
                        )}
                    </Card>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {Array.from(grouped.entries()).map(([cat, ings]) => (
                            <div key={cat}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[cat]}</span>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                        {cat}
                                    </span>
                                </div>
                                <Card style={{ padding: 0, overflow: 'hidden' }}>
                                    {ings.map((ing, i) => renderIngredient(ing, i === ings.length - 1))}
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ position: 'sticky', top: 130, alignSelf: 'start' }}>
                <Card style={{ marginBottom: 16 }}>
                    <SectionLabel>Progress</SectionLabel>
                    <div style={{ fontSize: 32, fontWeight: 900, color: C.sage, marginBottom: 4 }}>{checkedCount} / {total}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>items checked</div>
                    <div style={{ height: 8, backgroundColor: C.mist, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, backgroundColor: C.sage, width: `${total ? (checkedCount / total) * 100 : 0}%`, transition: 'width 0.3s' }} />
                    </div>
                </Card>
                {recipe.metadata.totalTimeMinutes && (
                    <Card style={{ marginBottom: 20 }}>
                        <SectionLabel>Total time</SectionLabel>
                        <div style={{ fontSize: 28, fontWeight: 900, color: C.forest }}>{recipe.metadata.totalTimeMinutes} min</div>
                    </Card>
                )}
                <Btn onClick={onNext}>I have everything · Next →</Btn>
                <div style={{ marginTop: 10 }}><Btn variant="ghost" onClick={onBack}>← Back</Btn></div>
            </div>
        </div>
    )
}

// ─── Generic step stage (PrePrep / Prep) ─────────────────────────
function StepStage({
    icon, title, steps, onNext, onBack,
}: {
    icon: string; title: string; steps: Step[]; onNext: () => void; onBack: () => void
}) {
    const [idx, setIdx] = useState(0)
    const [tipOpen, setTipOpen] = useState(false)
    const step = steps[idx]
    const isLast = idx === steps.length - 1

    const handleNext = () => { setTipOpen(false); isLast ? onNext() : setIdx(i => i + 1) }
    const handleBack = () => { setTipOpen(false); idx > 0 ? setIdx(i => i - 1) : onBack() }

    if (!step) return null

    const techniqueNote = step.annotations.find(a => a.type === 'technique')

    return (
        <StepLayout
            icon={icon} title={title}
            stepLabel={`Step ${idx + 1} of ${steps.length}`}
            stepContent={
                <div>
                    <Card style={{ padding: 44, marginBottom: 14 }}>
                        <p style={{ fontSize: 22, lineHeight: 1.9, color: C.forest, fontFamily: "'Lora', serif", margin: 0 }}>
                            {step.text}
                        </p>
                        {step.isCritical && step.criticalNote && (
                            <div style={{ marginTop: 16, backgroundColor: '#FEF6E7', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92600A' }}>
                                ⚠️ {step.criticalNote}
                            </div>
                        )}
                    </Card>
                    {techniqueNote && (
                        <div>
                            <button onClick={() => setTipOpen(!tipOpen)} style={{
                                backgroundColor: 'transparent', border: `1.5px solid ${C.sageLight}`,
                                borderRadius: 10, padding: '11px 18px', fontSize: 13, color: C.sage,
                                fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <span>💡 What does this mean?</span>
                                <span>{tipOpen ? '▲' : '▼'}</span>
                            </button>
                            {tipOpen && (
                                <div style={{ backgroundColor: C.sagePale, borderRadius: '0 0 10px 10px', padding: '14px 18px', fontSize: 14, color: C.forest, lineHeight: 1.8, border: `1px solid ${C.mist}`, borderTop: 'none' }}>
                                    {techniqueNote.text}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            }
            progressBar={
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    {steps.map((_, i) => (
                        <div key={i} onClick={() => { setTipOpen(false); setIdx(i) }}
                            style={{ height: 4, flex: 1, borderRadius: 2, cursor: 'pointer', transition: 'background 0.2s', backgroundColor: i <= idx ? C.sage : C.mist }} />
                    ))}
                </div>
            }
            sidebar={
                <>
                    <Btn onClick={handleNext}>{isLast ? 'Done · Next stage →' : 'Done · Next step →'}</Btn>
                    <div style={{ marginTop: 10 }}><Btn variant="secondary" onClick={handleBack}>← Back</Btn></div>
                </>
            }
        />
    )
}

// ─── Circular Timer ──────────────────────────────────────────────
const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CircularTimer({ timeLeft, totalSeconds, paused, done, onPause, onUnpause, onRestart }: {
    timeLeft: number
    totalSeconds: number
    paused: boolean
    done: boolean
    onPause: () => void
    onUnpause: () => void
    onRestart: () => void
}) {
    const pct = totalSeconds > 0 ? timeLeft / totalSeconds : 0
    const offset = CIRCUMFERENCE * (1 - pct)
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    return (
        <Card style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* Circle */}
            <div style={{ position: 'relative', width: 200, height: 200 }}>
                <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Track */}
                    <circle cx="100" cy="100" r={RADIUS} fill="none" stroke={C.mist} strokeWidth="10" />
                    {/* Progress */}
                    <circle
                        cx="100" cy="100" r={RADIUS} fill="none"
                        stroke={done ? C.sageLight : paused ? C.textLight : C.sage}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                    />
                </svg>
                {/* Time label centered over the SVG */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: done ? C.sageLight : C.forest, fontFamily: "'Lora', serif", lineHeight: 1 }}>
                        {fmt(timeLeft)}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {done ? 'done' : paused ? 'paused' : 'remaining'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10 }}>
                {!done && (
                    paused
                        ? <button onClick={onUnpause} style={timerBtnStyle(C.sage, C.white)}>▶ Resume</button>
                        : <button onClick={onPause} style={timerBtnStyle('transparent', C.sage, C.sage)}>⏸ Pause</button>
                )}
                <button onClick={onRestart} style={timerBtnStyle('transparent', C.textMuted, C.mist)}>↺ Restart</button>
            </div>

            {done && (
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sage }}>✅ Timer done — ready for the next step</div>
            )}
        </Card>
    )
}

const timerBtnStyle = (bg: string, color: string, border?: string): React.CSSProperties => ({
    backgroundColor: bg,
    color,
    border: `1.5px solid ${border ?? bg}`,
    borderRadius: 10,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
})

// ─── Cook ────────────────────────────────────────────────────────
function CookStage({ steps, onNext, onBack }: { steps: Step[]; onNext: () => void; onBack: () => void }) {
    const [idx, setIdx] = useState(0)
    const [timerActive, setTimerActive] = useState(false)
    const [timerPaused, setTimerPaused] = useState(false)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [timerDone, setTimerDone] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const step = steps[idx]
    const isLast = idx === steps.length - 1
    const timerSeconds = step?.timingMinutes ? Math.round(step.timingMinutes * 60) : null

    const clearTimer = () => { if (intervalRef.current) clearInterval(intervalRef.current) }

    const runInterval = () => {
        clearTimer()
        intervalRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t === null || t <= 1) {
                    clearTimer()
                    setTimerActive(false)
                    setTimerDone(true)
                    return 0
                }
                return t - 1
            })
        }, 1000)
    }

    const startTimer = (seconds: number) => {
        setTimeLeft(seconds)
        setTimerActive(true)
        setTimerPaused(false)
        setTimerDone(false)
        runInterval()
    }

    const pauseTimer = () => {
        clearTimer()
        setTimerActive(false)
        setTimerPaused(true)
    }

    const unpauseTimer = () => {
        setTimerActive(true)
        setTimerPaused(false)
        runInterval()
    }

    const restartTimer = () => {
        if (timerSeconds) startTimer(timerSeconds)
    }

    const resetTimerState = () => {
        clearTimer()
        setTimerActive(false)
        setTimerPaused(false)
        setTimerDone(false)
        setTimeLeft(null)
    }

    // Reset timer when step changes
    useEffect(() => { resetTimerState() }, [idx])

    // Cleanup on unmount
    useEffect(() => () => clearTimer(), [])

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
    const timerStarted = timerActive || timerPaused || timerDone

    if (!step) return null

    return (
        <StepLayout
            icon="🔥" title="Cook"
            stepLabel={`Step ${idx + 1} of ${steps.length}`}
            stepContent={
                <div>
                    <Card style={{ padding: 44, marginBottom: 16 }}>
                        <p style={{ fontSize: 22, lineHeight: 1.9, color: C.forest, fontFamily: "'Lora', serif", margin: 0 }}>
                            {step.text}
                        </p>
                    </Card>

                    {timerSeconds && !timerStarted && (
                        <button onClick={() => startTimer(timerSeconds)} style={{
                            backgroundColor: C.sagePale, border: `1.5px solid ${C.sageLight}`,
                            borderRadius: 12, padding: '15px 24px', fontSize: 14, color: C.sage,
                            fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <span style={{ fontSize: 20 }}>⏱</span> Start Timer · {fmt(timerSeconds)}
                        </button>
                    )}

                    {timerStarted && timeLeft !== null && timerSeconds && (
                        <CircularTimer
                            timeLeft={timeLeft}
                            totalSeconds={timerSeconds}
                            paused={timerPaused}
                            done={timerDone}
                            onPause={pauseTimer}
                            onUnpause={unpauseTimer}
                            onRestart={restartTimer}
                        />
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: i <= idx ? C.sage : C.mist }} />
                        ))}
                    </div>
                </div>
            }
            sidebar={
                <>
                    <Btn onClick={() => { resetTimerState(); isLast ? onNext() : setIdx(i => i + 1) }}>
                        {isLast ? 'Done · Next stage →' : 'Done · Next step →'}
                    </Btn>
                    <div style={{ marginTop: 10 }}>
                        <Btn variant="secondary" onClick={() => { resetTimerState(); idx > 0 ? setIdx(i => i - 1) : onBack() }}>
                            ← Back
                        </Btn>
                    </div>
                </>
            }
        />
    )
}

// ─── Serve ───────────────────────────────────────────────────────
function ServeStage({ recipe, onComplete, onBack }: { recipe: RecipeJSON; onComplete: () => void; onBack: () => void }) {
    const [rating, setRating] = useState(0)
    const [submitted, setSubmitted] = useState(false)

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 48 }}>
            <div style={{ fontSize: 88, marginBottom: 20 }}>🍽️</div>
            <h2 style={{ fontSize: 38, fontFamily: "'Lora', serif", fontWeight: 700, color: C.forest, margin: '0 0 10px', lineHeight: 1.3 }}>
                You made it.<br />Time to eat.
            </h2>
            <p style={{ fontSize: 16, color: C.textMuted, marginBottom: 44 }}>{recipe.title}</p>

            {!submitted ? (
                <Card style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.forest, marginBottom: 4 }}>How complex did this feel?</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>Your rating helps improve future matches</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setRating(n)} style={{
                                width: 54, height: 54, borderRadius: 14, border: 'none',
                                backgroundColor: rating >= n ? C.sage : C.mist,
                                cursor: 'pointer', fontSize: 22, transition: 'all 0.15s',
                                transform: rating === n ? 'scale(1.15)' : 'scale(1)',
                            }}>⭐</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textLight, padding: '0 4px', marginBottom: 24 }}>
                        <span>Very easy</span><span>Very complex</span>
                    </div>
                    <Btn onClick={() => setSubmitted(true)} disabled={rating === 0}>Rate it →</Btn>
                </Card>
            ) : (
                <Card style={{ marginBottom: 28, backgroundColor: C.sagePale }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🌿</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.sage }}>Thanks — rating saved</div>
                </Card>
            )}

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                <button onClick={onBack} style={{ padding: '13px 28px', borderRadius: 10, border: `1.5px solid ${C.sage}`, backgroundColor: 'transparent', color: C.sage, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>← Back</button>
                <button onClick={onComplete} style={{ padding: '13px 28px', borderRadius: 10, border: 'none', backgroundColor: C.sage, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Cook something else →</button>
            </div>
        </div>
    )
}

// ─── Main CookingMode ────────────────────────────────────────────
interface Props {
    recipe: RecipeJSON
    onComplete: () => void
    onBack: () => void
}

export function CookingMode({ recipe, onComplete, onBack }: Props) {
    const [stage, setStage] = useState<Stage>('groceries')

    // Split flat steps array into stages using isCritical for preprep
    const prePrepSteps = recipe.steps.filter(s => s.isCritical)
    const prepSteps = recipe.steps.filter(s => !s.isCritical && !s.timingMinutes)
    const cookSteps = recipe.steps.filter(s => !s.isCritical && !!s.timingMinutes)

    const stageContent: Record<Stage, React.ReactNode> = {
        groceries: <GroceriesStage recipe={recipe} onNext={() => setStage('preprep')} onBack={onBack} />,
        preprep: prePrepSteps.length > 0
            ? <StepStage icon="🌙" title="Pre-Prep" steps={prePrepSteps} onNext={() => setStage('prep')} onBack={() => setStage('groceries')} />
            : null,
        prep: <StepStage icon="🔪" title="Prep" steps={prepSteps} onNext={() => setStage('cook')} onBack={() => setStage(prePrepSteps.length > 0 ? 'preprep' : 'groceries')} />,
        cook: <CookStage steps={cookSteps} onNext={() => setStage('serve')} onBack={() => setStage('prep')} />,
        serve: <ServeStage recipe={recipe} onComplete={onComplete} onBack={() => setStage('cook')} />,
    }

    // Auto-skip preprep if no critical steps
    useEffect(() => {
        if (stage === 'preprep' && prePrepSteps.length === 0) setStage('prep')
    }, [stage, prePrepSteps.length])

    return (
        <div style={{ minHeight: '100vh', backgroundColor: C.cream, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
            {/* Nav */}
            <nav style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.mist}`, padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(45,59,53,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>🌿</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: C.forest, fontFamily: "'Lora', Georgia, serif" }}>Simmer</span>
                </div>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sage, fontSize: 14, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                    ✕ Exit cooking mode
                </button>
            </nav>

            {/* Stage bar */}
            <StageBar current={stage} />

            {/* Content */}
            <div style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 48px 80px' }}>
                {stageContent[stage]}
            </div>
        </div>
    )
}

// ─── Wrapper (connected to router) ───────────────────────────────
export default function CookingModeWrapper() {
    const { id } = useParams()
    const navigate = useNavigate()
    const recipe = useRecipe(id ?? '')

    if (!recipe) return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#7A8C84', textAlign: 'center' }}>
            Loading recipe…
        </div>
    )

    return (
        <CookingMode
            recipe={recipe}
            onComplete={() => navigate('/')}
            onBack={() => navigate(-1)}
        />
    )
}