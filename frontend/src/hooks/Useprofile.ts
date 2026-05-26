import {supabase} from "../services/SupabaseClient.ts";
import {useEffect, useState } from "react";

interface UseProfileReturn {
    firstName: string | null
    people: number
    dietary: string[]
    loading: boolean
    needsOnboarding: boolean
    saveProfile: (name: string, people: number, dietary: string[]) => Promise<void>
}

export function useProfile(): UseProfileReturn {
    const [firstName, setFirstName] = useState<string | null>(null)
    const [people, setPeople] = useState(4)
    const [dietary, setDietary] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [needsOnboarding, setNeedsOnboarding] = useState(false)

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data, error } = await supabase
                .from("profiles")
                .select("first_name, people, dietary")
                .eq("id", user.id)
                .single()

            if (error || !data) {
                setNeedsOnboarding(true)
            } else {
                setFirstName(data.first_name)
                setPeople(data.people ?? 4)
                setDietary(data.dietary ?? [])
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

    const saveProfile = async (name: string, people: number, dietary: string[]) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from("profiles").upsert({
            id: user.id,
            first_name: name.trim(),
            people,
            dietary
        })

        setFirstName(name.trim())
        setPeople(people)
        setDietary(dietary)
        setNeedsOnboarding(false)
    }

    return { firstName, people, dietary, loading, needsOnboarding, saveProfile }
}