// src/components/Dashboard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Sidebar from "./Sidebar"; // Import Sidebar Component
import "./dashboard.css"; // Import the new CSS

const Dashboard = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("Overview");

    const sections = {
        Overview: (
            <div>
                <h2>Welcome to Your Dashboard</h2>
                <p>Get started by selecting a section below:</p>
                <div className="dashboard-cards">
                    <div className="dashboard-card" onClick={() => navigate("/invoices")}>
                        <h3>Invoices</h3>
                        <p>Create and manage invoices.</p>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate("/clients")}>
                        <h3>Clients</h3>
                        <p>Manage your client profiles.</p>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate("/analytics")}>
                        <h3>Analytics</h3>
                        <p>View reports and insights.</p>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate("/settings")}>
                        <h3>Settings</h3>
                        <p>Manage account settings and subscriptions.</p>
                    </div>
                </div>
            </div>
        ),
    };

    return (
        <div className="dashboard-container">
            <Sidebar setActiveSection={setActiveSection} activeSection={activeSection} />
            <main className="dashboard-main">{sections[activeSection]}</main>
        </div>
    );
};

export default Dashboard;