import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./components/Firebase/firebaseconfig";
import LandingPage from "./components/Pages/LandingPage";
import AuthForm from "./components/AutherisationFunctions/AuthForm";
import Register from "./components/AutherisationFunctions/Register";
import Onboarding from "./components/AutherisationFunctions/Onboarding";
import Dashboard from "./components/Pages/dashboard";
import InvoiceHub from "./components/Pages/InvoiceManagement/Invoicehub";
import ClientManagement from "./components/Pages/ClientManagement/ClientManagement";
import Settings from "./components/Pages/SettingsManagement/Settings";
import ProtectedRoute from "./components/AutherisationFunctions/Contexts/ProtectedRoute"; // Import ProtectedRoute

const App = () => {
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "guest");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    console.log("🔍 Fetching user role for:", user.uid);

                    // 🔹 Check Firestore for user role
                    const userRef = doc(db, `users/${user.uid}`);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const role = userSnap.data().account?.role?.trim().toLowerCase();
                        console.log("🔥 Retrieved User Role:", role);

                        if (role) {
                            setUserRole(role);
                            localStorage.setItem("userRole", role); // ✅ Store in localStorage
                        } else {
                            console.warn("⚠️ No role found. Defaulting to guest.");
                            setUserRole("guest");
                            localStorage.setItem("userRole", "guest");
                        }
                    } else {
                        console.warn("⚠️ No user document found. Defaulting to guest.");
                        setUserRole("guest");
                        localStorage.setItem("userRole", "guest");
                    }
                } catch (error) {
                    console.error("🚨 Error fetching user role:", error);
                    setUserRole("guest");
                    localStorage.setItem("userRole", "guest");
                }
            } else {
                console.log("🔴 No user logged in. Setting role to guest.");
                setUserRole("guest");
                localStorage.setItem("userRole", "guest");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <h1>Loading...</h1>;

    console.log("🔍 Final App.js User Role:", userRole);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthForm />} />
                <Route path="/register" element={<Register />} />
                <Route path="/onboarding" element={<Onboarding />} />

                {/* 🔒 Protected Routes (Only for Authorized Users) */}
                <Route
                    path="/admin-dashboard"
                    element={<ProtectedRoute element={<Dashboard />} allowedRoles={["owner", "admin"]} userRole={userRole} />}
                />
                <Route
                    path="/invoices"
                    element={<ProtectedRoute element={<InvoiceHub />} allowedRoles={["owner", "admin"]} userRole={userRole} />}
                />
                <Route
                    path="/clients"
                    element={<ProtectedRoute element={<ClientManagement />} allowedRoles={["owner", "admin"]} userRole={userRole} />}
                />
                <Route
                    path="/settings"
                    element={<ProtectedRoute element={<Settings />} allowedRoles={["owner", "admin"]} userRole={userRole} />}
                />

                {/* Open Pages */}
                <Route path="/pricing" element={<h1>Pricing Page (Coming Soon)</h1>} />
                <Route path="/about" element={<h1>About Us Page (Coming Soon)</h1>} />
                <Route path="/privacy-policy" element={<h1>Privacy Policy Page (Coming Soon)</h1>} />

                {/* Unauthorized Page */}
                <Route path="/unauthorized" element={<h1>🚫 Unauthorized Access</h1>} />

                {/* 404 Fallback */}
                <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
        </Router>
    );
};

export default App;
