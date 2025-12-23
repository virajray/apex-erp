// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // If not logged in → redirect to login
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;