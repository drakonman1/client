// src/components/AuthForm.js
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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

            // Check if email is verified
            if (!user.emailVerified) {
                setError("Please verify your email before logging in.");
                await auth.signOut();
                return;
            }

            // Get user document
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                setError("User data not found.");
                return;
            }

            const userData = userDoc.data();

            // Update verification status if needed
            if (userData.account.status === "pending_verification") {
                await updateDoc(userDocRef, {
                    "account.status": "active",
                    "account.lastLogin": new Date().toISOString()
                });
            }

            // Check user role
            switch(userData.account.role) { // Fixed path to role
                case "owner":
                    navigate("/admin-dashboard");
                    break;
                case "staff":
                    navigate("/staff-dashboard");
                    break;
                default:
                    setError("Unauthorized role.");
                    await auth.signOut();
            }
        } catch (error) {
            console.error("Login error:", error);
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (error) => {
        switch(error.code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
                setError("Invalid email or password");
                break;
            case "auth/too-many-requests":
                setError("Too many attempts. Try again later");
                break;
            default:
                setError("Login failed. Please try again.");
        }
    };

    return (
        <div className="auth-container">
            <h1>Login</h1>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Log In"}
                </button>
            </form>
            <button onClick={() => navigate("/register")}>
                Sign Up
            </button>
        </div>
    );
};

export default AuthForm;