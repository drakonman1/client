// src/components/AuthForm.js
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import app from "../Firebase/firebaseconfig"; // Ensure this is correct

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const auth = getAuth(app);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload on form submission
        setLoading(true);
        setError(""); // Clear previous errors
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in:", userCredential.user);
            alert("Login successful!");
            navigate("/dashboard"); // Redirect after successful login
        } catch (error) {
            console.error("Login error:", error);
            if (error.code === "auth/user-not-found") {
                setError("No user found with this email. Please check or register.");
            } else if (error.code === "auth/wrong-password") {
                setError("Incorrect password. Please try again.");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                padding: "20px",
                maxWidth: "400px",
                margin: "20px auto",
                border: "1px solid #ccc",
                borderRadius: "8px",
            }}
        >
            <h1>Login</h1>
            {error && (
                <div
                    style={{
                        backgroundColor: "#f8d7da",
                        color: "#842029",
                        padding: "10px",
                        borderRadius: "4px",
                        marginBottom: "10px",
                    }}
                >
                    {error}
                </div>
            )}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    style={{
                        display: "block",
                        marginBottom: "10px",
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{
                        display: "block",
                        marginBottom: "10px",
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        marginRight: "10px",
                        padding: "10px 16px",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: "#28a745",
                        color: "white",
                    }}
                    disabled={loading}
                >
                    {loading ? "Logging In..." : "Log In"}
                </button>
            </form>
            <button
                onClick={() => navigate("/register")}
                style={{
                    marginTop: "10px",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: "#007bff",
                    color: "white",
                }}
            >
                Sign Up
            </button>
        </div>
    );
};

export default AuthForm;