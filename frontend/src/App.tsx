
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IngredientInputPage from "./pages/IngredientInputPage.tsx";
import ResultsPage from "./pages/Results.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<IngredientInputPage/>}/>
                <Route
                    path="/results"
                    element={<ResultsPage />} />
            </Routes>
        </BrowserRouter>
    )
}
export default App