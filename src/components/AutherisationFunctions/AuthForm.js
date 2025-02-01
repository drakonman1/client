// src/components/AuthForm.js
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../Firebase/firebaseconfig";

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get user role from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === "owner") {
                    navigate("/admin-dashboard");
                } else if (userData.role === "staff") {
                    navigate("/staff-dashboard");
                } else {
                    setError("Unauthorized role.");
                }
            } else {
                setError("User data not found.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h1>Login</h1>
            {error && <div style={{ backgroundColor: "#f8d7da", color: "#842029", padding: "10px", borderRadius: "4px", marginBottom: "10px" }}>{error}</div>}
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }} required />
                <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white" }} disabled={loading}>{loading ? "Logging in..." : "Log In"}</button>
            </form>
            <button onClick={() => navigate("/register")} style={{ display: "block", marginTop: "10px", padding: "10px", backgroundColor: "#007bff", color: "white" }}>Sign Up</button>
        </div>
    );
};

export default AuthForm;