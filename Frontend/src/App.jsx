<<<<<<< HEAD

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './pages/auth/RoleSelection.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterOrganization from './pages/auth/RegisterOrganization.jsx';
import RestrictedLogin from './pages/auth/RestrictedLogin.jsx';
import FirstTimeSetup from './pages/auth/FirstTimeSetup.jsx';
import OrganizationDashboard from './pages/dashboard/OrganizationDashboard.jsx';
import FacultyDashboard from './pages/dashboard/FacultyDashboard.jsx';
import MentorDashboard from './pages/dashboard/MentorDashboard.jsx';
import StudentDashboard from './pages/dashboard/StudentDashboard.jsx';
import UilDashboard from './pages/dashboard/UilDashboard.jsx';
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';
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

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Inter']">
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <HashRouter>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/setup/:role" element={<FirstTimeSetup />} />
          <Route path="/register/organization" element={<RegisterOrganization />} />
          <Route path="/restricted/:role" element={<RestrictedLogin />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard/organization/*" element={<OrganizationDashboard />} />
          <Route path="/dashboard/faculty/*" element={<FacultyDashboard />} />
          <Route path="/dashboard/mentor/*" element={<MentorDashboard />} />
          <Route path="/dashboard/student/*" element={<StudentDashboard />} />
          <Route path="/dashboard/uil-officer/*" element={<UilDashboard />} />
          <Route path="/dashboard/system-admin/*" element={<AdminDashboard />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
};
=======
import React from "react";
import LandingPage from "./pages/LandingPage.jsx";

function App() {
  return <LandingPage />;
}
>>>>>>> feature-landing-page

export default App;
