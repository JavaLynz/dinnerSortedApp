import {useState} from "react";

interface OnboardingModalProps {
    onSave: (name: string, people: number, dietary: string[]) => Promise<void>
}

export default function OnboardingModal({ onSave }: OnboardingModalProps) {
    const [name, setName ] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError ] = useState("")
    const [people, setPeople] = useState(4)
    const [dietary, setDietary] = useState<string[]>([])

    const DIETARY_OPTIONS = [
        "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free", "Halal"
    ]

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("We need something to call you")
            return
        }
        setLoading(true)
        setError("")
        await onSave(name.trim(), people, dietary)
        setLoading(false)
    }

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 16, 9, 0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            zIndex: 50
        }}>
            <div style={{
                background: "#1E2B1F",
                border: "1px solid rgba(82,232,168,0.2)",
                borderRadius: "1.2rem",
                padding: "2.5rem 2rem",
                maxWidth: "420px",
                width: "100%",
                boxShadow: "0 0 0 1px rgba(82,232,168,0.08), 0 24px 80px rgba(0,0,0,0.5)",
                position: "relative"
            }}>
                <div style={{
                    position: "absolute",
                    top: "-60px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "300px",
                    height: "200px",
                    background: "radial-gradient(ellipse, rgba(82,232,168,0.1) 0%, transparent 70%)",
                    pointerEvents: "none"
                }}/>

                <div style={{
                    display: "inline-flex",
                    alignItems: "baseline",
                    gap: "2px",
                    marginBottom: "1.75rem"
                }}>
                    <span style={{
                        fontFamily: "'Noto Serif', Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 400,
                        fontSize: "1.1rem",
                        color: "rgba(237,232,220,0.4)"
                    }}> dinner</span>
                    <span style={{
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1rem",
                        color: "#52E8A8"
                    }}>sorted</span>
                </div>

                <h2 style={{
                    fontFamily: "'Noto Serif', Georgia, serif",
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    color: "#EDE8DC",
                    marginBottom: "0.5rem",
                    lineHeight: 1.25
                }}>
                    One quick thing -
                </h2>
                <p style={{
                    fontSize: "0.88rem",
                    color: "rgba(237,232,220,0.5)",
                    marginBottom: "1.75rem",
                    lineHeight: 1.65
                }}>
                    What should we call you? We'll use this to personalise your plan each week.
                </p>

                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        letterSpacing: "0.1rem",
                        textTransform: "uppercase",
                        color: "rgba(237,232,220,0.4)",
                        marginBottom: "0.45rem"
                    }}>First name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                        placeholder="e.g. Lynsey"
                        autoFocus
                        style={{
                            width: "100%",
                            background: "#0A1009",
                            border: "1px solid rgba(82,232,168,0.15)",
                            borderRadius: "0.6rem",
                            padding: "0.95rem",
                            color: "#EDE8DC",
                            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                            outline: "none",
                            boxSizing:"border-box",
                            transition: "border-color 0.2s"
                        }}
                        onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.15)")}
                    />
                </div>

                {/* People */}
                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        letterSpacing: "0.1rem",
                        textTransform: "uppercase",
                        color: "rgba(237,232,220,0.4)",
                        marginBottom: "0.45rem"
                    }}>How many people are you feeding?</label>
                    <select
                        value={people}
                        onChange={e => setPeople(Number(e.target.value))}
                        style={{
                            width: "100%",
                            background: "#0A1009",
                            border: "1px solid rgba(82,232,168,0.15)",
                            borderRadius: "0.6rem",
                            padding: "0.95rem",
                            color: "#EDE8DC",
                            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                            outline: "none",
                            boxSizing: "border-box"
                        }}
                    >
                        {[1,2,3,4,5,6,7,8].map(p => (
                            <option key={p} value={p}>{p} {p === 1 ? "person" : "people"}</option>
                        ))}
                    </select>
                </div>

                {/* Dietary */}
                <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        letterSpacing: "0.1rem",
                        textTransform: "uppercase",
                        color: "rgba(237,232,220,0.4)",
                        marginBottom: "0.45rem"
                    }}>Any dietary requirements?</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {DIETARY_OPTIONS.map(option => (
                            <button
                                key={option}
                                onClick={() => setDietary(prev =>
                                    prev.includes(option) ? prev.filter(d => d !== option) : [...prev, option]
                                )}
                                style={{
                                    padding: "0.35rem 0.85rem",
                                    borderRadius: "2rem",
                                    fontSize: "0.82rem",
                                    fontFamily: "inherit",
                                    cursor: "pointer",
                                    border: dietary.includes(option)
                                        ? "1px solid rgba(82,232,168,0.5)"
                                        : "1px solid rgba(237,232,220,0.12)",
                                    background: dietary.includes(option)
                                        ? "rgba(82,232,168,0.15)"
                                        : "transparent",
                                    color: dietary.includes(option)
                                        ? "#52E8A8"
                                        : "rgba(237,232,220,0.45)"
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <p style={{
                        color: "#FC7C78",
                        fontSize: "0.82rem",
                        marginBottom: "1rem",
                        padding: "0.55rem 0.85rem",
                        background: "rgba(252,124,120,0.08)",
                        border: "1px solid rgba(252,124,120,0.2)",
                        borderRadius: "0.5rem"
                    }}>{error}</p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        width: "100%",
                        background: loading
                            ? "rgba(82,232,168,0.3)"
                            : "linear-gradient(135deg, #52E8A8, #34C484)",
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
                        transition: "opacity 0.2s"

                    }}
                >
                    {loading ? "Saving..." : "Let's get started →"}
                </button>

                <p style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "rgba(237,232,220,0.2)",
                    marginTop: "1.1rem",
                    fontFamily: "'Noto Serif', Georgia, serif",
                    fontStyle: "italic"
                }}>
                    You can change this any time n your profile.
                </p>
            </div>
        </div>
    )
}