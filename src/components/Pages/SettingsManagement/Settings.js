import React, { useState } from "react";
import Sidebar from "../Sidebar";
import "./Settings.css"; 

// Import settings sections
import BusinessSettings from "./BusinessSettings";
import AccountSettings from "./AccountSettings";
import TaxSettings from "./TaxSettings";
import BankSettings from "./BankSettings";
import GeneralSettings from "./GeneralSettings";

const Settings = () => {
    const [activeSection, setActiveSection] = useState(null);

    // Main settings state
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
        businessType: "Sole Proprietor",
        taxExempt: false,
        defaultDiscount: 0,
    });

    // Handles input changes
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setSettings({
            ...settings,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Open a section as the main view
    const openSection = (sectionName) => {
        console.log(`Opening section: ${sectionName}`);
        setActiveSection(sectionName);
    };

    // Close the active section and return to the grid
    const closeSection = () => {
        console.log("Returning to settings grid");
        setActiveSection(null);
    };

    return (
        <div className="page-container">
            <div className="sidebar">
                <Sidebar />
            </div>

            <div className="settings-container">
                {/* Hide the title when a section is open */}
                {!activeSection && (
                    <>
                        <h2>Settings</h2>
                        <p>Manage all your business and account settings here.</p>
                    </>
                )}

                {/* Show Back Button when a section is open */}
                {activeSection && (
                    <button className="back-button" onClick={closeSection}>⬅ Back to Settings</button>
                )}

                {/* Show Settings Grid if No Section is Active */}
                {!activeSection && (
                    <div className="settings-grid">
                        <div className="settings-card" onClick={() => openSection("business")}>
                            <h3>Business Settings</h3>
                        </div>
                        <div className="settings-card" onClick={() => openSection("account")}>
                            <h3>Account Settings</h3>
                        </div>
                        <div className="settings-card" onClick={() => openSection("tax")}>
                            <h3>Tax & Invoicing</h3>
                        </div>
                        <div className="settings-card" onClick={() => openSection("bank")}>
                            <h3>Bank Details</h3>
                        </div>
                        <div className="settings-card" onClick={() => openSection("general")}>
                            <h3>General Settings</h3>
                        </div>
                    </div>
                )}

                {/* Render the Selected Settings Section */}
                {activeSection && (
                    <div className="settings-section">
                        {activeSection === "business" && <BusinessSettings settings={settings} handleChange={handleChange} />}
                        {activeSection === "account" && <AccountSettings />}
                        {activeSection === "tax" && <TaxSettings settings={settings} handleChange={handleChange} />}
                        {activeSection === "bank" && <BankSettings settings={settings} handleChange={handleChange} />}
                        {activeSection === "general" && <GeneralSettings />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
