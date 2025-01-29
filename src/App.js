import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/AutherisationFunctions/AuthForm"; // Login page
import Register from "./components/AutherisationFunctions/Register"; // Register page
import Dashboard from "./components/Pages/dashboard"; // Example dashboard page
import InvoiceHub from "./components/Pages/InvoiceManagement/Invoicehub";
import ClientManagement from "./components/Pages/ClientManagement";
import Settings from "./components/Pages/SettingsManagement/Settings";
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AuthForm />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Add a default route */}
                <Route path="/invoices" element={<InvoiceHub />} />
                <Route path="/clients" element={<ClientManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
        </Router>
    );
};

export default App;