import { supabase } from "../services/SupabaseClient.ts"
import { useEffect, useState } from "react"
import type {OnboardingData} from "../components/OnboardingModal"

interface UseProfileReturn {
    firstName: string | null
    people: number
    dietary: string[]
    fussyEaterNotes: string
    busyNights: string[]
    chaoticNights: string
    sundayWindow: string
    weeknightTime: string
    freezerProteins: string[]
    loading: boolean
    needsOnboarding: boolean
    saveProfile: (data: OnboardingData) => Promise<void>
}

export function useProfile(): UseProfileReturn {
    const [firstName, setFirstName] = useState<string | null>(null)
    const [people, setPeople] = useState(4)
    const [dietary, setDietary] = useState<string[]>([])
    const [fussyEaterNotes, setFussyEaterNotes] = useState("")
    const [busyNights, setBusyNights] = useState<string[]>([])
    const [chaoticNights, setChaoticNights] = useState("")
    const [sundayWindow, setSundayWindow] = useState("90 min")
    const [weeknightTime, setWeeknightTime] = useState("20-30 min")
    const [freezerProteins, setFreezerProteins] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [needsOnboarding, setNeedsOnboarding] = useState(false)

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data, error } = await supabase
                .from("profiles")
                .select("first_name, people, dietary, fussy_eater_notes, busy_nights, chaotic_nights, sunday_window, weeknight_time, freezer_proteins")
                .eq("id", user.id)
                .single()

            if (error || !data) {
                setNeedsOnboarding(true)
            } else {
                setFirstName(data.first_name)
                setPeople(data.people ?? 4)
                setDietary(data.dietary ?? [])
                setFussyEaterNotes(data.fussy_eater_notes ?? "")
                setBusyNights(data.busy_nights ?? [])
                setChaoticNights(data.chaotic_nights ?? "")
                setSundayWindow(data.sunday_window ?? "90 min")
                setWeeknightTime(data.weeknight_time ?? "20-30 min")
                setFreezerProteins(data.freezer_proteins ?? [])
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

    const saveProfile = async (data: OnboardingData) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            first_name: data.name.trim(),
            people: data.people,
            dietary: data.dietary,
            fussy_eater_notes: data.fussyEaterNotes,
            busy_nights: data.busyNights,
            chaotic_nights: data.chaoticNights,
            sunday_window: data.sundayWindow,
            weeknight_time: data.weeknightTime,
            freezer_proteins: data.freezerProteins,
        })

        if (error) {
            console.error("Failed to save profile:", error)
            return
        }

        setFirstName(data.name.trim())
        setPeople(data.people)
        setDietary(data.dietary)
        setFussyEaterNotes(data.fussyEaterNotes)
        setBusyNights(data.busyNights)
        setChaoticNights(data.chaoticNights)
        setSundayWindow(data.sundayWindow)
        setWeeknightTime(data.weeknightTime)
        setFreezerProteins(data.freezerProteins)
        setNeedsOnboarding(false)
    }



    return {
        firstName,
        people,
        dietary,
        fussyEaterNotes,
        busyNights,
        chaoticNights,
        sundayWindow,
        weeknightTime,
        freezerProteins,
        loading,
        needsOnboarding,
        saveProfile
    }

}