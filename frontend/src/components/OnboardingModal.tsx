import { useState } from "react"

interface OnboardingModalProps {
    onSave: (data: OnboardingData) => Promise<void>
}

export interface OnboardingData {
    name: string
    people: number
    dietary: string[]
    fussyEaterNotes: string
    busyNights: string[]
    chaoticNights: string
    sundayWindow: string
    freezerProteins: string[]
    weeknightTime: string
}

const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free", "Halal"]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const FREEZER_OPTIONS = ["Chicken", "Beef mince", "Fish / fish fingers", "Sausages", "Prawns", "Veggie burgers"]
const TOTAL_STEPS = 3

// ── Shared styles ────────────────────────────────────────────────────────────
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

function pillButton(selected: boolean): React.CSSProperties {
    return {
        padding: "0.35rem 0.85rem",
        borderRadius: "2rem",
        fontSize: "0.82rem",
        fontFamily: "inherit",
        cursor: "pointer",
        border: selected ? "1px solid rgba(82,232,168,0.5)" : "1px solid rgba(237,232,220,0.12)",
        background: selected ? "rgba(82,232,168,0.15)" : "transparent",
        color: selected ? "#52E8A8" : "rgba(237,232,220,0.45)",
    }
}

function selectStyle(): React.CSSProperties {
    return {
        ...inputStyle,
        appearance: "none" as const,
    }
}

