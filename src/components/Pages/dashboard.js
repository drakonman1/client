// src/components/Dashboard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const Dashboard = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("Overview");

    const cardStyle = {
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        flex: "1",
        textAlign: "center",
        cursor: "pointer",
    };

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                alert("Logged out successfully!");
                navigate("/login");
            })
            .catch((error) => {
                console.error("Logout error:", error);
                alert("Failed to log out.");
            });
    };

    const sections = {
        Overview: (
            <div>
                <h2>Welcome to Your Dashboard</h2>
                <p>Get started by selecting a section below:</p>
                <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                    <div
                        style={cardStyle}
                        onClick={() => navigate("/invoices")} // Navigate to Invoice Hub
                    >
                        <h3>Invoices</h3>
                        <p>Create and manage invoices.</p>
                    </div>
                    <div
                        style={cardStyle}
                        onClick={() => navigate("/clients")} // Navigate to Client Management
                    >
                        <h3>Clients</h3>
                        <p>Manage your client profiles.</p>
                    </div>
                    <div
                        style={cardStyle}
                        onClick={() => navigate("/analytics")} // Navigate to Analytics
                    >
                        <h3>Analytics</h3>
                        <p>View reports and insights.</p>
                    </div>
                    <div
                        style={cardStyle}
                        onClick={() => navigate("/settings")} // Navigate to Settings
                    >
                        <h3>Settings</h3>
                        <p>Manage account settings and subscriptions.</p>
                    </div>
                </div>
            </div>
        ),
    };

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: "250px",
                    backgroundColor: "#007bff",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
                }}
            >
                <h2>SaaS Dashboard</h2>
                <p>{user ? `Welcome, ${user.email}` : "Welcome!"}</p>
                <nav>
                    <button
                        onClick={() => setActiveSection("Overview")}
                        style={{
                            display: "block",
                            backgroundColor: activeSection === "Overview" ? "#0056b3" : "transparent",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            textAlign: "left",
                            cursor: "pointer",
                            width: "100%",
                            marginBottom: "5px",
                        }}
                    >
                        Overview
                    </button>
                </nav>
                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: "auto",
                        padding: "10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main
                style={{
                    flexGrow: 1,
                    padding: "20px",
                    backgroundColor: "#f8f9fa",
                }}
            >
                {sections[activeSection]}
            </main>
        </div>
    );
};

export default Dashboard;
