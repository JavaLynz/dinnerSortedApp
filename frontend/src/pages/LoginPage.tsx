import {useState} from "react";
import {supabase} from "../services/SupabaseClient.ts";

type Stage = "input" | "sent"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [stage, setStage] = useState<Stage>("input")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSend = async () => {
        if (!email.trim()) {
            setError("Please enter your email address.")
            return
        }
        setError("")
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin
                }
            })
            if (error) throw error
                setStage("sent")
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
                        color: "rgba(237,232,220,0.4)"
                    }}>
                        Sorted Sunday. Sorted week.
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
                    {stage === "input" ? (
                        <>
                            <h2 style={{
                                fontFamily: "'Noto Serif', Georgia, serif",
                                fontSize: "1.2rem",
                                fontWeight: 600,
                                color: "#EDE8DC",
                                marginBottom: "0.3rem"
                            }}> Sign in
                            </h2>
                            <p style={{
                                fontSize: "0.82rem",
                                color: "rgba(237,232,220,0.4)",
                                marginBottom: "1.75rem"
                            }}>
                                Enter your email and we'll send you a link - no password needed
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

                            <button
                                onClick={handleSend}
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
                            ? "Sending…"
                            : "Send my link → "
                        }
                    </button>
                  </>
              ) : (

                  <div style={{ textAlign: "center", padding: "0.5rem 0"}}>
                      <div style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "rgba(82,232,168,0.1)",
                          border: "1px solid rgba(82,232,168,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 1.25rem",
                          fontSize: "1.4rem"
                  }}>✉️</div>
                  <h2 style={{
                      fontFamily: "'Noto Serif',Georgia, serif",
                      fontSize: "1.15rem",
                      fontWeight: "600",
                      color: "EDE8DC",
                      marginBottom: "0.5rem"
                  }}>Check your inbox</h2>
                  <p style={{
                      fontSize: "0.85rem",
                      color: "rgba(237,232,220,0.5)",
                      lineHeight: 1.65,
                      marginBottom: "1.5rem"
                  }}>
                      We've sent a sign-in link to<br />
                      <span style={{ color: "#52E8A8", fontWeight: 500}}>{email}</span>
                  </p>
                  <p style={{
                      fontSize: "0.78rem",
                      color: "rgba(237,232,220,0.25)",
                      fontStyle: "Italic",
                      lineHeight: 1.55
                  }}>
                      The link expires in 1 hour.<br />
                      Check your spam folder if it doesn't arrive.
                  </p>
                  <button
                      onClick={() => {setStage("input"); setError("")}}
                      style={{
                          background: "transparent",
                          border: "none",
                          color: "rgba(237,232,220,0.3)",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          marginTop: "1.25rem",
                          padding: "0.25rem"
                      }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = "#52E8A8")}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(237,232,220,0.3")}
                      >
                      Wrong email? Go back
                  </button>
              </div>
          )}
      </div>

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