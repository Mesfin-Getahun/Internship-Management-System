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
  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState({
    role: "company",
    identifier: "",
  });
  const [resetMessage, setResetMessage] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

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
      case "evaluator":
        return "/evaluator";
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
        const { user, role, token, firstLogin, setupToken } = response.data;
        const normalizedRole = normalizeRole(role);
        console.debug("Login role returned by backend:", role, "->", normalizedRole);
        
        const authenticatedUser = {
          ...user,
          role: normalizedRole,
          token,
          setupToken,
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

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setResetMessage("");
    setError("");

    try {
      setResetSubmitting(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/change-password/forgot`, resetForm);
      const tempPassword = res.data?.temporary_password;
      setResetMessage(
        tempPassword
          ? `${res.data?.message || "Temporary password generated."} Temporary password: ${tempPassword}`
          : res.data?.message || "Temporary password sent.",
      );
    } catch (err) {
      console.error("Forgot password failed:", err);
      setResetMessage(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setResetSubmitting(false);
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
          onForgotPassword={() => {
            setResetForm((prev) => ({ ...prev, identifier: email || prev.identifier }));
            setResetMessage("");
            setResetOpen(true);
          }}
        />
      </div>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Forgot Password</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Self-service reset is available for company, company mentor, and admin accounts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                X
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Account Type</span>
                <select
                  value={resetForm.role}
                  onChange={(event) => setResetForm((prev) => ({ ...prev, role: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="company">Company</option>
                  <option value="company_mentor">Company Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Email or ID</span>
                <input
                  type="text"
                  value={resetForm.identifier}
                  onChange={(event) => setResetForm((prev) => ({ ...prev, identifier: event.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>

              {resetMessage && (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {resetMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-60"
              >
                {resetSubmitting ? "Resetting..." : "Send Temporary Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
