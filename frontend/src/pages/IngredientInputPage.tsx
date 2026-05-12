import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";


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
    "Tomatoes", "Peppers", "Mushrooms", "Courgette", "Leeks",
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

export default function IngredientInputPage() {
    const navigate = useNavigate()
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([...PANTRY_STAPLES])
    const [customIngredient, setCustomIngredient] = useState("")
    const [dietary, setDietary] = useState<string[]>([])
    const [days, setDays] = useState(5)
    const [people, setPeople] = useState(4)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const toggleIngredient = (ingredient: string) => {
        setSelectedIngredients(prev =>
          prev.includes(ingredient)
            ? prev.filter(d => d !== ingredient)
            : [...prev, ingredient]
        )
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
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/recipes/generate`,
                { ingredients: selectedIngredients, dietary, days, people }
            )
            navigate("/results", { state: {mealPlan: response.data } })
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-green-700 mb-2">
            Dinner Sorted
            </h1>
            <p className="text-gray-500 mb-6">
                Tell us what you have and we'll sort the week
            </p>

            {/* Main ingredients */}
            <section className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">What's in your fridge?</h2>
                <div className="flex flex-wrap gap-2">
                    {COMMON_INGREDIENTS.map(ingredient => (
                        <button
                            key={ingredient}
                            onClick={() => toggleIngredient(ingredient)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                selectedIngredients.includes(ingredient)
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
                            }`}
                        >
                            {ingredient}
                        </button>
                    ))}
                </div>
            </section>

            {/* Pantry staples — pre-checked */}
            <section className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Pantry staples</h2>
                <p className="text-xs text-gray-400 mb-3">Pre-selected — tap to remove anything you're out of</p>
                <div className="flex flex-wrap gap-2">
                    {PANTRY_STAPLES.map(ingredient => (
                        <button
                            key={ingredient}
                            onClick={() => toggleIngredient(ingredient)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                selectedIngredients.includes(ingredient)
                                    ? "bg-amber-500 text-white border-amber-500"
                                    : "bg-white text-gray-400 border-gray-200 line-through hover:border-amber-300"
                            }`}
                        >
                            {ingredient}
                        </button>
                    ))}
                </div>
            </section>

            {/* Custom ingredient input */ }
            <section className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Anything else?
                </h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customIngredient}
                        onChange={e => setCustomIngredient(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addCustomIngredient()}
                        placeholder="e.g. coconut milk"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500"
                    />
                    <button
                        onClick={addCustomIngredient}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                        Add
                    </button>
                </div>
                { /* Show custom additions */}
                {selectedIngredients.filter(i => !COMMON_INGREDIENTS.includes(i) && !PANTRY_STAPLES.includes(i)).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedIngredients
                            .filter(i => !COMMON_INGREDIENTS.includes(i) && !PANTRY_STAPLES.includes(i))
                            .map(i => (
                                <span
                                  key={i}
                                  className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800 border border-green-300 cursor-pointer"
                                  onClick={() => toggleIngredient(i)}
                                >
                                    {i} ✕
                                </span>
                            ))}
                    </div>
                )}
            </section>

            { /* Dietary preferences */}
            <section className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Dietary requirements
                </h2>
                <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map(option => (
                        <button
                          key={option}
                          onClick={() => toggleDietary(option)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              dietary.includes(option)
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-green-400"  
                          }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </section>

            {/* Days and people */}
            <section className="mb-8 flex gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Days
                    </label>
                    <select
                        value={days}
                        onChange={e => setDays(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    >
                        {[1,2,3,4,5,6,7].map(d => (
                            <option
                                key={d}
                                value={d}>{d} {d === 1 ? "day" : "days"}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        People
                    </label>
                    <select
                        value={people}
                        onChange={e => setPeople(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    >
                        {[1,2,3,4,5,6,7,8].map(p => (
                            <option
                              key={p}
                            value={p}>{p} {p === 1 ? "person" : "people"}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p> }

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 disabled:opacity-50 siabled:cursor-not-allowed transition-colors"
            >
                {loading ? "Sorting your week..." : "Sort my week →"}
            </button>
        </div>
    )
}
