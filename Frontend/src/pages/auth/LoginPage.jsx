import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import AuthHeader from "../../components/auth/AuthHeader.jsx";
import LoginForm from "../../components/auth/LoginForm.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 🔥 One input for ID OR Email
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // const res = await axios.post("http://localhost:5000/api/login", {
      //   id: identifier,
      //   email: identifier,
      //   password,
      // });

      // console.log("Response:", res.data);
      // const { token, user, role, firstLogin } = res.data;

      // // 🔥 FIRST LOGIN CASE
      // if (firstLogin) {
      //   localStorage.setItem("token", token);

      //   axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      //   login({
      //     ...user,
      //     role,
      //     isFirstLogin: true,
      //   });

      //   navigate("/change-password");
      //   return;
      // }

      // // Normal login
      // localStorage.setItem("token", token);

      // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // login({
      //   user,
      //   role,
      //   token,
      //   firstLogin: false,
      // });

      // navigate(`/${role}`, { replace: true });

      const res = await axios.post("http://localhost:5000/api/login", {
        id: identifier,
        email: identifier,
        password,
      });

      const { token, user, role, firstLogin } = res.data;

      // 🔥 Always store token first
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 🔥 Update context
      login({
        user,
        role,
        token,
        firstLogin,
      });

      // ✅ FIRST LOGIN → Redirect to change password
      if (firstLogin) {
        navigate("/change-password", { replace: true });
        return;
      }

      // ✅ NORMAL LOGIN → Redirect to dashboard
      navigate(`/${role}`, { replace: true });
      console.log("Login successful");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };
  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        <AuthHeader />

        {error && (
          <p className="text-red-500 text-sm text-center -mt-2 mb-4 px-8">
            {error}
          </p>
        )}

        <LoginForm
          identifier={identifier}
          password={password}
          setIdentifier={setIdentifier}
          setPassword={setPassword}
          onSubmit={handleSubmit}
          onRegisterOrg={() => navigate("/register/organization")}
        />
      </div>
    </div>
  );
};

export default LoginPage;
