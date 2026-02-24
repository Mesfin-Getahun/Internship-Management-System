import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import LoginForm from "../../components/auth/LoginForm.jsx";
import { users } from "../../assets/data.js";

const LoginPage = () => {
  const navigate = useNavigate();

  // start empty instead of using constant demo values
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

    console.log("LOGIN ATTEMPT", { email, password, user });

    if (!user) {
      setError("Invalid credentials for mock login.");
      return;
    }

    console.log("NAVIGATING AS ROLE", user.role);

    switch (user.role) {
      case "admin":
        navigate("/dashboard/admin");
        break;
      case "faculty":
        navigate("/dashboard/faculty");
        break;
      case "mentor":
        navigate("/dashboard/mentor");
        break;
      case "uil":
        navigate("/dashboard/uil");
        break;
      case "organization":
        navigate("/dashboard/organization");
        break;
      case "student":
      default:
        navigate("/dashboard/student");
        break;
    }
  };

  return (
  <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors duration-300">
      <AuthHeader />
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
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
