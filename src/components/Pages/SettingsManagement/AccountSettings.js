import React, { useState, useEffect } from "react";
import { fetchDocument, updateDocument } from "../../Firebase/firestore";
import { useAuth } from "../../AutherisationFunctions/Contexts/AuthContext";
import "./accountSettings.css";

const AccountSettings = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Account state
    const [accountData, setAccountData] = useState({
        personalInfo: {
            name: "",
            email: "",
            phone: "",
            profilePicture: ""
        },
        plan: "free",
        status: "active",
        notificationPref: "email",
        twoFactor: false
    });

    // Load account data
    useEffect(() => {
        const loadAccountData = async () => {
            try {
                const data = await fetchDocument("users", currentUser.uid);
                setAccountData(prev => ({
                    ...prev,
                    ...data,
                    personalInfo: data.personalInfo || prev.personalInfo
                }));
            } catch (error) {
                setError("Failed to load account data");
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) loadAccountData();
    }, [currentUser]);

    // Handle form updates
    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await updateDocument("users", currentUser.uid, {
                ...accountData,
                lastUpdated: new Date().toISOString()
            });
            setSuccess("Account settings updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            setError("Failed to update account settings");
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name in accountData.personalInfo) {
            setAccountData(prev => ({
                ...prev,
                personalInfo: {
                    ...prev.personalInfo,
                    [name]: value
                }
            }));
        } else {
            setAccountData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="account-settings-container">
            <h2>Account Settings</h2>

            {/* Error/Success Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Profile Information */}
            <label>Full Name</label>
            <input
                type="text"
                name="name"
                className="text-input"
                value={accountData.personalInfo.name}
                onChange={handleInputChange}
            />

            <label>Email</label>
            <input
                type="email"
                name="email"
                className="text-input"
                value={accountData.personalInfo.email}
                onChange={handleInputChange}
                disabled
            />

            <label>Phone Number</label>
            <input
                type="tel"
                name="phone"
                className="text-input"
                value={accountData.personalInfo.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
            />

            {/* Account Status */}
            <label>Account Plan</label>
            <div className="account-plan-display">
                <span className={`plan-badge ${accountData.plan}`}>
                    {accountData.plan.toUpperCase()}
                </span>
                <span>Created: {new Date(accountData.createdAt).toLocaleDateString()}</span>
                <span>Last Login: {new Date(accountData.lastLogin).toLocaleDateString()}</span>
            </div>

            {/* Security Options */}
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={accountData.twoFactor}
                    onChange={(e) => setAccountData(prev => ({
                        ...prev,
                        twoFactor: e.target.checked
                    }))}
                />
                Enable Two-Factor Authentication (2FA)
            </label>

            {/* Notification Preferences */}
            <label>Notification Preferences</label>
            <select
                className="select-input"
                name="notificationPref"
                value={accountData.notificationPref}
                onChange={handleInputChange}
            >
                <option value="email">📧 Email Notifications</option>
                <option value="sms">📱 SMS Notifications</option>
                <option value="push">🔔 Push Notifications</option>
                <option value="none">🚫 No Notifications</option>
            </select>

            {/* Account Management */}
            <label>Account Status</label>
            <select
                className="select-input"
                name="status"
                value={accountData.status}
                onChange={handleInputChange}
            >
                <option value="active">✅ Active</option>
                <option value="deactivated">⚠️ Deactivate Account</option>
            </select>

            {/* Save Button */}
            <div className="account-settings-actions">
                <button 
                    className="save-button"
                    onClick={handleUpdate}
                >
                    Update Account Settings
                </button>
            </div>

            {/* Account Danger Zone */}
            <div className="account-danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <button className="delete-button">
                    ❌ Delete My Account
                </button>
            </div>
        </div>
    );
};

export default AccountSettings;