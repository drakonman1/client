import React from "react";
import "./businessSettings.css"; // Import Business-specific CSS

const BusinessSettings = ({ settings, handleChange }) => {
    return (
        <div className="business-settings-container">
            <h2>Business Information</h2>

            <label>Upload Business Logo</label>
            <input type="file" name="logo" className="file-input" />

            <label>Business Name</label>
            <input type="text" name="businessName" value={settings.businessName} onChange={handleChange} className="text-input" />

            <label>Business Type</label>
            <select name="businessType" value={settings.businessType} onChange={handleChange} className="select-input">
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="LLC">LLC</option>
                <option value="Corporation">Corporation</option>
                <option value="Non-Profit">Non-Profit</option>
            </select>

            <label>Address</label>
            <textarea name="address" value={settings.address} onChange={handleChange} className="textarea-input" />

            <label>Phone Number</label>
            <input type="text" name="phone" value={settings.phone} onChange={handleChange} className="text-input" />

            <label>Email</label>
            <input type="email" name="email" value={settings.email} onChange={handleChange} className="text-input" />

            <label>Website</label>
            <input type="text" name="website" value={settings.website} onChange={handleChange} className="text-input" />
        </div>
    );
};

export default BusinessSettings;