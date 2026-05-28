import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { supabase } from "../services/SupabaseClient"

// ── Types ────────────────────────────────────────────────────────
interface Meal {
    day: number
    name: string
    label: string
    effortLevel: string
    ingredients: string[]
    instructions: string
    dinnertimeInstruction: string
    missingIngredients: string[]
}

interface MealPlan {
    meals: Meal[]
    shoppingList: string[]
    sundaySession: string
}

interface LocationState {
    mealPlan: MealPlan
    ingredients: string[]
    dietary: string[]
    people: number
    fussyEaterNotes: string
    busyNights: string[]
    chaoticNights: string
    sundayWindow: string
    weeknightTime: string
    freezerProteins: string[]

}

// ── Constants ────────────────────────────────────────────────────
const EFFORT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
    "Easy":        { bg: "rgba(82,232,168,0.1)",  color: "#52E8A8", border: "rgba(82,232,168,0.3)" },
    "Medium":      { bg: "rgba(200,185,122,0.1)", color: "#C8B97A", border: "rgba(200,185,122,0.3)" },
    "Needs focus": { bg: "rgba(252,124,120,0.1)", color: "#FC7C78", border: "rgba(252,124,120,0.3)" },
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const LIKED_KEY = "ds_liked_meals"

// ── localStorage helpers ─────────────────────────────────────────
function getLikedMeals(): Meal[] {
    try { return JSON.parse(localStorage.getItem(LIKED_KEY) || "[]") } catch { return [] }
}
function saveLikedMeals(meals: Meal[]) {
    localStorage.setItem(LIKED_KEY, JSON.stringify(meals))
}

