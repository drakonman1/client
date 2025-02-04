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
    
            // ✅ Force refresh to get the latest emailVerified status
            await user.reload();
            const refreshedUser = getAuth().currentUser;
    
            console.log("🔥 User emailVerified:", refreshedUser.emailVerified);
    
            // ✅ Check if email is verified
            if (!refreshedUser.emailVerified) {
                setError("Please verify your email before logging in.");
                await auth.signOut();
                return;
            }
    
            // ✅ Fetch user document from `users/{uid}`
            const userDocRef = doc(db, `users/${user.uid}`);
            const userDoc = await getDoc(userDocRef);
    
            if (!userDoc.exists()) {
                setError("User data not found.");
                console.error("Firestore error: No user document found for UID:", user.uid);
                return;
            }
    
            const userData = userDoc.data();
            console.log("🔥 Firestore User Data:", userData);
    
            // ✅ Ensure role and status exist
            if (!userData.account || !userData.account.role) {
                setError("User role is missing in Firestore.");
                console.error("Firestore error: User role missing in document:", userData);
                return;
            }
    
            let userRole = userData.account.role.trim().toLowerCase();
            let accountStatus = userData.account.status;
    
            console.log("🔥 Account Status Before Update:", accountStatus);
    
            // ✅ If account is still in pending_verification, update it to active
            if (accountStatus === "pending_verification") {
                console.log("🟡 Updating account status to 'active'...");
                await updateDoc(userDocRef, {
                    "account.status": "active",
                    "account.lastLogin": new Date().toISOString()
                });
                accountStatus = "active"; // ✅ Update local status to avoid re-fetch
            }
    
            // ✅ Store userRole in localStorage before navigating
            localStorage.setItem("userRole", userRole);
    
            // ✅ Debugging role comparison before navigation
            console.log("🛠 Checking role match: ", userRole === "owner", userRole === "staff");
    
            switch(userRole) {
                case "owner":
                    console.log("✅ Navigating to Admin Dashboard...");
                    navigate("/admin-dashboard");
                    break;
                case "staff":
                    console.log("✅ Navigating to Staff Dashboard...");
                    navigate("/staff-dashboard");
                    break;
                default:
                    setError("Unauthorized role.");
                    console.warn("🚨 Unauthorized login attempt for role:", userRole);
                    await auth.signOut();
            }
        } catch (error) {
            console.error("🚨 Login error:", error);
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