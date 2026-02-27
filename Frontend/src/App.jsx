import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import OrganizationSignUp from "./pages/auth/OrganizationSignUp.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import FirstTimeSetup from "./pages/FirstTimeSetup.jsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";
import FacultyDashboard from "./pages/dashboard/FacultyDashboard.jsx";
import MentorDashboard from "./pages/dashboard/MentorDashboard.jsx";
import StudentDashboard from "./pages/dashboard/StudentDashboard.jsx";
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard.jsx";
import UilDashboard from "./pages/dashboard/UilDashboard.jsx";
import ThemeToggle from './components/common/ThemeToggle.jsx';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isFirstLogin) {
    return <Navigate to="/setup" replace />;
  }

  return children;
};

const App = () => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    console.debug('App: isDarkMode changed ->', isDarkMode);
  }, [isDarkMode]);

  const getHomeRoute = () => {
    if (!user) {
      return "/login";
    }
    if (user.isFirstLogin) {
      return "/setup";
    }
    switch (user.role) {
      case 'student': return '/student';
      case 'admin': return '/admin';
      case 'faculty': return '/faculty';
      case 'mentor': return '/mentor';
      case 'organization': return '/organization';
      case 'uil': return '/uil';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Inter']">
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/organization" element={<OrganizationSignUp />} />
          <Route path="/setup" element={user && user.isFirstLogin ? <FirstTimeSetup /> : <Navigate to={getHomeRoute()} />} />

          <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/faculty/*" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/mentor/*" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
          <Route path="/student/*" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/organization/*" element={<ProtectedRoute><OrganizationDashboard /></ProtectedRoute>} />
          <Route path="/uil/*" element={<ProtectedRoute><UilDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
