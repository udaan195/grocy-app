import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check karo ki token localStorage mein hai ya nahi
  const token = localStorage.getItem('authToken');

  // Agar token hai, to user ko page dekhne do (Outlet render karega)
  // Agar nahi hai, to use login page par bhej do
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
