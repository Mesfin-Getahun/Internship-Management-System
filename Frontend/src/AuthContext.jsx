// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     try {
//       const raw = localStorage.getItem('ims_user');
//       return raw ? JSON.parse(raw) : null;
//     } catch (e) {
//       return null;
//     }
//   });

//   useEffect(() => {
//     try {
//       if (user) localStorage.setItem('ims_user', JSON.stringify(user));
//       else localStorage.removeItem('ims_user');
//     } catch (e) {
//       // ignore
//     }
//   }, [user]);

//   const login = (payload) => setUser(payload);
//   const logout = () => {
//     setUser(null);
//     try {
//       window.location.hash = '#/login';
//     } catch (e) {
//       // noop
//     }
//   };

//   const completeSetup = () => {
//     if (user) {
//       const updatedUser = { ...user, isFirstLogin: false };
//       setUser(updatedUser);
//     }
//   };

//   const [isRecommendationAvailable, setRecommendationAvailable] = useState(false);

//   const makeRecommendationAvailable = () => setRecommendationAvailable(true);
//   const makeRecommendationUnavailable = () => setRecommendationAvailable(false);

//   return (
//     <AuthContext.Provider value={{ user, login, logout, completeSetup, isRecommendationAvailable, makeRecommendationAvailable, makeRecommendationUnavailable }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
//   return ctx;
// };

// export default AuthContext;

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Set axios default header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me");

      console.log("FETCH USER RESPONSE:", res.data);

      setUser({
        ...res.data.user,
        isFirstLogin: res.data.user.must_change_password, // 👈 IMPORTANT
      });
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // const login = (data) => {
  //   localStorage.setItem("token", data.token);
  //   setAuthToken(data.token);
  //   setUser(data.user);
  // };

  const login = (data) => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
    }

    setUser({
      ...data.user,
      isFirstLogin: data.firstLogin ?? false,
      role: data.role,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
