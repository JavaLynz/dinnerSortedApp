import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import { useProfile } from "../hooks/Useprofile.ts";
import OnboardingModal from "../components/OnboardingModal.tsx";
import {supabase} from "../services/SupabaseClient.ts";


const PANTRY_STAPLES = [
    "Tinned tomatoes", "Chicken stock", "Vegetable stock", "Olive oil",
    "Soy sauce", "Pasta sauce", "Coconut milk", "Tomato purée",
    "Plain flour", "Cumin", "Paprika", "Mixed herbs", "Chilli flakes",
    "Curry powder", "Salt", "Black pepper", "Honey", "Worcestershire sauce"
]

const COMMON_INGREDIENTS = [
    // Proteins
    "Chicken", "Beef mince", "Salmon", "Eggs", "Bacon",
    "Sausages", "Pork chops", "Tuna (tinned)", "Prawns",

    // Carbs
    "Rice", "Pasta", "Potatoes", "Sweet potatoes", "Bread",
    "Noodles", "Couscous", "Oats",

    // Veg
    "Broccoli", "Spinach", "Carrots", "Onions", "Garlic",
    "Tomatoes", "Peppers", "Mushrooms", "Courgette", "Leek",
    "Spring onions", "Cucumber", "Celery", "Sweetcorn",
    "Frozen peas", "Frozen mixed veg",

    // Dairy & Fridge
    "Cheddar cheese", "Milk", "Butter", "Yogurt",
    "Cream cheese", "Sour cream", "Lemon", "Lime",

    // Tins & Jars
    "Kidney beans", "Chickpeas", "Lentils (red)"
]

const DIETARY_OPTIONS = [
    "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free", "Halal"
]

const GREETINGS = [
    "Right then —",
    "Let's do this —",
    "Sunday's doing the work —",
    "Week sorted in 60 seconds —",
]

