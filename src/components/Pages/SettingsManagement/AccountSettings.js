import React, { useState } from "react";
import "./accountSettings.css"; // ✅ Import Account-specific CSS

const AccountSettings = () => {
    const [twoFactor, setTwoFactor] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notificationPref, setNotificationPref] = useState("email");
    const [accountStatus, setAccountStatus] = useState("active");

    return (
        <div className="account-settings-container">
            <h2>Account Settings</h2>

            {/* Profile Information */}
            <label>Username</label>
            <input type="text" name="username" className="text-input" placeholder="Enter username" disabled />

            <label>Email</label>
            <input type="email" name="email" className="text-input" placeholder="Enter email" disabled />

            {/* Password Change */}
            <label>New Password</label>
            <input
                type="password"
                name="password"
                className="password-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <label>Confirm Password</label>
            <input
                type="password"
                name="confirmPassword"
                className="password-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!password} /* Disable if no new password entered */
            />

            {/* Security Options */}
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={twoFactor}
                    onChange={() => setTwoFactor(!twoFactor)}
                />
                Enable Two-Factor Authentication (2FA)
            </label>

            <label>Recent Login Activity</label>
            <textarea className="textarea-input" disabled>
📍 New York, USA - Yesterday
📍 London, UK - Last Week
📍 Tokyo, Japan - 2 Weeks Ago
            </textarea>

            {/* Notification Preferences */}
            <label>Notification Preferences</label>
            <select
                className="select-input"
                value={notificationPref}
                onChange={(e) => setNotificationPref(e.target.value)}
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
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value)}
            >
                <option value="active">✅ Active</option>
                <option value="deactivated">⚠️ Deactivate Account</option>
            </select>

            {/* Buttons */}
            <div className="account-settings-actions">
                <button className="save-button">Update Account Settings</button>
                <button className="reset-button">Reset to Defaults</button>
            </div>

            {/* Account Danger Zone */}
            <div className="account-danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <button className="delete-button">❌ Delete My Account</button>
            </div>
        </div>
    );
};

export default AccountSettings;
