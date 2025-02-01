import React from "react";
import "./taxSettings.css"; // ✅ Import tax-specific styles

const TaxSettings = ({ settings, handleChange }) => {
    return (
        <div className="tax-settings-container">
            <h2>Tax & Compliance Settings</h2>
            <p>Manage your business tax rates and invoicing compliance.</p>

            {/* 📌 VAT/GST Information */}
            <label title="Your VAT or GST number required for tax reporting.">
                VAT/GST Number
                <span className="tooltip-icon"> ℹ</span>
            </label>
            <input
                type="text"
                name="vatNumber"
                value={settings.vatNumber}
                onChange={handleChange}
                className="text-input"
                placeholder="Enter VAT or GST number"
            />

            {/* 📌 Default Tax Rate */}
            <label title="This tax rate will be applied to taxable invoices by default.">
                Default Tax Rate (%) 
                <span className="tooltip-icon"> ℹ</span>
            </label>
            <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                className="text-input"
                placeholder="Enter tax rate (e.g., 10%)"
            />

            {/* 📌 Tax Categories */}
            <label title="Select which tax category applies to your invoices.">
                Tax Category 
                <span className="tooltip-icon"> ℹ</span>
            </label>
            <select name="taxCategory" className="select-input" onChange={handleChange}>
                <option value="vat">VAT (Value-Added Tax)</option>
                <option value="gst">GST (Goods & Services Tax)</option>
                <option value="salesTax">Sales Tax</option>
                <option value="zeroRated">Zero-Rated Tax</option>
                <option value="manual">Manually Set Per Invoice</option>
            </select>

            {/* 📌 Default Currency */}
            <label title="Select the default currency for invoicing.">
                Default Currency
                <span className="tooltip-icon"> ℹ</span>
            </label>
            <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="select-input"
            >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
            </select>

            {/* 📌 Save & Reset Buttons */}
            <div className="tax-settings-actions">
                <button className="save-button">Save Tax Settings</button>
                <button className="reset-button">Reset to Defaults</button>
            </div>
        </div>
    );
};

export default TaxSettings;