// ── Component ────────────────────────────────────────────────────
export default function ResultsPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const state = location.state as LocationState
    const {
        mealPlan: initial,
        ingredients = [],
        dietary = [],
        people = 4,
        fussyEaterNotes = "",
        busyNights = [],
        chaoticNights = "",
        sundayWindow = "90 min",
        weeknightTime = "20-30 min",
        freezerProteins = []
    } = state || {}

    const [meals, setMeals] = useState<Meal[]>(initial?.meals || [])
    const [shoppingList, setShoppingList] = useState<string[]>(initial?.shoppingList || [])
    const [sundaySession, setSundaySession] = useState<string>(initial?.sundaySession || "")
    const [likedMeals, setLikedMeals] = useState<Meal[]>(getLikedMeals())

    // Set of day numbers selected for regeneration
    const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set())
    const [regenerating, setRegenerating] = useState(false)
    const [regeneratingAll, setRegeneratingAll] = useState(false)

    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<"meals" | "sunday" | "shop">("meals")

    useEffect(() => {
        if (!initial) navigate("/")
        window.scrollTo(0, 0)
    }, [])

    // ── Like / unlike ────────────────────────────────────────────
    const toggleLike = (meal: Meal) => {
        const already = likedMeals.some(m => m.name === meal.name)
        const updated = already
            ? likedMeals.filter(m => m.name !== meal.name)
            : [...likedMeals, meal]
        setLikedMeals(updated)
        saveLikedMeals(updated)
    }
    const isLiked = (meal: Meal) => likedMeals.some(m => m.name === meal.name)

    // ── Toggle day selection ─────────────────────────────────────
    const toggleDaySelection = (day: number) => {
        setSelectedDays(prev => {
            const next = new Set(prev)
            next.has(day) ? next.delete(day) : next.add(day)
            return next
        })
    }

    const clearSelection = () => setSelectedDays(new Set())

    // ── Regenerate selected days ─────────────────────────────────
    const regenerateSelected = async () => {
        if (selectedDays.size === 0) return
        setRegenerating(true)

        const keptMeals = meals.filter(m => !selectedDays.has(m.day))
        const excludeNames = meals.map(m => m.name)
        const keepDescriptions = keptMeals.map(m => `Day ${m.day}: ${m.name}`)

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/recipes/generate`,
                {
                    ingredients,
                    dietary,
                    days: meals.length,
                    people,
                    fussyEaterNotes,
                    busyNights,
                    chaoticNights,
                    sundayWindow,
                    weeknightTime,
                    freezerProteins,
                    exclude: excludeNames,
                    keep: keepDescriptions
                }
            )

            // Merge by day number — kept meals stay, new meals slot in
            const newMeals: Meal[] = res.data.meals
            const merged = meals.map(existing => {
                const replacement = newMeals.find(m => m.day === existing.day)
                return replacement ?? existing
            })

            setMeals(merged)
            setShoppingList(res.data.shoppingList)
            setSundaySession(res.data.sundaySession)
            setSaved(false)
            clearSelection()
        } catch (e) {
            console.error("Regenerate failed", e)
        } finally {
            setRegenerating(false)
        }
    }

    // ── Regenerate whole week ────────────────────────────────────
    const regenerateAll = async () => {
        setRegeneratingAll(true)
        clearSelection()
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/recipes/generate`,
                {
                    ingredients,
                    dietary,
                    days: meals.length,
                    people,
                    fussyEaterNotes,
                    busyNights,
                    chaoticNights,
                    sundayWindow,
                    weeknightTime,
                    freezerProteins
                }
            )
            setMeals(res.data.meals)
            setShoppingList(res.data.shoppingList)
            setSundaySession(res.data.sundaySession)
            setSaved(false)
        } catch (e) {
            console.error("Regenerate all failed", e)
        } finally {
            setRegeneratingAll(false)
        }
    }

    // ── Save plan to Supabase ────────────────────────────────────
    const savePlan = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { navigate("/login"); return }
            await supabase.from("meal_plans").insert({
                user_id: user.id,
                plan: { meals, shoppingList, sundaySession }
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e) {
            console.error("Save failed", e)
        } finally {
            setSaving(false)
        }
    }

    // ── Print sunday session ─────────────────────────────────────
    const handlePrint = () => {
        const w = window.open("", "_blank")
        if (!w) return
        w.document.documentElement.innerHTML = `<!DOCTYPE html>
<html lang="en"><head>
<title>Sunday Session — Dinner Sorted</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', sans-serif; font-size: 11px; line-height: 1.7; color: #1a1a1a; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .sub { font-size: 10px; color: #666; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #52E8A8; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 11px; }
</style></head><body>
<h1>☀️ Sunday Session</h1>
<p class="sub">Dinner Sorted — dinnersorted.app</p>
<pre>${sundaySession}</pre>
</body></html>`
        w.document.close()
        w.focus()
        w.print()
    }

    if (!initial) return null

    const isAnyLoading = regenerating || regeneratingAll

    return (
        <div style={{
            background: "#0F1612",
            minHeight: "100vh",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            paddingBottom: selectedDays.size > 0 ? "6rem" : "0"
        }}>

            {/* Nav */}
            <nav style={{
                background: "#0A1009",
                borderBottom: "1px solid rgba(200,185,122,0.15)",
                padding: "1.1rem 1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: "2px" }}>
                    <span style={{
                        fontFamily: "'Noto Serif', Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 400,
                        fontSize: "1.15rem",
                        color: "rgba(237,232,220,0.4)"
                    }}>dinner</span>
                    <span style={{
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "#52E8A8"
                    }}>sorted</span>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    <NavButton
                        onClick={regenerateAll}
                        loading={regeneratingAll}
                        disabled={isAnyLoading}
                        label="New week"
                        loadingLabel="Generating…"
                        variant="ghost"
                    />
                    <NavButton
                        onClick={savePlan}
                        loading={saving}
                        disabled={isAnyLoading || saving}
                        label={saved ? "✓ Saved" : "Save plan"}
                        loadingLabel="Saving…"
                        variant={saved ? "success" : "primary"}
                    />
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(237,232,220,0.12)",
                            borderRadius: "2rem",
                            color: "rgba(237,232,220,0.4)",
                            fontSize: "0.8rem",
                            padding: "0.45rem 0.9rem",
                            cursor: "pointer",
                            fontFamily: "inherit"
                        }}
                    >
                        ← Change
                    </button>
                </div>
            </nav>

            {/* Header */}
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.5rem 0" }}>
                <p style={{
                    fontFamily: "'Noto Serif', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "0.85rem",
                    color: "#52E8A8",
                    marginBottom: "0.3rem"
                }}>Week sorted —</p>
                <h1 style={{
                    fontFamily: "'Noto Serif', Georgia, serif",
                    fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                    fontWeight: 600,
                    color: "#EDE8DC",
                    letterSpacing: "-0.02em",
                    marginBottom: "0.4rem"
                }}>
                    Here's your {meals.length}-night plan
                </h1>
                <p style={{ fontSize: "0.83rem", color: "rgba(237,232,220,0.35)", lineHeight: 1.6 }}>
                    {selectedDays.size > 0
                        ? `${selectedDays.size} meal${selectedDays.size > 1 ? "s" : ""} selected — tap ↺ again to deselect`
                        : "Tap ↺ on any meal to swap it · ♡ to save to favourites"
                    }
                </p>
            </div>

            {/* Tabs */}
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1.25rem 1.5rem 0" }}>
                <div style={{ display: "flex", gap: "0.4rem", borderBottom: "1px solid rgba(200,185,122,0.15)" }}>
                    {(["meals", "sunday", "shop"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: "transparent",
                                border: "none",
                                borderBottom: activeTab === tab ? "2px solid #52E8A8" : "2px solid transparent",
                                color: activeTab === tab ? "#52E8A8" : "rgba(237,232,220,0.4)",
                                fontFamily: "inherit",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                padding: "0.5rem 0.85rem",
                                cursor: "pointer",
                                marginBottom: "-1px",
                                transition: "color 0.15s"
                            }}
                        >
                            {tab === "meals" ? "Meals" : tab === "sunday" ? "Sunday" : "Shopping"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1.5rem 1.5rem 2rem" }}>

                {/* ── MEALS ── */}
                {activeTab === "meals" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {meals.map((meal, index) => {
                            const effort = EFFORT_COLORS[meal.effortLevel] || EFFORT_COLORS["Easy"]
                            const liked = isLiked(meal)
                            const isSelected = selectedDays.has(meal.day)
                            const isThisLoading = regenerating && isSelected

                            return (
                                <div
                                    key={meal.day}
                                    style={{
                                        background: "#1E2B1F",
                                        border: isSelected
                                            ? "1.5px solid rgba(82,232,168,0.45)"
                                            : "1px solid rgba(82,232,168,0.1)",
                                        borderRadius: "1rem",
                                        padding: "1.25rem",
                                        opacity: (isAnyLoading && !isSelected) ? 0.45 : 1,
                                        transition: "opacity 0.25s, border-color 0.2s",
                                        position: "relative",
                                        boxShadow: isSelected
                                            ? "0 0 0 1px rgba(82,232,168,0.1), 0 0 20px rgba(82,232,168,0.06)"
                                            : "none"
                                    }}
                                >
                                    {/* Selected left accent */}
                                    {isSelected && (
                                        <div style={{
                                            position: "absolute",
                                            top: "0.75rem",
                                            left: "-0.05rem",
                                            width: "3px",
                                            height: "calc(100% - 1.5rem)",
                                            background: "linear-gradient(180deg, #52E8A8, #34C484)",
                                            borderRadius: "0 2px 2px 0"
                                        }} />
                                    )}

                                    {/* Header row */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "0.75rem"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                                            <span style={{
                                                fontSize: "0.68rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.12em",
                                                textTransform: "uppercase",
                                                color: "#C8B97A"
                                            }}>
                                                {DAYS[index] || `Day ${meal.day}`}
                                            </span>
                                            <span style={{
                                                fontSize: "0.72rem",
                                                padding: "0.2rem 0.65rem",
                                                borderRadius: "2rem",
                                                background: effort.bg,
                                                color: effort.color,
                                                border: `1px solid ${effort.border}`,
                                                fontWeight: 500
                                            }}>
                                                {meal.effortLevel}
                                            </span>
                                            <span style={{
                                                fontSize: "0.72rem",
                                                color: "rgba(237,232,220,0.3)",
                                                fontStyle: "italic"
                                            }}>
                                                {meal.label}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                                            <IconButton
                                                onClick={() => toggleLike(meal)}
                                                active={liked}
                                                activeColor="#FC7C78"
                                                activeBg="rgba(252,124,120,0.12)"
                                                activeBorder="rgba(252,124,120,0.3)"
                                                title={liked ? "Remove from favourites" : "Save to favourites"}
                                                disabled={isAnyLoading}
                                            >
                                                {liked ? "♥" : "♡"}
                                            </IconButton>
                                            <IconButton
                                                onClick={() => toggleDaySelection(meal.day)}
                                                active={isSelected}
                                                activeColor="#52E8A8"
                                                activeBg="rgba(82,232,168,0.12)"
                                                activeBorder="rgba(82,232,168,0.4)"
                                                title={isSelected ? "Deselect" : "Select to swap"}
                                                disabled={isAnyLoading}
                                            >
                                                {isThisLoading ? "…" : "↺"}
                                            </IconButton>
                                        </div>
                                    </div>

                                    {/* Meal name */}
                                    <h2 style={{
                                        fontFamily: "'Noto Serif', Georgia, serif",
                                        fontSize: "1.1rem",
                                        fontWeight: 600,
                                        color: "#EDE8DC",
                                        marginBottom: isSelected ? "0.6rem" : "0.85rem",
                                        lineHeight: 1.3
                                    }}>
                                        {isThisLoading ? "Finding something new…" : meal.name}
                                    </h2>

                                    {/* Selection hint */}
                                    {isSelected && !isThisLoading && (
                                        <div style={{
                                            background: "rgba(82,232,168,0.05)",
                                            border: "1px solid rgba(82,232,168,0.15)",
                                            borderRadius: "0.5rem",
                                            padding: "0.45rem 0.75rem",
                                            marginBottom: "0.85rem",
                                            fontSize: "0.77rem",
                                            color: "rgba(82,232,168,0.65)",
                                            fontStyle: "italic"
                                        }}>
                                            Marked for swapping — tap ↺ again to keep this meal
                                        </div>
                                    )}

                                    {!isThisLoading && (
                                        <>
                                            <SectionLabel>Ingredients</SectionLabel>
                                            <ul style={{
                                                margin: "0 0 1rem 0",
                                                padding: 0,
                                                listStyle: "none",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "0.2rem"
                                            }}>
                                                {meal.ingredients.map(i => (
                                                    <li key={i} style={{
                                                        fontSize: "0.83rem",
                                                        color: "rgba(237,232,220,0.6)",
                                                        display: "flex",
                                                        gap: "0.5rem"
                                                    }}>
                                                        <span style={{ color: "rgba(82,232,168,0.35)", flexShrink: 0 }}>·</span>
                                                        {i}
                                                    </li>
                                                ))}
                                            </ul>

                                            <SectionLabel>Instructions</SectionLabel>
                                            <div style={{
                                                marginBottom: "1rem",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "0.35rem"
                                            }}>
                                                {meal.instructions
                                                    .split(". ")
                                                    .filter(s => s.trim())
                                                    .map((step, i) => (
                                                        <p key={i} style={{
                                                            fontSize: "0.83rem",
                                                            color: "rgba(237,232,220,0.6)",
                                                            lineHeight: 1.6,
                                                            margin: 0
                                                        }}>
                                                            {step.trim()}{step.endsWith(".") ? "" : "."}
                                                        </p>
                                                    ))}
                                            </div>

                                            {/* 4:45pm */}
                                            <div style={{
                                                background: "rgba(82,232,168,0.07)",
                                                border: "1px solid rgba(82,232,168,0.2)",
                                                borderRadius: "0.65rem",
                                                padding: "0.75rem 1rem"
                                            }}>
                                                <p style={{
                                                    fontSize: "0.68rem",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.12em",
                                                    textTransform: "uppercase",
                                                    color: "#52E8A8",
                                                    marginBottom: "0.3rem"
                                                }}>4:45pm</p>
                                                <p style={{
                                                    fontSize: "0.85rem",
                                                    color: "#EDE8DC",
                                                    lineHeight: 1.55,
                                                    margin: 0
                                                }}>
                                                    {meal.dinnertimeInstruction}
                                                </p>
                                            </div>

                                            {meal.missingIngredients?.length > 0 && (
                                                <div style={{
                                                    marginTop: "0.75rem",
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "0.4rem",
                                                    alignItems: "center"
                                                }}>
                                                    <span style={{
                                                        fontSize: "0.72rem",
                                                        color: "rgba(200,185,122,0.5)"
                                                    }}>Need to buy:</span>
                                                    {meal.missingIngredients.map(item => (
                                                        <span key={item} style={{
                                                            fontSize: "0.72rem",
                                                            padding: "0.2rem 0.6rem",
                                                            borderRadius: "2rem",
                                                            background: "rgba(200,185,122,0.08)",
                                                            color: "#C8B97A",
                                                            border: "1px solid rgba(200,185,122,0.2)"
                                                        }}>{item}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* ── SUNDAY ── */}
                {activeTab === "sunday" && (
                    <div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1rem"
                        }}>
                            <p style={{
                                fontSize: "0.83rem",
                                color: "rgba(237,232,220,0.4)",
                                fontStyle: "italic",
                                fontFamily: "'Noto Serif', Georgia, serif"
                            }}>Your sequenced prep session</p>
                            <button
                                onClick={handlePrint}
                                style={{
                                    background: "transparent",
                                    border: "1px solid rgba(82,232,168,0.2)",
                                    borderRadius: "2rem",
                                    color: "#52E8A8",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    padding: "0.4rem 0.9rem",
                                    cursor: "pointer",
                                    fontFamily: "inherit"
                                }}
                            >🖨 Print</button>
                        </div>
                        <div style={{
                            background: "#1E2B1F",
                            border: "1px solid rgba(82,232,168,0.1)",
                            borderRadius: "1rem",
                            padding: "1.5rem"
                        }}>
                            {sundaySession
                                .split(/(?=\[\w+(?:\/\w+)?\])/)
                                .filter(line => line.trim())
                                .map((line, i) => {
                                    const tagMatch = line.match(/^\[(OVEN|HOB|PREP|COOL\/STORE|DONE|FREEZE)\]/)
                                    const tag = tagMatch?.[1]
                                    const tagColors: Record<string, string> = {
                                        OVEN: "#FC7C78",
                                        HOB: "#C8B97A",
                                        PREP: "#52E8A8",
                                        "COOL/STORE": "rgba(82,232,168,0.5)",
                                        DONE: "#52E8A8",
                                        FREEZE: "#818cf8"
                                    }
                                    return (
                                        <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.65rem", alignItems: "flex-start" }}>
                                            {tag && (
                                                <span style={{
                                                    fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em",
                                                    color: tagColors[tag], border: `1px solid ${tagColors[tag]}`,
                                                    borderRadius: "0.3rem", padding: "0.15rem 0.4rem",
                                                    flexShrink: 0, marginTop: "0.2rem", opacity: 0.85,
                                                    whiteSpace: "nowrap"
                                                }}>{tag}</span>
                                            )}
                                            <p style={{ fontSize: "0.83rem", color: "rgba(237,232,220,0.7)", lineHeight: 1.6, margin: 0 }}>
                                                {line.replace(/^\[(OVEN|HOB|PREP|COOL\/STORE|DONE|FREEZE)\]\s*/, "").trim()}
                                            </p>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                )}

                {/* ── SHOPPING ── */}
                {activeTab === "shop" && (
                    <div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1rem"
                        }}>
                            <p style={{
                                fontSize: "0.83rem",
                                color: "rgba(237,232,220,0.4)",
                                fontStyle: "italic",
                                fontFamily: "'Noto Serif', Georgia, serif"
                            }}>Items you need to buy</p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(shoppingList.join("\n")).then(() => {
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                    })
                                }}
                                style={{
                                    background: copied ? "rgba(82,232,168,0.1)" : "transparent",
                                    border: `1px solid ${copied ? "rgba(82,232,168,0.3)" : "rgba(82,232,168,0.2)"}`,
                                    borderRadius: "2rem", color: "#52E8A8", fontSize: "0.78rem",
                                    fontWeight: 600, padding: "0.4rem 0.9rem", cursor: "pointer",
                                    fontFamily: "inherit", transition: "all 0.2s"
                                }}
                            >{copied ? "✓ Copied" : "📋 Copy"}</button>
                        </div>
                        <div style={{
                            background: "#1E2B1F",
                            border: "1px solid rgba(82,232,168,0.1)",
                            borderRadius: "1rem",
                            padding: "1.25rem 1.5rem"
                        }}>
                            {shoppingList.map((item, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.55rem 0",
                                    borderBottom: i < shoppingList.length - 1 ? "1px solid rgba(237,232,220,0.05)" : "none"
                                }}>
                                    <span style={{ color: "rgba(82,232,168,0.3)", fontSize: "0.75rem", flexShrink: 0 }}>·</span>
                                    <span style={{ fontSize: "0.88rem", color: "rgba(237,232,220,0.7)" }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Floating regenerate bar ── */}
            {selectedDays.size > 0 && (
                <div style={{
                    position: "fixed", bottom: 0, left: 0, right: 0,
                    background: "#0A1009",
                    borderTop: "1px solid rgba(82,232,168,0.2)",
                    padding: "1rem 1.5rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "1rem", zIndex: 20,
                    boxShadow: "0 -8px 32px rgba(0,0,0,0.4)"
                }}>
                    <div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#EDE8DC", marginBottom: "0.1rem" }}>
                            {selectedDays.size} meal{selectedDays.size > 1 ? "s" : ""} selected
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "rgba(237,232,220,0.35)" }}>
                            The rest of your week will be kept
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.6rem" }}>
                        <button
                            onClick={clearSelection}
                            style={{
                                background: "transparent",
                                border: "1px solid rgba(237,232,220,0.15)",
                                borderRadius: "2rem", color: "rgba(237,232,220,0.4)",
                                fontSize: "0.83rem", fontWeight: 600,
                                padding: "0.65rem 1.1rem", cursor: "pointer", fontFamily: "inherit"
                            }}
                        >Cancel</button>
                        <button
                            onClick={regenerateSelected}
                            disabled={regenerating}
                            style={{
                                background: regenerating ? "rgba(82,232,168,0.3)" : "linear-gradient(135deg, #52E8A8, #34C484)",
                                border: "none", borderRadius: "2rem", color: "#0A1009",
                                fontSize: "0.83rem", fontWeight: 700,
                                padding: "0.65rem 1.4rem",
                                cursor: regenerating ? "not-allowed" : "pointer",
                                fontFamily: "inherit",
                                boxShadow: regenerating ? "none" : "0 0 16px rgba(82,232,168,0.25)",
                                transition: "opacity 0.2s"
                            }}
                        >
                            {regenerating
                                ? "Regenerating…"
                                : `Swap ${selectedDays.size} meal${selectedDays.size > 1 ? "s" : ""} →`
                            }
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Sub-components ───────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p style={{
            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(200,185,122,0.55)",
            margin: "0 0 0.4rem 0"
        }}>
            {children}
        </p>
    )
}

function IconButton({ onClick, active, activeColor, activeBg, activeBorder, title, disabled, children }: {
    onClick: () => void
    active: boolean
    activeColor: string
    activeBg: string
    activeBorder: string
    title: string
    disabled?: boolean
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            disabled={disabled}
            style={{
                background: active ? activeBg : "transparent",
                border: `1px solid ${active ? activeBorder : "rgba(237,232,220,0.12)"}`,
                borderRadius: "50%", width: "30px", height: "30px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem",
                cursor: disabled ? "not-allowed" : "pointer",
                color: active ? activeColor : "rgba(237,232,220,0.3)",
                transition: "all 0.15s", flexShrink: 0
            }}
        >
            {children}
        </button>
    )
}

function NavButton({ onClick, loading, disabled, label, loadingLabel, variant }: {
    onClick: () => void
    loading: boolean
    disabled?: boolean
    label: string
    loadingLabel: string
    variant: "primary" | "ghost" | "success"
}) {
    const styles: Record<string, React.CSSProperties> = {
        primary: {
            background: "linear-gradient(135deg, #52E8A8, #34C484)",
            color: "#0A1009", border: "none",
            boxShadow: "0 0 16px rgba(82,232,168,0.2)"
        },
        ghost: {
            background: "transparent",
            color: "rgba(237,232,220,0.5)",
            border: "1px solid rgba(237,232,220,0.15)"
        },
        success: {
            background: "rgba(82,232,168,0.12)",
            color: "#52E8A8",
            border: "1px solid rgba(82,232,168,0.3)"
        }
    }
    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            style={{
                borderRadius: "2rem", padding: "0.45rem 1rem",
                fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit",
                cursor: (loading || disabled) ? "not-allowed" : "pointer",
                opacity: (loading || disabled) ? 0.6 : 1,
                transition: "opacity 0.2s",
                ...styles[variant]
            }}
        >
            {loading ? loadingLabel : label}
        </button>
    )
}