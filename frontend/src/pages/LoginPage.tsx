import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {supabase} from "../services/SupabaseClient.ts";

export default function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isRegistering, setIsRegistering] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = async () => {
        setError("")
        setMessage("")
        setLoading(true)

        try {
            if (isRegistering) {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                setMessage("Check your email to confirm your account.")
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password})
                if (error) throw error
                navigate("/")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0F1612",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
        }}>
            {/* Ambient glow */}
            <div style={{
                position: "fixed",
                top: "-150px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "500px",
                height: "400px",
                background: "radial-gradient(ellipse, rgba(82,232,168,0.07) 0%, transparent 70%)",
                pointerEvents: "none",
                zIndex: 0
            }} />

            <div style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                maxWidth: "400px"
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "baseline", gap: "2px", marginBottom: "0.75rem" }}>
                        <span style={{
                            fontFamily: "'Noto Serif', Georgia, serif",
                            fontStyle: "italic",
                            fontWeight: 400,
                            fontSize: "1.6rem",
                            color: "rgba(237,232,220,0.4)"
                        }}>dinner</span>
                        <span style={{
                            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                            fontWeight: 800,
                            fontSize: "1.25rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#52E8A8"
                        }}>sorted</span>
                    </div>
                    <p style={{
                        fontFamily: "'Noto Serif', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "0.88rem",
                        color: "rgba(237,232,220,0.4)",
                        lineHeight: 1.5
                    }}>
                        {isRegistering
                            ? "Your Sundays are about to get a lot easier."
                            : "Sorted Sunday. Sorted week."}
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: "#1E2B1F",
                    border: "1px solid rgba(82,232,168,0.15)",
                    borderRadius: "1.2rem",
                    padding: "2rem",
                    boxShadow: "0 0 0 1px rgba(82,232,168,0.06), 0 20px 60px rgba(0,0,0,0.35)"
                }}>
                    <h2 style={{
                        fontFamily: "'Noto Serif', Georgia, serif",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "#EDE8DC",
                        marginBottom: "0.3rem"
                    }}>
                        {isRegistering ? "Create your account" : "Welcome back"}
                    </h2>
                    <p style={{
                        fontSize: "0.82rem",
                        color: "rgba(237,232,220,0.4)",
                        marginBottom: "1.75rem"
                    }}>
                        {isRegistering
                            ? "Takes 30 seconds. Your week gets sorted from here."
                            : "Your meal plan is waiting."}
                    </p>

                    {/* Email */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{
                            display: "block",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(237,232,220,0.45)",
                            marginBottom: "0.45rem"
                        }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{
                                width: "100%",
                                background: "#0A1009",
                                border: "1px solid rgba(82,232,168,0.15)",
                                borderRadius: "0.6rem",
                                padding: "0.75rem 1rem",
                                fontSize: "0.9rem",
                                color: "#EDE8DC",
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                                transition: "border-color 0.2s"
                            }}
                            onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.5)")}
                            onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.15)")}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{
                            display: "block",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(237,232,220,0.45)",
                            marginBottom: "0.45rem"
                        }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            placeholder="••••••••"
                            style={{
                                width: "100%",
                                background: "#0A1009",
                                border: "1px solid rgba(82,232,168,0.15)",
                                borderRadius: "0.6rem",
                                padding: "0.75rem 1rem",
                                fontSize: "0.9rem",
                                color: "#EDE8DC",
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                                transition: "border-color 0.2s"
                            }}
                            onFocus={e => (e.target.style.borderColor = "rgba(82,232,168,0.5)")}
                            onBlur={e => (e.target.style.borderColor = "rgba(82,232,168,0.15)")}
                        />
                    </div>

                    {error && (
                        <p style={{
                            color: "#FC7C78",
                            fontSize: "0.82rem",
                            marginBottom: "1rem",
                            padding: "0.6rem 0.85rem",
                            background: "rgba(252,124,120,0.08)",
                            border: "1px solid rgba(252,124,120,0.2)",
                            borderRadius: "0.5rem"
                        }}>{error}</p>
                    )}
                    {message && (
                        <p style={{
                            color: "#52E8A8",
                            fontSize: "0.82rem",
                            marginBottom: "1rem",
                            padding: "0.6rem 0.85rem",
                            background: "rgba(82,232,168,0.08)",
                            border: "1px solid rgba(82,232,168,0.2)",
                            borderRadius: "0.5rem"
                        }}>{message}</p>
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
                            padding: "0.85rem",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            fontFamily: "inherit",
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: loading ? "none" : "0 0 20px rgba(82,232,168,0.2)",
                            transition: "opacity 0.2s",
                            marginBottom: "1rem",
                            letterSpacing: "0.02em"
                        }}
                    >
                        {loading
                            ? "Please wait…"
                            : isRegistering
                                ? "Create account →"
                                : "Sign in →"
                        }
                    </button>

                    <button
                        onClick={() => { setIsRegistering(!isRegistering); setError(""); setMessage("") }}
                        style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            fontSize: "0.82rem",
                            color: "rgba(237,232,220,0.35)",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            padding: "0.25rem",
                            transition: "color 0.2s"
                        }}
                        onMouseEnter={e => ((e.target as HTMLElement).style.color = "#52E8A8")}
                        onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(237,232,220,0.35)")}
                    >
                        {isRegistering
                            ? "Already have an account? Sign in"
                            : "Don't have an account? Register"}
                    </button>
                </div>

                {/* Footer note */}
                <p style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "rgba(200,185,122,0.3)",
                    marginTop: "1.5rem",
                    fontFamily: "'Noto Serif', Georgia, serif",
                    fontStyle: "italic"
                }}>
                    Sorted Sunday. Sorted week.
                </p>
            </div>
        </div>
    )
}