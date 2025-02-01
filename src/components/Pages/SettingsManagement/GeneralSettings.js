import React, { useState } from "react";
import SettingsCard from "./SettingsCard";

const GeneralSettings = () => {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <SettingsCard title="General Settings">
            <label>
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                Enable Dark Mode
            </label>

            <label>Language</label>
            <select>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
            </select>

            <button className="save-button">Update General Settings</button>
        </SettingsCard>
    );
};

export default GeneralSettings;