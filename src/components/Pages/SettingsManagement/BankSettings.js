import React from "react";
import SettingsCard from "./SettingsCard";

const BankSettings = ({ settings, handleChange }) => {
    return (
        <SettingsCard title="Bank Details">
            <label>Bank Account Details</label>
            <textarea name="bankDetails" value={settings.bankDetails} onChange={handleChange} />

            <label>Enable Payment Methods</label>
            <input type="checkbox" name="paypal" /> PayPal
            <input type="checkbox" name="stripe" /> Stripe
            <input type="checkbox" name="bankTransfer" /> Bank Transfer

            <button className="save-button">Update Payment Methods</button>
        </SettingsCard>
    );
};

export default BankSettings;