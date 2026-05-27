import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import OrganizationSignUp from "./pages/auth/OrganizationSignUp.jsx";
import InvitedCompanySignUp from "./pages/auth/InvitedCompanySignUp.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import ChangePassword from "./components/setup/ChangePassword.jsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";
import FacultyDashboard from "./pages/dashboard/FacultyDashboard.jsx";
import MentorDashboard from "./pages/dashboard/MentorDashboard.jsx";
import StudentDashboard from "./pages/dashboard/StudentDashboard.jsx";
import OrganizationDashboard from "./pages/dashboard/OrganizationDashboard.jsx";
import UilDashboard from "./pages/dashboard/UilDashboard.jsx";
import OrganizationSupervisorDashboard from "./pages/dashboard/OrganizationSupervisorDashboard.jsx";
import EvaluatorDashboard from "./pages/dashboard/EvaluatorDashboard.jsx";
import ThemeToggle from './components/common/ThemeToggle.jsx';

const getHomeRoute = (user) => {
  if (!user) {
    return "/login";
  }
  switch (user.role) {
    case 'student': return '/student';
    case 'admin': return '/admin';
    case 'faculty': return '/faculty';
    case 'mentor': return '/mentor';
    case 'organization': return '/organization';
    case 'uil': return '/uil';
    case 'org_supervisor': return '/org-supervisor';
    case 'evaluator': return '/evaluator';
    default: return '/login';
  }
};

const ProtectedRoute = ({
  children,
  forChangePassword = false,
  allowedRoles = null,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isFirstLogin && !forChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (!user.isFirstLogin && forChangePassword) {
    return <Navigate to={getHomeRoute(user)} replace />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to={getHomeRoute(user)} replace />;
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

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Inter']">
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/organization" element={<OrganizationSignUp />} />
          <Route path="/company/invite" element={<InvitedCompanySignUp />} />
          <Route path="/change-password" element={<ProtectedRoute forChangePassword={true}><ChangePassword /></ProtectedRoute>} />

          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/faculty/*" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/mentor/*" element={<ProtectedRoute allowedRoles={["mentor"]}><MentorDashboard /></ProtectedRoute>} />
          <Route path="/student/*" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/organization/*" element={<ProtectedRoute allowedRoles={["organization"]}><OrganizationDashboard /></ProtectedRoute>} />
          <Route path="/uil/*" element={<ProtectedRoute allowedRoles={["uil"]}><UilDashboard /></ProtectedRoute>} />
          <Route path="/org-supervisor/*" element={<ProtectedRoute allowedRoles={["org_supervisor"]}><OrganizationSupervisorDashboard /></ProtectedRoute>} />
          <Route path="/evaluator/*" element={<ProtectedRoute allowedRoles={["evaluator"]}><EvaluatorDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={getHomeRoute(user)} replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
