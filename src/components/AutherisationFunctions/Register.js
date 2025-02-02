import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../Firebase/firebaseconfig";
import "./Register.css";
import logo from "../../assets/InvoxLogo.png";

// Validation helpers
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 8;
const validatePhone = (phone) => /^\d{10,15}$/.test(phone);

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        businessName: "",
        businessAddress: "",
        businessPhone: "",
    });
    const [selectedPlan, setSelectedPlan] = useState("free");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentStep, setCurrentStep] = useState(1);

    const auth = getAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = () => {
        const { name, email, password, phone } = formData;
        
        switch(currentStep) {
            case 1:
                if (!name.trim()) return "Name is required";
                if (!validateEmail(email)) return "Invalid email address";
                if (!validatePassword(password)) return "Password must be at least 8 characters";
                if (!validatePhone(phone)) return "Invalid phone number";
                return "";
            case 2:
                const { businessName, businessAddress, businessPhone } = formData;
                if (!businessName.trim()) return "Business name is required";
                if (!businessAddress.trim()) return "Business address is required";
                if (!validatePhone(businessPhone)) return "Invalid business phone";
                return "";
            default:
                return "";
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (currentStep < 2) {
            setCurrentStep(prev => prev + 1);
            setError("");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // 1. Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );
            const user = userCredential.user;

            // 2. Send Email Verification
            await sendEmailVerification(user);

            // 3. Firestore Batch Write
            const batch = writeBatch(db);
            
            // User Document
            const userRef = doc(db, "users", user.uid);
            batch.set(userRef, {
                personalInfo: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    profilePicture: "",
                },
                account: {
                    plan: selectedPlan,
                    role: "owner",
                    createdAt: new Date().toISOString(),
                    status: "pending_verification",
                    lastLogin: new Date().toISOString(),
                }
            });

            // Business Document (in 'business' subcollection)
            const businessRef = doc(db, "users", user.uid, "business", "details");
            batch.set(businessRef, {
                info: {
                    name: formData.businessName,
                    address: formData.businessAddress,
                    phone: formData.businessPhone,
                    email: formData.email,
                    industry: "",
                    taxId: "",
                },
                settings: {
                    currency: "GBP",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    locale: navigator.language,
                },
                subscription: {
                    plan: selectedPlan,
                    startedAt: new Date().toISOString(),
                    features: getPlanFeatures(selectedPlan),
                }
            });

            // Settings Document (in 'settings' subcollection)
            const settingsRef = doc(db, "users", user.uid, "settings", "configuration");
            batch.set(settingsRef, {
                general: {
                    theme: "light",
                    notifications: true,
                    dateFormat: "MM/dd/yyyy",
                },
                invoicing: {
                    nextInvoiceNumber: 1,
                    paymentTerms: "net30",
                    lateFees: false,
                }
            });

            // Commit all writes together
            await batch.commit();
            
            // 4. Navigate to onboarding
            navigate("/onboarding", { state: { email: formData.email } });

        } catch (error) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthError = (error) => {
        switch(error.code) {
            case "auth/email-already-in-use":
                setError("Email already registered. Use login instead.");
                break;
            case "auth/weak-password":
                setError("Password must be at least 8 characters");
                break;
            case "auth/invalid-email":
                setError("Invalid email address");
                break;
            default:
                setError("Registration failed. Please try again.");
        }
    };

    const getPlanFeatures = (plan) => {
        const plans = {
            free: { invoices: 5, clients: 10, storage: "500MB" },
            pro: { invoices: 50, clients: 100, storage: "5GB" },
            business: { invoices: "Unlimited", clients: "Unlimited", storage: "20GB" },
            enterprise: { invoices: "Unlimited", clients: "Unlimited", storage: "100GB" }
        };
        return plans[plan];
    };

    return (
        <div className="register-container">
            <div className="register-header">
                <img src={logo} alt="App Logo" className="register-logo" />
                <h1 className="register-title">
                    {currentStep === 1 ? "Create Account" : "Business Information"}
                </h1>
            </div>
            
            {error && <div className="register-error">{error}</div>}

            <form className="register-form" onSubmit={handleRegister}>
                {currentStep === 1 && (
                    <>
                        <input
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password (min 8 characters)"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <input
                            name="businessName"
                            placeholder="Business Name"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            name="businessAddress"
                            placeholder="Business Address"
                            value={formData.businessAddress}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            name="businessPhone"
                            placeholder="Business Phone"
                            value={formData.businessPhone}
                            onChange={handleInputChange}
                            required
                        />
                        
                        <div className="plan-selection">
                            <label>Choose Plan:</label>
                            <div className="plan-options">
                                {["free", "pro", "business", "enterprise"].map((plan) => (
                                    <label key={plan} className={`plan-card ${selectedPlan === plan ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="plan"
                                            value={plan}
                                            checked={selectedPlan === plan}
                                            onChange={(e) => setSelectedPlan(e.target.value)}
                                        />
                                        <div className="plan-content">
                                            <h3>{plan.charAt(0).toUpperCase() + plan.slice(1)}</h3>
                                            <ul>
                                                <li>{getPlanFeatures(plan).invoices} invoices/mo</li>
                                                <li>{getPlanFeatures(plan).clients} clients</li>
                                                <li>{getPlanFeatures(plan).storage} storage</li>
                                            </ul>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Processing..." : currentStep === 1 ? "Continue" : "Complete Registration"}
                </button>

                {currentStep === 2 && (
                    <button
                        type="button"
                        className="back-button"
                        onClick={() => setCurrentStep(1)}
                    >
                        Back
                    </button>
                )}
            </form>
        </div>
    );
};

export default Register;