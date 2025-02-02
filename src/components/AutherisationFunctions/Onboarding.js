import React, { useEffect, useState } from "react";
import { getAuth, sendEmailVerification, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

const Onboarding = () => {
    const [checking, setChecking] = useState(true);
    const [resent, setResent] = useState(false);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        // ✅ Listen for user authentication state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                if (user.emailVerified) {
                    navigate("/admin-dashboard"); // ✅ Redirect if already verified
                }
            } else {
                navigate("/login"); // ✅ Redirect if no user is logged in
            }
            setChecking(false);
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    const checkVerification = async () => {
        if (!user) return;
        await user.reload();
        if (user.emailVerified) {
            navigate("/admin-dashboard"); // ✅ Redirect when verified
        }
    };

    useEffect(() => {
        const interval = setInterval(checkVerification, 5000); // ✅ Poll every 5 seconds
        return () => clearInterval(interval);
    }, [user]);

    const handleResendVerification = async () => {
        setResent(false);
        setError("");

        if (!user) {
            setError("No user session found. Please log in again.");
            return;
        }

        try {
            await sendEmailVerification(user);
            setResent(true);
        } catch (error) {
            setError("Error resending email. Try again.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="onboarding-container">
            <h1>Verify Your Email</h1>
            <p>We sent a verification email to <strong>{user?.email}</strong>. Please check your inbox.</p>
            <p>Once verified, this page will refresh automatically.</p>

            {checking ? <p>Checking verification status...</p> : <p>Still waiting? Try refreshing or resending the email.</p>}

            <button onClick={handleResendVerification} disabled={resent}>Resend Email</button>
            {resent && <p className="success-message">Verification email resent!</p>}
            {error && <p className="error-message">{error}</p>}

            <button onClick={handleLogout} className="logout-button">Back to Login</button>
        </div>
    );
};

export default Onboarding;