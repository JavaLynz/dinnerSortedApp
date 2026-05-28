import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/SupabaseClient"
import { useProfile } from "../hooks/Useprofile"

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

// ── Constants ────────────────────────────────────────────────────
const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free", "Halal"]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const FREEZER_OPTIONS = ["Chicken", "Beef mince", "Fish / fish fingers", "Sausages", "Prawns", "Veggie burgers"]

const EFFORT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
    "Easy":        { bg: "rgba(82,232,168,0.1)",  color: "#52E8A8", border: "rgba(82,232,168,0.3)" },
    "Medium":      { bg: "rgba(200,185,122,0.1)", color: "#C8B97A", border: "rgba(200,185,122,0.3)" },
    "Needs focus": { bg: "rgba(252,124,120,0.1)", color: "#FC7C78", border: "rgba(252,124,120,0.3)" },
}

// ── Shared styles ────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0A1009",
    border: "1px solid rgba(82,232,168,0.15)",
    borderRadius: "0.6rem",
    padding: "0.85rem",
    color: "#EDE8DC",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.1rem",
    textTransform: "uppercase",
    color: "rgba(237,232,220,0.4)",
    marginBottom: "0.45rem",
}

const sublabelStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    color: "rgba(237,232,220,0.35)",
    marginBottom: "0.7rem",
    lineHeight: 1.5,
}

function pillButton(selected: boolean, variant: "teal" | "gold" = "teal"): React.CSSProperties {
    if (selected) {
        return variant === "teal"
            ? { padding: "0.35rem 0.85rem", borderRadius: "2rem", fontSize: "0.82rem", fontFamily: "inherit", cursor: "pointer", border: "1px solid rgba(82,232,168,0.5)", background: "rgba(82,232,168,0.15)", color: "#52E8A8" }
            : { padding: "0.35rem 0.85rem", borderRadius: "2rem", fontSize: "0.82rem", fontFamily: "inherit", cursor: "pointer", border: "1px solid rgba(200,185,122,0.45)", background: "rgba(200,185,122,0.15)", color: "#C8B97A" }
    }
    return {
        padding: "0.35rem 0.85rem", borderRadius: "2rem", fontSize: "0.82rem",
        fontFamily: "inherit", cursor: "pointer",
        border: "1px solid rgba(237,232,220,0.12)", background: "transparent",
        color: "rgba(237,232,220,0.45)"
    }
}

