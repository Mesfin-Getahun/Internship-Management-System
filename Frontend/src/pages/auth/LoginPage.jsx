import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import LoginForm from "../../components/auth/LoginForm.jsx";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const normalizeRole = (role) => {
    switch (role) {
      case "company":
        return "organization";
      case "UIL":
        return "uil";
      case "company_mentor":
        return "org_supervisor";
      default:
        return role?.toLowerCase?.() || role;
    }
  };

  const getHomeRoute = (role) => {
    switch (role) {
      case "student":
        return "/student";
      case "admin":
        return "/admin";
      case "faculty":
        return "/faculty";
      case "mentor":
        return "/mentor";
      case "organization":
        return "/organization";
      case "uil":
        return "/uil";
      case "org_supervisor":
        return "/org-supervisor";
      default:
        return "/login";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        id: email,
        email: email,
        password: password
      });

      if (response.data.success) {
        const { user, role, token, firstLogin } = response.data;
        const normalizedRole = normalizeRole(role);
        console.debug("Login role returned by backend:", role, "->", normalizedRole);
        
        const authenticatedUser = {
          ...user,
          role: normalizedRole,
          token,
          isFirstLogin: !!firstLogin,
        };

        login(authenticatedUser);

        if (authenticatedUser.isFirstLogin) {
          navigate('/change-password');
        } else {
          if (normalizedRole !== "uil") {
            setError(
              `Login succeeded as ${normalizedRole}, not UIL. Please use a UIL account for UIL dashboard actions.`,
            );
          }
          navigate(getHomeRoute(normalizedRole));
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <AuthHeader />
        {error && (
          <p className="text-red-500 text-sm text-center -mt-2 mb-4 px-8">{error}</p>
        )}
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={handleSubmit}
          onRegisterOrg={() => navigate("/register/organization")}
        />
      </div>
    </div>
  );
};

export default LoginPage;
