import React, { useState, useEffect } from "react";
import {
    Home, FileText, Settings, Shield, LogOut, Search, User,
    ChevronDown, ChevronUp, Bell, Star, Moon, Sun
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase/firebaseconfig"; // Ensure correct path
import "./Sidebar.css";

const Sidebar = () => {
    const location = useLocation();
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(true);
    const [isRecentOpen, setIsRecentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [userName, setUserName] = useState(""); // Default name

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Directly access the user document from 'users' collection
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
    
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        // Access the name from personalInfo
                        setUserName(userData.personalInfo?.name || "User");
                    } else {
                        console.warn("User document not found");
                        setUserName("User");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error.message);
                    setUserName("User");
                }
            }
        });
    
        return () => unsubscribe();
    }, []);

    const mainLinks = [
        { path: "/admin-dashboard", label: "Home", Icon: Home, notifications: 0 },
        { path: "/invoices", label: "Invoices", Icon: FileText, notifications: 0 },
        { path: "/settings", label: "Settings", Icon: Settings, notifications: 0 },
    ];

    const privacyLinks = [
        { path: "/privacy-policy", label: "Privacy Policy", Icon: Shield },
        { path: "/data-security", label: "Data Security", Icon: Shield },
        { path: "/terms-of-service", label: "Terms of Service", Icon: Shield },
    ];

    const recentLinks = [
        { path: "/recent-page-1", label: "Recent Page 1", Icon: FileText },
        { path: "/recent-page-2", label: "Recent Page 2", Icon: FileText },
    ];

    const filterLinks = (links) =>
        links.filter((link) =>
            link.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <aside className={`sidebar ${darkMode ? "dark-mode" : ""}`}>
            {/* Profile Section */}
            <div className="sidebar-header">
                <div className="profile-container">
                    <User className="profile-icon" />
                    <span className="profile-name">{userName}</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="sidebar-search">
                <Search className="search-icon" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Main Section */}
            <nav className="sidebar-nav">
                <div className="section-header">
                    <h3 className="sidebar-section-title">Main</h3>
                    <button
                        className="toggle-button"
                        onClick={() => setIsMainOpen(!isMainOpen)}
                        aria-label="Toggle Main Section"
                    >
                        {isMainOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                </div>
                {isMainOpen && (
                    <ul>
                        {filterLinks(mainLinks).map(({ path, label, Icon, notifications }) => (
                            <li key={path}>
                                <a
                                    href={path}
                                    className={`sidebar-link ${
                                        location.pathname === path ? "active" : ""
                                    }`}
                                >
                                    <Icon className="sidebar-icon" />
                                    <span>{label}</span>
                                    {notifications > 0 && (
                                        <span className="notification-badge">
                                            {notifications}
                                        </span>
                                    )}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </nav>

            {/* Privacy Section */}
            <nav className="sidebar-nav">
                <div className="section-header">
                    <h3 className="sidebar-section-title">Privacy & Support</h3>
                    <button
                        className="toggle-button"
                        onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                        aria-label="Toggle Privacy Section"
                    >
                        {isPrivacyOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                </div>
                {isPrivacyOpen && (
                    <ul>
                        {filterLinks(privacyLinks).map(({ path, label, Icon }) => (
                            <li key={path}>
                                <a
                                    href={path}
                                    className={`sidebar-link ${
                                        location.pathname === path ? "active" : ""
                                    }`}
                                >
                                    <Icon className="sidebar-icon" />
                                    <span>{label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </nav>

            {/* Recent Activity Section */}
            <nav className="sidebar-nav">
                <div className="section-header">
                    <h3 className="sidebar-section-title">Recent Activity</h3>
                    <button
                        className="toggle-button"
                        onClick={() => setIsRecentOpen(!isRecentOpen)}
                        aria-label="Toggle Recent Activity Section"
                    >
                        {isRecentOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                </div>
                {isRecentOpen && (
                    <ul>
                        {recentLinks.map(({ path, label, Icon }) => (
                            <li key={path}>
                                <a
                                    href={path}
                                    className={`sidebar-link ${
                                        location.pathname === path ? "active" : ""
                                    }`}
                                >
                                    <Icon className="sidebar-icon" />
                                    <span>{label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <button
                    className="toggle-theme"
                    onClick={() => setDarkMode(!darkMode)}
                    aria-label="Toggle Theme"
                >
                    {darkMode ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
                    <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <a href="/logout" className="sidebar-link">
                    <LogOut className="sidebar-icon" />
                    <span>Logout</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;