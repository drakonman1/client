// src/components/Register.js
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../Firebase/firebaseconfig";
import "./Register.css";
import logo from "../../assets/InvoxLogo.png";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [selectedPlan, setSelectedPlan] = useState("free");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const auth = getAuth();
    const navigate = useNavigate();

    const subscriptionPlans = {
        free: { staffLimit: 0, features: ["basic invoicing"], canInviteStaff: false },
        pro: { staffLimit: 5, features: ["unlimited invoices", "client portal"], canInviteStaff: false },
        business: { staffLimit: 20, features: ["payroll", "staff management"], canInviteStaff: true },
        enterprise: { staffLimit: 100, features: ["white-label", "API access"], canInviteStaff: true }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!businessName || !businessAddress || !businessPhone ) {
            setLoading(false);
            setError("Please fill in all business details.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userId = user.uid;

            if (!subscriptionPlans[selectedPlan]) {
                throw new Error("Invalid plan selected.");
            }
            const planData = subscriptionPlans[selectedPlan];

            const userRef = doc(db, "users", userId);
            await setDoc(userRef, {
                email,
                role: "owner",
                plan: selectedPlan,
                createdAt: new Date().toISOString()
            });

            const businessRef = doc(db, `users/${userId}/business`, "businessInfo");
            await setDoc(businessRef, {
                businessName,
                businessAddress,
                businessPhone,
                createdAt: new Date().toISOString(),
                plan: selectedPlan,
                staffLimit: planData.staffLimit,
                canInviteStaff: planData.canInviteStaff,
                currency: "USD",
                taxRate: 0.15,
                timezone: "EST",
                country: "USA"
            });

            await setDoc(doc(db, `users/${userId}/business/settings`, "invoicing"), {
                invoicePrefix: "INV",
                autoReminders: true,
                defaultDueDays: 14,
                businessName,
                businessAddress,
                businessPhone,
            });

            alert("Business registered successfully! You are ready to start invoicing.");
            navigate("/dashboard");
        } catch (error) {
            console.error("Registration error:", error);
            setError(error.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-header">
                <img src={logo} alt="App Logo" className="register-logo" />
                <h1 className="register-title">Create Your Business Account</h1>
            </div>
            {error && <div className="register-error">{error}</div>}
            <form className="register-form" onSubmit={handleRegister}>
                <input className="register-input" type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                <input className="register-input" type="text" placeholder="Business Address" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} required />
                <input className="register-input" type="text" placeholder="Business Phone" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} required />
                <input className="register-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="register-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <label>Select Plan:</label>
                <select className="register-select" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                    <option value="free">Free</option>
                    <option value="pro">Pro ($15/mo)</option>
                    <option value="business">Business ($50/mo)</option>
                    <option value="enterprise">Enterprise ($200/mo)</option>
                </select>

                <button className="register-button" type="submit" disabled={loading}>{loading ? "Registering..." : "Register Business"}</button>
            </form>
        </div>
    );
};

export default Register;
