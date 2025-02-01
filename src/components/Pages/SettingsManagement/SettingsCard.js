import React, { useState } from "react";

const SettingsCard = ({ title, description, icon, color, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen); // Set default open state

    // Toggle function (click & keyboard support)
    const toggleCard = () => setIsOpen(!isOpen);

    return (
        <div className={`settings-card ${isOpen ? "open" : ""}`} style={{ borderLeftColor: color || "#007bff" }}>
            {/* Card Header - Clickable */}
            <div
                className="settings-card-header"
                onClick={toggleCard}
                onKeyPress={(e) => (e.key === "Enter" ? toggleCard() : null)}
                tabIndex={0} // Keyboard accessibility
                role="button"
                aria-expanded={isOpen}
            >
                {/* Icon (if provided) */}
                {icon && <span className="settings-icon">{icon}</span>}
                
                {/* Title & Description */}
                <div className="settings-header-text">
                    <h3>{title}</h3>
                    {description && <p>{description}</p>}
                </div>

                {/* Toggle Icon */}
                <span className="toggle-icon">{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* Expandable Content */}
            <div className="settings-card-content" style={{ maxHeight: isOpen ? "500px" : "0px" }}>
                {children}
            </div>
        </div>
    );
};

export default SettingsCard;