export default function OnboardingModal({ onSave }: OnboardingModalProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Step 1
    const [name, setName] = useState("")
    const [people, setPeople] = useState(4)
    const [dietary, setDietary] = useState<string[]>([])
    const [fussyEaterNotes, setFussyEaterNotes] = useState("")

    // Step 2
    const [busyNights, setBusyNights] = useState<string[]>([])
    const [chaoticNights, setChaoticNights] = useState("")
    const [weeknightTime, setWeeknightTime] = useState("20-30 min")

    // Step 3
    const [sundayWindow, setSundayWindow] = useState("90 min")
    const [freezerProteins, setFreezerProteins] = useState<string[]>([])

    const toggleArray = (
        value: string,
        _state: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setter(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const validateStep = (): boolean => {
        if (step === 1 && !name.trim()) {
            setError("We need something to call you")
            return false
        }
        return true
    }

    const handleNext = () => {
        setError("")
        if (!validateStep()) return
        setStep(s => s + 1)
    }

    const handleBack = () => {
        setError("")
        setStep(s => s - 1)
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError("")
        await onSave({
            name: name.trim(),
            people,
            dietary,
            fussyEaterNotes,
            busyNights,
            chaoticNights,
            sundayWindow,
            freezerProteins,
            weeknightTime,
        })
        setLoading(false)
    }

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,16,9,0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            zIndex: 50,
            overflowY: "auto",
        }}>
            <div style={{
                background: "#1E2B1F",
                border: "1px solid rgba(82,232,168,0.2)",
                borderRadius: "1.2rem",
                padding: "2.5rem 2rem",
                maxWidth: "420px",
                width: "100%",
                boxShadow: "0 0 0 1px rgba(82,232,168,0.08), 0 24px 80px rgba(0,0,0,0.5)",
                position: "relative",
                margin: "auto",
            }}>

                {/* Logo */}
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: "2px", marginBottom: "1.5rem" }}>
                    <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "1.1rem", color: "rgba(237,232,220,0.4)" }}>dinner</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1rem", color: "#52E8A8" }}>SORTED</span>
                </div>

                {/* Progress indicator */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "1.75rem" }}>
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div key={i} style={{
                            height: "3px",
                            flex: 1,
                            borderRadius: "2px",
                            background: i < step ? "#52E8A8" : "rgba(82,232,168,0.15)",
                            transition: "background 0.3s",
                        }} />
                    ))}
                </div>

                {/* ── STEP 1: The basics ──────────────────────────────── */}
                {step === 1 && (
                    <>
                        <h2 style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: "1.35rem", fontWeight: 600, color: "#EDE8DC", marginBottom: "0.4rem" }}>
                            Let's get started
                        </h2>
                        <p style={sublabelStyle}>A few quick questions so your plan feels like it was built for your kitchen.</p>

                        {/* Name */}
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>First name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleNext()}
                                placeholder="e.g. Lynsey"
                                autoFocus
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.5)")}
                                onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.15)")}
                            />
                        </div>

                        {/* People */}
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>How many people are you feeding?</label>
                            <select value={people} onChange={e => setPeople(Number(e.target.value))} style={selectStyle()}>
                                {[1,2,3,4,5,6,7,8].map(p => (
                                    <option key={p} value={p}>{p} {p === 1 ? "person" : "people"}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dietary */}
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>Any dietary requirements?</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {DIETARY_OPTIONS.map(opt => (
                                    <button key={opt} onClick={() => toggleArray(opt, dietary, setDietary)} style={pillButton(dietary.includes(opt))}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fussy eaters */}
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>Any fussy eaters?</label>
                            <p style={sublabelStyle}>Who and what they won't touch — we'll make sure at least 3 meals work for them.</p>
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
                    </>
                )}

                {/* ── STEP 2: Your week ──────────────────────────────── */}
                {step === 2 && (
                    <>
                        <h2 style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: "1.35rem", fontWeight: 600, color: "#EDE8DC", marginBottom: "0.4rem" }}>
                            Your week
                        </h2>
                        <p style={sublabelStyle}>Tell us which nights are tight so your plan works around real life, not an ideal version of it.</p>

                        {/* Busy nights */}
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>Which nights do you have under 30 minutes?</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {DAYS.map(day => (
                                    <button key={day} onClick={() => toggleArray(day, busyNights, setBusyNights)} style={pillButton(busyNights.includes(day))}>
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chaotic nights */}
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>Any truly chaotic nights — 10-15 mins max?</label>
                            <p style={sublabelStyle}>Football pickup, late finish, school run chaos. These nights need dinner already done.</p>
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
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>On a normal weeknight, how long do you have to cook?</label>
                            <select value={weeknightTime} onChange={e => setWeeknightTime(e.target.value)} style={selectStyle()}>
                                <option value="Under 20 min">Under 20 minutes</option>
                                <option value="20-30 min">20–30 minutes</option>
                                <option value="30-45 min">30–45 minutes</option>
                                <option value="Varies">Varies by night</option>
                            </select>
                        </div>
                    </>
                )}

                {/* ── STEP 3: Sunday ─────────────────────────────────── */}
                {step === 3 && (
                    <>
                        <h2 style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: "1.35rem", fontWeight: 600, color: "#EDE8DC", marginBottom: "0.4rem" }}>
                            Sunday prep
                        </h2>
                        <p style={sublabelStyle}>This is what makes the whole week work. Your plan gets built around what you can realistically do on Sunday.</p>

                        {/* Sunday window */}
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>How long do you have for Sunday prep?</label>
                            <select value={sundayWindow} onChange={e => setSundayWindow(e.target.value)} style={selectStyle()}>
                                <option value="60 min">About an hour</option>
                                <option value="90 min">90 minutes</option>
                                <option value="2 hours">2 hours</option>
                                <option value="3+ hours">3 hours or more</option>
                            </select>
                        </div>

                        {/* Freezer proteins */}
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={labelStyle}>What do you usually have in the freezer?</label>
                            <p style={sublabelStyle}>We'll build your plan around these first.</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {FREEZER_OPTIONS.map(opt => (
                                    <button key={opt} onClick={() => toggleArray(opt, freezerProteins, setFreezerProteins)} style={pillButton(freezerProteins.includes(opt))}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p style={{ fontSize: "0.78rem", color: "rgba(237,232,220,0.25)", fontFamily: "'Noto Serif', Georgia, serif", fontStyle: "italic", marginBottom: "1.25rem" }}>
                            You can update all of this any time in your profile.
                        </p>
                    </>
                )}

                {/* Error */}
                {error && (
                    <p style={{ color: "#FC7C78", fontSize: "0.82rem", marginBottom: "1rem", padding: "0.55rem 0.85rem", background: "rgba(252,124,120,0.08)", border: "1px solid rgba(252,124,120,0.2)", borderRadius: "0.5rem" }}>
                        {error}
                    </p>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    {step > 1 && (
                        <button onClick={handleBack} style={{
                            flex: 1,
                            background: "transparent",
                            border: "1px solid rgba(82,232,168,0.2)",
                            borderRadius: "0.75rem",
                            padding: "0.9rem",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                            color: "rgba(237,232,220,0.5)",
                            cursor: "pointer",
                        }}>
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={step < TOTAL_STEPS ? handleNext : handleSubmit}
                        disabled={loading}
                        style={{
                            flex: 2,
                            background: loading ? "rgba(82,232,168,0.3)" : "linear-gradient(135deg, #52E8A8, #34C484)",
                            color: "#0A1009",
                            border: "none",
                            borderRadius: "0.75rem",
                            padding: "0.9rem",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: loading ? "none" : "0 0 20px rgba(82,232,168,0.2)",
                            letterSpacing: "0.02em",
                            transition: "opacity 0.2s",
                        }}
                    >
                        {loading ? "Saving..." : step < TOTAL_STEPS ? "Next →" : "Let's get started →"}
                    </button>
                </div>
            </div>
        </div>
    )
}