import React, { useState, useEffect } from "react";
import "./Settings.css"; // Import styles
import { toast } from "react-toastify";

const Settings = () => {
    const [settings, setSettings] = useState({
        businessName: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        vatNumber: "",
        taxRate: "",
        paymentTerms: "Net 30",
        currency: "USD",
        bankDetails: "",
    });

    // Load settings from local storage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem("invoiceSettings");
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    // Save settings to local storage
    const handleSave = () => {
        localStorage.setItem("invoiceSettings", JSON.stringify(settings));
        toast.success("Settings saved successfully!");
    };

    // Reset settings to default
    const handleReset = () => {
        setSettings({
            businessName: "",
            address: "",
            phone: "",
            email: "",
            website: "",
            vatNumber: "",
            taxRate: "",
            paymentTerms: "Net 30",
            currency: "USD",
            bankDetails: "",
        });
        localStorage.removeItem("invoiceSettings");
        toast.info("Settings reset to default!");
    };

    return (
        <div className="settings-container">
            <h2>Business Settings</h2>
            <p>Manage your business information for invoices.</p>

            <div className="settings-section">
                <h3>Business Information</h3>
                <label>Business Name</label>
                <input type="text" name="businessName" value={settings.businessName} onChange={handleChange} />

                <label>Address</label>
                <textarea name="address" value={settings.address} onChange={handleChange} />

                <label>Phone Number</label>
                <input type="text" name="phone" value={settings.phone} onChange={handleChange} />

                <label>Email</label>
                <input type="email" name="email" value={settings.email} onChange={handleChange} />

                <label>Website</label>
                <input type="text" name="website" value={settings.website} onChange={handleChange} />
            </div>

            <div className="settings-section">
                <h3>Tax & Invoicing</h3>
                <label>VAT/GST Number</label>
                <input type="text" name="vatNumber" value={settings.vatNumber} onChange={handleChange} />

                <label>Default Tax Rate (%)</label>
                <input type="number" name="taxRate" value={settings.taxRate} onChange={handleChange} />

                <label>Default Payment Terms</label>
                <select name="paymentTerms" value={settings.paymentTerms} onChange={handleChange}>
                    <option value="Net 7">Net 7</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                </select>

                <label>Default Currency</label>
                <select name="currency" value={settings.currency} onChange={handleChange}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                </select>
            </div>

            <div className="settings-section">
                <h3>Bank Details</h3>
                <label>Bank Account Details</label>
                <textarea name="bankDetails" value={settings.bankDetails} onChange={handleChange} />
            </div>

            <div className="settings-actions">
                <button onClick={handleSave} className="save-button">Save Settings</button>
                <button onClick={handleReset} className="reset-button">Reset to Defaults</button>
            </div>
        </div>
    );
};

export default Settings;