export default function IngredientInputPage() {
    const navigate = useNavigate()
    const { firstName, people: savedPeople, dietary: savedDietary, fussyEaterNotes, busyNights, chaoticNights,
        sundayWindow, weeknightTime, freezerProteins, loading: profileLoading, needsOnboarding, saveProfile } = useProfile()
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([...PANTRY_STAPLES])
    const [quantities, setQuantities] = useState<Record<string, string>>({})
    const [customIngredient, setCustomIngredient] = useState("")
    const [dietary, setDietary] = useState<string[]>([])
    const [dietaryExpanded, setDietaryExpanded] = useState(true)
    const [days, setDays] = useState(5)
    const [people, setPeople] = useState(4)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    useEffect(() => {
        if (savedPeople) setPeople(savedPeople)
        if (savedDietary?.length) {
            setDietary(savedDietary)
            setDietaryExpanded(false)
        }
    }, [savedPeople, savedDietary])

    const toggleIngredient = (ingredient: string) => {
        setSelectedIngredients(prev => {
          if (prev.includes(ingredient)) {
              setQuantities(q => {
                  const updated = {...q}
                  delete updated[ingredient]
                  return updated
              })
              return prev.filter(i => i !== ingredient)
            }
          return [...prev, ingredient]
        })
    }

    const toggleDietary = (option: string) => {
        setDietary(prev =>
          prev.includes(option)
            ? prev.filter(d => d !== option)
            : [...prev, option]
        )
    }

    const addCustomIngredient = () => {
        const trimmed = customIngredient.trim()
        if (trimmed && !selectedIngredients.includes(trimmed)) {
            setSelectedIngredients(prev => [...prev, trimmed])
            setCustomIngredient("")
        }
    }

    const handleSubmit = async () => {
        if (selectedIngredients.length === 0) {
            setError("Please select at least one ingredient.")
            return
        }
        setError("")
        setLoading(true)

        const ingredientsWithQuantities = selectedIngredients.map(i =>
            quantities[i] ? `${quantities[i]} ${i}` : i
        )

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/recipes/generate`,
                {
                    ingredients: ingredientsWithQuantities,
                    dietary,
                    days,
                    people,
                    fussyEaterNotes,
                    busyNights,
                    chaoticNights,
                    sundayWindow,
                    weeknightTime,
                    freezerProteins,
                    exclude: [],
                    keep: [],
                    tonightsDinner: null
                }
            )
            navigate("/results", {
                state: {
                    mealPlan: response.data,
                    ingredients: ingredientsWithQuantities,
                    dietary,
                    people,
                    fussyEaterNotes,
                    busyNights,
                    chaoticNights,
                    sundayWindow,
                    weeknightTime,
                    freezerProteins
                }
            })
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (profileLoading) {
        return <div style={{ minHeight: "100vh", background: "#0F1612"}} />
    }

    return (
        <div style={{ background: "#0F1612", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            {needsOnboarding && <OnboardingModal onSave={saveProfile} />}

            {/* Nav */}
            <nav style={{
                background: "#0A1009",
                borderBottom: "1px solid rgba(200,185,122,0.15)",
                padding: "1.25rem 1.5rem",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "2px"
            }}>
                <a href="https://app.dinnersorted.app" style={{ textDecoration: "none" }}>
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
                </a>

                <button
                    onClick={handleLogout}
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(200,185,122,0.2)",
                        color: "rgba(237,232,220,0.5)",
                        padding: "0.4rem 1rem",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
                    }}
                >
                    Sign out
                </button>

            </nav>

            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

                {/* Welcome block */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <p style={{
                        fontFamily: "'Noto Serif', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "0.85rem",
                        color: "#52E8A8",
                        marginBottom: "0.4rem",
                        letterSpacing: "0.01em"
                    }}>{greeting}</p>
                    <h1 style={{
                        fontFamily: "'Noto Serif', Georgia, serif",
                        fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
                        fontWeight: 600,
                        color: "#EDE8DC",
                        lineHeight: 1.2,
                        letterSpacing: "-0.02em",
                        marginBottom: "0.6rem"
                    }}>
                        {firstName
                            ? <>What's in your kitchen, <span style={{ color: "#52E8A8" }}>{firstName}?</span></>
                            : <>What's in your kitchen this week?</>
                        }
                    </h1>
                    <p style={{
                        fontSize: "0.9rem",
                        color: "rgba(237,232,220,0.55)",
                        lineHeight: 1.65
                    }}>
                        Tick what you have — we'll build your week around it.
                    </p>
                </div>

                {/* Fridge ingredients */}
                <Section label="What's in your fridge & freezer">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {COMMON_INGREDIENTS.map(ingredient => (
                            <div key={ingredient} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <Chip
                                    label={ingredient}
                                    selected={selectedIngredients.includes(ingredient)}
                                    onClick={() => toggleIngredient(ingredient)}
                                    variant="teal"
                                />
                                {selectedIngredients.includes(ingredient) && (
                                    <input
                                        type="text"
                                        value={quantities[ingredient] || ""}
                                        onChange={e => setQuantities(prev => ({ ...prev, [ingredient]: e.target.value}))}
                                        placeholder="qty"
                                        style={{
                                            width: "58px",
                                            background: "#0A1009",
                                            border: "1px solid rgba(82,232,168,0.2)",
                                            borderRadius: "0.5rem",
                                            padding: "0.3rem 0.5rem",
                                            fontSize: "0.75rem",
                                            color: "#EDE8DC",
                                            fontFamily: "inherit",
                                            outline: "none"
                                        }}
                                        onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.55)")}
                                        onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.2)")}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Pantry staples */}
                <Section
                    label="Pantry staples"
                    sub="Pre-selected — tap to remove anything you're out of"
                >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {PANTRY_STAPLES.map(ingredient => (
                            <Chip
                                key={ingredient}
                                label={ingredient}
                                selected={selectedIngredients.includes(ingredient)}
                                onClick={() => toggleIngredient(ingredient)}
                                variant="gold"
                            />
                        ))}
                    </div>
                </Section>

                {/* Custom ingredient */}
                <Section label="Anything else?">
                    <div style={{ display: "flex", gap: "0.6rem" }}>
                        <input
                            type="text"
                            value={customIngredient}
                            onChange={e => setCustomIngredient(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addCustomIngredient()}
                            placeholder="e.g. halloumi, mango chutney…"
                            style={{
                                flex: 1,
                                background: "#0A1009",
                                border: "1px solid rgba(82,232,168,0.2)",
                                borderRadius: "0.6rem",
                                padding: "0.7rem 1rem",
                                fontSize: "0.88rem",
                                color: "#EDE8DC",
                                outline: "none",
                                fontFamily: "inherit"
                            }}
                            onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.55)")}
                            onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.2)")}
                        />
                        <button
                            onClick={addCustomIngredient}
                            style={{
                                background: "rgba(82,232,168,0.12)",
                                border: "1px solid rgba(82,232,168,0.35)",
                                borderRadius: "0.6rem",
                                color: "#52E8A8",
                                padding: "0.7rem 1.1rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                whiteSpace: "nowrap"
                            }}
                        >
                            Add
                        </button>
                    </div>
                    {selectedIngredients.filter(i => !COMMON_INGREDIENTS.includes(i) && !PANTRY_STAPLES.includes(i)).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                            {selectedIngredients
                                .filter(i => !COMMON_INGREDIENTS.includes(i) && !PANTRY_STAPLES.includes(i))
                                .map(i => (
                                    <span
                                        key={i}
                                        onClick={() => toggleIngredient(i)}
                                        style={{
                                            padding: "0.35rem 0.85rem",
                                            borderRadius: "2rem",
                                            fontSize: "0.82rem",
                                            background: "rgba(82,232,168,0.1)",
                                            color: "#52E8A8",
                                            border: "1px solid rgba(82,232,168,0.3)",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {i} ✕
                                    </span>
                                ))}
                        </div>
                    )}
                </Section>

                {/* Dietary */}
                <Section label="Dietary requirements">
                    {dietary.length > 0 && !dietaryExpanded ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p style={{
                                fontSize: "0.85rem",
                                color: "#52E8A8"
                            }}>
                                {dietary.join(", ")}
                            </p>
                            <button
                                onClick={() => setDietaryExpanded(true)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "rgba(237,232,220,0.4)",
                                    fontSize: "0.78rem",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    textDecoration: "underline"
                                }}
                            >
                                Edit
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {DIETARY_OPTIONS.map(option => (
                                    <Chip
                                        key={option}
                                        label={option}
                                        selected={dietary.includes(option)}
                                        onClick={() => toggleDietary(option)}
                                        variant="teal"
                                    />
                                ))}
                            </div>
                            {dietary.length > 0 && (
                                <button
                                    onClick={() => setDietaryExpanded(false)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "rgba(237,232,220,0.4)",
                                        fontSize: "0.78rem",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        textDecoration: "underline",
                                        marginTop: "0.5rem",
                                        padding: 0
                                    }}
                                >
                                    Done
                                </button>
                            )}
                        </>
                    )}
                </Section>

                {/* Days & people */}
                <Section label="Who are we feeding?">
                    <div style={{ display: "flex", gap: "1.5rem" }}>
                        <SelectField
                            label="Days"
                            value={days}
                            onChange={setDays}
                            options={[1,2,3,4,5,6,7].map(d => ({ value: d, label: `${d} ${d === 1 ? "day" : "days"}` }))}
                        />
                        <SelectField
                            label="People"
                            value={people}
                            onChange={setPeople}
                            options={[1,2,3,4,5,6,7,8].map(p => ({ value: p, label: `${p} ${p === 1 ? "person" : "people"}` }))}
                        />
                    </div>
                </Section>

                {error && (
                    <p style={{ color: "#FC7C78", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
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
                        borderRadius: "0.85rem",
                        padding: "1rem",
                        fontSize: "1rem",
                        fontWeight: 700,
                        fontFamily: "inherit",
                        cursor: loading ? "not-allowed" : "pointer",
                        letterSpacing: "0.02em",
                        boxShadow: loading ? "none" : "0 0 24px rgba(82,232,168,0.25)",
                        transition: "opacity 0.2s, box-shadow 0.2s"
                    }}
                >
                    {loading ? "Sorting your week…" : "Sort my week →"}
                </button>
            </div>
        </div>
    )
}

// ── Sub-components ──────────────────────────────────────────────

function Section({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "2rem" }}>
            <h2 style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#C8B97A",
                marginBottom: sub ? "0.25rem" : "0.75rem"
            }}>{label}</h2>
            {sub && (
                <p style={{
                    fontSize: "0.78rem",
                    color: "rgba(237,232,220,0.35)",
                    fontStyle: "italic",
                    marginBottom: "0.75rem"
                }}>{sub}</p>
            )}
            {children}
        </div>
    )
}

function Chip({ label, selected, onClick, variant }: {
    label: string
    selected: boolean
    onClick: () => void
    variant: "teal" | "gold"
}) {
    const activeStyles = variant === "teal"
        ? { background: "rgba(82,232,168,0.15)", color: "#52E8A8", border: "1px solid rgba(82,232,168,0.5)" }
        : { background: "rgba(200,185,122,0.15)", color: "#C8B97A", border: "1px solid rgba(200,185,122,0.45)" }

    const inactiveStyles = variant === "teal"
        ? { background: "transparent", color: "rgba(237,232,220,0.45)", border: "1px solid rgba(237,232,220,0.12)" }
        : { background: "transparent", color: "rgba(237,232,220,0.3)", border: "1px solid rgba(237,232,220,0.08)", textDecoration: "line-through" as const }

    return (
        <button
            onClick={onClick}
            style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "2rem",
                fontSize: "0.82rem",
                fontFamily: "inherit",
                fontWeight: selected ? 500 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
                ...(selected ? activeStyles : inactiveStyles)
            }}
        >
            {label}
        </button>
    )
}

function SelectField({ label, value, onChange, options }: {
    label: string
    value: number
    onChange: (v: number) => void
    options: { value: number; label: string }[]
}) {
    return (
        <div>
            <label style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(237,232,220,0.45)",
                marginBottom: "0.4rem"
            }}>{label}</label>
            <select
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{
                    background: "#0A1009",
                    border: "1px solid rgba(82,232,168,0.2)",
                    borderRadius: "0.6rem",
                    padding: "0.6rem 2rem 0.6rem 0.9rem",
                    fontSize: "0.88rem",
                    color: "#EDE8DC",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    outline: "none",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2352E8A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.7rem center"
                }}
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    )
}
