// src/components/Register.js
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import app from "../Firebase/firebaseconfig";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(""); // State to handle error messages
    const auth = getAuth(app);
    const navigate = useNavigate();

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
        return emailRegex.test(email);
    };

    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        setLoading(true);
        setError(""); // Clear any previous errors

        // Validate inputs
        if (!isValidEmail(email)) {
            setLoading(false);
            setError("Invalid email address. Please enter a valid email.");
            return;
        }

        if (password.length < 6) {
            setLoading(false);
            setError("Password must be at least 6 characters long.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User registered:", userCredential.user);
            alert("Registration successful!");
            navigate("/login"); // Redirect to login page after successful registration
        } catch (error) {
            console.error("Registration error:", error);
            if (error.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please use a different email or log in.");
            } else if (error.code === "auth/invalid-email") {
                setError("Invalid email address. Please check the format.");
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
            <h1>Register</h1>
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
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username" // Helps browsers auto-fill saved email addresses
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
                    autoComplete="new-password" // For registering a new password
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
                        padding: "10px 16px",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: "#007bff",
                        color: "white",
                        marginBottom: "10px",
                    }}
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
            <button
                onClick={() => navigate("/login")}
                style={{
                    display: "block",
                    marginTop: "10px",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: "#28a745",
                    color: "white",
                }}
            >
                Go to Login
            </button>
        </div>
    );
};

export default Register;