// ── Component ────────────────────────────────────────────────────
export default function ProfilePage() {
    const navigate = useNavigate()
    const {
        firstName: savedName,
        people: savedPeople,
        dietary: savedDietary,
        fussyEaterNotes: savedFussy,
        busyNights: savedBusyNights,
        chaoticNights: savedChaoticNights,
        sundayWindow: savedSundayWindow,
        weeknightTime: savedWeeknightTime,
        freezerProteins: savedFreezerProteins,
        saveProfile
    } = useProfile()

    // Editable local state — initialised from profile
    const [name, setName] = useState("")
    const [people, setPeople] = useState(4)
    const [dietary, setDietary] = useState<string[]>([])
    const [fussyEaterNotes, setFussyEaterNotes] = useState("")
    const [busyNights, setBusyNights] = useState<string[]>([])
    const [chaoticNights, setChaoticNights] = useState("")
    const [sundayWindow, setSundayWindow] = useState("90 min")
    const [weeknightTime, setWeeknightTime] = useState("20-30 min")
    const [freezerProteins, setFreezerProteins] = useState<string[]>([])

    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [activeTab, setActiveTab] = useState<"settings" | "favourites">("settings")

    // Favourites from Supabase
    const [favourites, setFavourites] = useState<Meal[]>([])
    const [loadingFavourites, setLoadingFavourites] = useState(true)
    const [removingMeal, setRemovingMeal] = useState<string | null>(null)

    // Populate fields once profile loads
    useEffect(() => {
        if (savedName) setName(savedName)
        if (savedPeople) setPeople(savedPeople)
        if (savedDietary?.length) setDietary(savedDietary)
        if (savedFussy) setFussyEaterNotes(savedFussy)
        if (savedBusyNights?.length) setBusyNights(savedBusyNights)
        if (savedChaoticNights) setChaoticNights(savedChaoticNights)
        if (savedSundayWindow) setSundayWindow(savedSundayWindow)
        if (savedWeeknightTime) setWeeknightTime(savedWeeknightTime)
        if (savedFreezerProteins?.length) setFreezerProteins(savedFreezerProteins)
    }, [savedName, savedPeople, savedDietary, savedFussy, savedBusyNights,
        savedChaoticNights, savedSundayWindow, savedWeeknightTime, savedFreezerProteins])

    // Fetch favourites from Supabase
    useEffect(() => {
        async function fetchFavourites() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase
                .from("favourite_meals")
                .select("meal")
                .eq("user_id", user.id)
                .order("saved_at", { ascending: false })
            setFavourites(data?.map(row => row.meal) ?? [])
            setLoadingFavourites(false)
        }
        fetchFavourites()
    }, [])

    const toggleArray = (
        value: string,
        _state: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setter(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const handleSave = async () => {
        setSaving(true)
        await saveProfile({
            name, people, dietary, fussyEaterNotes,
            busyNights, chaoticNights, sundayWindow,
            weeknightTime, freezerProteins
        })
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    const removeFavourite = async (mealName: string) => {
        setRemovingMeal(mealName)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase
            .from("favourite_meals")
            .delete()
            .eq("user_id", user.id)
            .eq("meal->>name", mealName)
        setFavourites(prev => prev.filter(m => m.name !== mealName))
        setRemovingMeal(null)
    }

    return (
        <div style={{
            background: "#0F1612",
            minHeight: "100vh",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
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
                    <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "1.15rem", color: "rgba(237,232,220,0.4)" }}>dinner</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#52E8A8" }}>sorted</span>
                </div>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(200,185,122,0.2)",
                        color: "rgba(237,232,220,0.5)",
                        padding: "0.4rem 1rem",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontFamily: "inherit"
                    }}
                >
                    ← Back
                </button>
            </nav>

            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

                {/* Header */}
                <div style={{ marginBottom: "2rem" }}>
                    <p style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: "italic", fontSize: "0.85rem", color: "#52E8A8", marginBottom: "0.3rem" }}>
                        Your account —
                    </p>
                    <h1 style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: "clamp(1.6rem, 5vw, 2.2rem)", fontWeight: 600, color: "#EDE8DC", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
                        {savedName ? `${savedName}'s profile` : "Your profile"}
                    </h1>
                    <p style={{ fontSize: "0.83rem", color: "rgba(237,232,220,0.35)", lineHeight: 1.6 }}>
                        Update your household details or view your saved meals.
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "0.4rem", borderBottom: "1px solid rgba(200,185,122,0.15)", marginBottom: "2rem" }}>
                    {(["settings", "favourites"] as const).map(tab => (
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
                            {tab === "settings" ? "Household" : `Favourites${favourites.length ? ` (${favourites.length})` : ""}`}
                        </button>
                    ))}
                </div>

                {/* ── SETTINGS TAB ─────────────────────────────────── */}
                {activeTab === "settings" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

                        {/* Name */}
                        <div>
                            <label style={labelStyle}>First name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.5)")}
                                onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.15)")}
                            />
                        </div>

                        {/* People */}
                        <div>
                            <label style={labelStyle}>How many people are you feeding?</label>
                            <select
                                value={people}
                                onChange={e => setPeople(Number(e.target.value))}
                                style={{ ...inputStyle, appearance: "none" as const }}
                            >
                                {[1,2,3,4,5,6,7,8].map(p => (
                                    <option key={p} value={p}>{p} {p === 1 ? " person" : " people"}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dietary */}
                        <div>
                            <label style={labelStyle}>Dietary requirements</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {DIETARY_OPTIONS.map(opt => (
                                    <button key={opt} onClick={() => toggleArray(opt, dietary, setDietary)} style={pillButton(dietary.includes(opt))}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fussy eaters */}
                        <div>
                            <label style={labelStyle}>Fussy eaters</label>
                            <p style={sublabelStyle}>Who and what they won't touch</p>
                            <input
                                type="text"
                                value={fussyEaterNotes}
                                onChange={e => setFussyEaterNotes(e.target.value)}
                                placeholder="e.g. 5 year old — no spice, no mixed textures"
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.5)")}
                                onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.15)")}
                            />
                        </div>

                        {/* Busy nights */}
                        <div>
                            <label style={labelStyle}>Nights with under 30 minutes</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {DAYS.map(day => (
                                    <button key={day} onClick={() => toggleArray(day, busyNights, setBusyNights)} style={pillButton(busyNights.includes(day))}>
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chaotic nights */}
                        <div>
                            <label style={labelStyle}>Truly chaotic nights — 10-15 mins max</label>
                            <p style={sublabelStyle}>Football pickup, late finish, school run chaos</p>
                            <input
                                type="text"
                                value={chaoticNights}
                                onChange={e => setChaoticNights(e.target.value)}
                                placeholder="e.g. Wednesday football pickup, Friday late finish"
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.5)")}
                                onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.15)")}
                            />
                        </div>

                        {/* Weeknight time */}
                        <div>
                            <label style={labelStyle}>Normal weeknight cooking time</label>
                            <select
                                value={weeknightTime}
                                onChange={e => setWeeknightTime(e.target.value)}
                                style={{ ...inputStyle, appearance: "none" as const }}
                            >
                                <option value="Under 20 min">Under 20 minutes</option>
                                <option value="20-30 min">20–30 minutes</option>
                                <option value="30-45 min">30–45 minutes</option>
                                <option value="Varies">Varies by night</option>
                            </select>
                        </div>

                        {/* Sunday window */}
                        <div>
                            <label style={labelStyle}>Sunday prep window</label>
                            <select
                                value={sundayWindow}
                                onChange={e => setSundayWindow(e.target.value)}
                                style={{ ...inputStyle, appearance: "none" as const }}
                            >
                                <option value="60 min">About an hour</option>
                                <option value="90 min">90 minutes</option>
                                <option value="2 hours">2 hours</option>
                                <option value="3+ hours">3 hours or more</option>
                            </select>
                        </div>

                        {/* Freezer proteins */}
                        <div>
                            <label style={labelStyle}>Usual freezer proteins</label>
                            <p style={sublabelStyle}>Pre-selected on your ingredient page each week</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {FREEZER_OPTIONS.map(opt => (
                                    <button key={opt} onClick={() => toggleArray(opt, freezerProteins, setFreezerProteins)} style={pillButton(freezerProteins.includes(opt), "gold")}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                width: "100%",
                                background: saved
                                    ? "rgba(82,232,168,0.12)"
                                    : saving
                                        ? "rgba(82,232,168,0.3)"
                                        : "linear-gradient(135deg, #52E8A8, #34C484)",
                                color: saved ? "#52E8A8" : "#0A1009",
                                border: saved ? "1px solid rgba(82,232,168,0.3)" : "none",
                                borderRadius: "0.85rem",
                                padding: "1rem",
                                fontSize: "1rem",
                                fontWeight: 700,
                                fontFamily: "inherit",
                                cursor: saving ? "not-allowed" : "pointer",
                                letterSpacing: "0.02em",
                                boxShadow: saving || saved ? "none" : "0 0 24px rgba(82,232,168,0.25)",
                                transition: "all 0.2s"
                            }}
                        >
                            {saved ? "✓ Saved" : saving ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                )}

                {/* ── FAVOURITES TAB ───────────────────────────────── */}
                {activeTab === "favourites" && (
                    <div>
                        {loadingFavourites ? (
                            <div style={{ textAlign: "center", padding: "3rem 0" }}>
                                <p style={{ fontSize: "0.85rem", color: "rgba(237,232,220,0.3)", fontStyle: "italic", fontFamily: "'Noto Serif', Georgia, serif" }}>
                                    Loading your saved meals…
                                </p>
                            </div>
                        ) : favourites.length === 0 ? (
                            <div style={{
                                background: "#1E2B1F",
                                border: "1px solid rgba(82,232,168,0.1)",
                                borderRadius: "1rem",
                                padding: "2.5rem",
                                textAlign: "center"
                            }}>
                                <p style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>♡</p>
                                <p style={{ fontSize: "0.9rem", color: "rgba(237,232,220,0.5)", fontFamily: "'Noto Serif', Georgia, serif", fontStyle: "italic" }}>
                                    No saved meals yet
                                </p>
                                <p style={{ fontSize: "0.8rem", color: "rgba(237,232,220,0.3)", marginTop: "0.4rem" }}>
                                    Tap ♡ on any meal in your plan to save it here
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {favourites.map(meal => {
                                    const effort = EFFORT_COLORS[meal.effortLevel] || EFFORT_COLORS["Easy"]
                                    const isRemoving = removingMeal === meal.name
                                    return (
                                        <div
                                            key={meal.name}
                                            style={{
                                                background: "#1E2B1F",
                                                border: "1px solid rgba(82,232,168,0.1)",
                                                borderRadius: "1rem",
                                                padding: "1rem 1.25rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: "1rem",
                                                opacity: isRemoving ? 0.4 : 1,
                                                transition: "opacity 0.2s"
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{
                                                    fontFamily: "'Noto Serif', Georgia, serif",
                                                    fontSize: "1rem",
                                                    fontWeight: 600,
                                                    color: "#EDE8DC",
                                                    marginBottom: "0.35rem",
                                                    lineHeight: 1.3
                                                }}>
                                                    {meal.name}
                                                </h3>
                                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                                                    <span style={{
                                                        fontSize: "0.7rem",
                                                        padding: "0.15rem 0.55rem",
                                                        borderRadius: "2rem",
                                                        background: effort.bg,
                                                        color: effort.color,
                                                        border: `1px solid ${effort.border}`,
                                                        fontWeight: 500
                                                    }}>
                                                        {meal.effortLevel}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "0.7rem",
                                                        color: "rgba(237,232,220,0.3)",
                                                        fontStyle: "italic"
                                                    }}>
                                                        {meal.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFavourite(meal.name)}
                                                disabled={isRemoving}
                                                style={{
                                                    background: "transparent",
                                                    border: "1px solid rgba(252,124,120,0.2)",
                                                    borderRadius: "50%",
                                                    width: "30px",
                                                    height: "30px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "0.8rem",
                                                    color: "rgba(252,124,120,0.5)",
                                                    cursor: isRemoving ? "not-allowed" : "pointer",
                                                    flexShrink: 0,
                                                    transition: "all 0.15s"
                                                }}
                                                title="Remove from favourites"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}