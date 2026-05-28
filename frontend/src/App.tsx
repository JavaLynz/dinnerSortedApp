
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import IngredientInputPage from "./pages/IngredientInputPage.tsx";
import ResultsPage from "./pages/Results.tsx";
import {AuthProvider, useAuth} from "./context/AuthContext.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import React from "react";
import ProfilePage from "./pages/ProfilePage.tsx";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth()
    if (loading) return <div style={{ minHeight: "100vh", background: "#0F1612"}} />
    if(!session) return <Navigate to="/login" />
    return <>{children}</>
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={<LoginPage />}/>
                    <Route
                        path="/"
                        element={<ProtectedRoute><IngredientInputPage/></ProtectedRoute>}/>
                    <Route
                        path="/results"
                        element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
export default App