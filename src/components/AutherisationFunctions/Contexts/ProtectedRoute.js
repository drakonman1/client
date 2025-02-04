import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProtectedRoute = ({ element, allowedRoles, userRole }) => {
    const auth = getAuth();
    const user = auth.currentUser;

    console.log("🔐 Checking ProtectedRoute Access:");
    console.log("User:", user ? user.uid : "No user logged in");
    console.log("Allowed Roles:", allowedRoles);
    console.log("User Role:", userRole);

    if (!user) {
        console.warn("🚫 No user detected. Redirecting to login.");
        return <Navigate to="/login" replace />;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
        console.warn("🚫 Unauthorized role detected. Redirecting to /unauthorized.");
        return <Navigate to="/unauthorized" replace />;
    }

    return element;
};

export default ProtectedRoute;