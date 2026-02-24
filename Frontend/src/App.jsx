
import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import OrganizationSignUp from "./pages/auth/OrganizationSignUp.jsx";
// REMOVE this line:
// import RestrictedLogin from "./pages/auth/RestrictedLogin.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";
import FacultyDashboard from "./pages/dashboard/FacultyDashboard.jsx";
import MentorDashboard from "./pages/dashboard/MentorDashboard.jsx";
import StudentDashboard from "./pages/dashboard/StudentDashboard.jsx";
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard.jsx";
import UilDashboard from "./pages/dashboard/UilDashboard.jsx";
import ThemeToggle from './components/common/ThemeToggle.jsx';

const App = () => {
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
  // Debug helper: log when parent toggles theme so we can trace issues.
  useEffect(() => {
    console.debug('App: isDarkMode changed ->', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Inter']">
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <HashRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/organization" element={<OrganizationSignUp />} />

          {/* If you previously had a RestrictedLogin route, REMOVE it: */}
          {/*
          <Route path="/restricted/:role" element={<RestrictedLogin />} />
          */}

          {/* Dashboards */}
          <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
          <Route path="/dashboard/faculty/*" element={<FacultyDashboard />} />
          <Route path="/dashboard/mentor/*" element={<MentorDashboard />} />
          <Route path="/dashboard/student/*" element={<StudentDashboard />} />
          <Route
            path="/dashboard/organization/*"
            element={<OrganizationDashboard />}
          />
          <Route path="/dashboard/uil/*" element={<UilDashboard />} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
