import type {Session} from "@supabase/supabase-js";
import {createContext, useContext, useEffect, useState} from "react";
import {supabase} from "../services/SupabaseClient.ts";

interface AuthContextType {
    session: Session | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({session: null, loading: true})

export function AuthProvider({ children }: { children: React.ReactNode}) {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Dev bypass — skip auth entirely
        if (import.meta.env.VITE_DEV_SKIP_AUTH === 'true') {
            setSession({ user: { id: 'dev-user', email: 'dev@local.com' } } as any)
            setLoading(false)
            return
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ session, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)