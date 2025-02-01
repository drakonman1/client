import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/Pages/LandingPage"; // New Landing Page
import AuthForm from "./components/AutherisationFunctions/AuthForm"; // Login page
import Register from "./components/AutherisationFunctions/Register"; // Register page
import Dashboard from "./components/Pages/dashboard";
import InvoiceHub from "./components/Pages/InvoiceManagement/Invoicehub";
import ClientManagement from "./components/Pages/ClientManagement";
import Settings from "./components/Pages/SettingsManagement/Settings";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthForm />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/invoices" element={<InvoiceHub />} />
                <Route path="/clients" element={<ClientManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pricing" element={<h1>Pricing Page (Coming Soon)</h1>} />
                <Route path="/about" element={<h1>About Us Page (Coming Soon)</h1>} />
                <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
        </Router>
    );
};

export default App;