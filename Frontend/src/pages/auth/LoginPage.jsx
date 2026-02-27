import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import LoginForm from "../../components/auth/LoginForm.jsx";
import { users } from "../../assets/data.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === email.toLowerCase() ||
          u.username.toLowerCase() === email.toLowerCase()) &&
        u.password === password,
    );

    if (!user) {
      setError("Invalid credentials. Please try again.");
      return;
    }

    // Set user in global context
    login(user);

    // Navigation will be handled by App.jsx based on user state
    // but we can give it a push to the root which will then redirect.
    if (user.isFirstLogin) {
      navigate('/setup');
    } else {
      navigate(`/${user.role}`);
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
