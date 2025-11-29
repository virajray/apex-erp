// client/src/App.js — FINAL VERSION (2025)

import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import LoginPage from "./LoginPage";
import DashboardPage from "./components/DashboardPage";
import BranchesPage from "./pages/BranchesPage";   // ← NEW PAGE
import OrdersPage from "./pages/OrdersPage";         // ← Optional future page
import "./App.css";

// Optional: Create a simple 404 page
const NotFound = () => (
  <div style={{ padding: "40px", textAlign: "center" }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check login status on app load
  useEffect(() => {
    const token = localStorage.getItem("erp-token");
    const savedUser = localStorage.getItem("erp-user");

    if (token && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Called by LoginPage on successful login
  const handleLogin = ({ token, user }) => {
    localStorage.setItem("erp-token", token);
    localStorage.setItem("erp-user", JSON.stringify(user));
    setIsLoggedIn(true);
    setUser(user);
  };

  // Called by Header component
  const handleLogout = () => {
    localStorage.removeItem("erp-token");
    localStorage.removeItem("erp-user");
    setIsLoggedIn(false);
    setUser(null);
  };

  // Protected Route Component (optional cleaner way)
  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage handleLogin={handleLogin} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/branches"
          element={
            <ProtectedRoute>
              <BranchesPage handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Future pages — just add them here */}
        {/* <Route path="/orders" element={<ProtectedRoute><OrdersPage handleLogout={handleLogout} /></ProtectedRoute>} /> */}

        {/* Default Redirect */}
        <Route
          path="/"
          element={
            <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;