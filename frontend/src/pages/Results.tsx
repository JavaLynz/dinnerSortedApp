
import {useState} from "react"
import { useLocation, useNavigate } from "react-router-dom"

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

interface MealPlan {
    meals: Meal[]
    shoppingList: string[]
    sundaySession: string
}

export default function ResultsPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const {mealPlan} = location.state as { mealPlan: MealPlan }
    const [copied, setCopied] = useState(false);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.documentElement.innerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Sunday Session — Dinner Sorted</title>
    <style>
        @page { size: A4; margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; font-size: 11px; line-height: 1.6; color: #1a1a1a; }
        h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; color: #0F1612; }
        .subtitle { font-size: 10px; color: #666; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #52E8A8; }
        pre { white-space: pre-wrap; font-family: 'Segoe UI', sans-serif; font-size: 11px; line-height: 1.7; }
    </style>
</head>
<body>
    <h1>☀️ Sunday Session</h1>
    <p class="subtitle">Dinner Sorted — dinnersorted.app</p>
    <pre>${mealPlan.sundaySession}</pre>
</body>
</html>`;
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };


    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold text-green-700 mb-1">Dinner Sorted</h1>
                <p className="text-gray-500">Here's your week sorted</p>
            </div>
            <button
                onClick={() => navigate("/")}
                className="text-sm text-green-600 hover:text-green-800 font-medium border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
            >
                ← Change ingredients
            </button>


            {mealPlan.meals.map(meal => (
                <div key={meal.day} className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{meal.name}
                        </h2>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {meal.label}
                        </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">
                        {meal.effortLevel}
                    </p>

                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                        Ingredients
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 mb-3">
                        {meal.ingredients.map(i =>
                            <li
                                key={i}>
                                {i}
                            </li>
                        )}
                    </ul>

                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                        Instructions
                    </h3>
                    <div className="text-sm text-gray-700 mb-3 space-y-1">
                        {meal.instructions
                            .split(". ")
                            .filter(step => step.trim() !== "")
                            .map((step, index) => (
                                <p key={index}>{step.trim()}{step.endsWith(".") ? "" : "."}</p>
                            ))}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-700 mb-1">
                            4:45pm
                        </p>
                        <p className="text-sm text-amber-800">
                            {meal.dinnertimeInstruction}
                        </p>
                    </div>
                </div>
            ))}

            {/* Shopping list */}
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800">🛒 Shopping List</h2>
                    <button
                        onClick={() => {
                            const text = mealPlan.shoppingList.join('\n');
                            navigator.clipboard.writeText(text).then(() => {
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            });
                        }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                        {copied ? '✓ Copied' : '📋 Copy list'}
                    </button>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700">
                    {mealPlan.shoppingList.map(item => <li key={item}>{item}</li>)}
                </ul>
            </div>

            {/* Sunday session */}
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800">☀️ Sunday Session</h2>
                    <button onClick={handlePrint}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                        🖨️ Print
                    </button>
                </div>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                    {mealPlan.sundaySession
                        .split(/\d+\.\s/)
                        .filter(step => step.trim() !== "")
                        .map((step, index) => (
                            <li key={index}>{step.trim()}</li>
                        ))}
                </ol>
            </div>
        </div>
    )
}