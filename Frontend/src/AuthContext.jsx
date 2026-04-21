import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('ims_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem('ims_user', JSON.stringify(user));
      else localStorage.removeItem('ims_user');
    } catch (e) {
      // ignore
    }
  }, [user]);

  const login = (payload) => setUser(payload);
  const logout = () => {
    setUser(null);
    try {
      window.location.hash = '#/login';
    } catch (e) {
      // noop
    }
  };

  const completeSetup = () => {
    if (user) {
      const updatedUser = { ...user, isFirstLogin: false };
      setUser(updatedUser);
    }
  };

  const [recommendationLetter, setRecommendationLetter] = useState(null);
  const isRecommendationAvailable = Boolean(recommendationLetter?.available && recommendationLetter?.file_url);

  const refreshRecommendationLetter = useCallback(async (targetRole) => {
    const activeUser = user;
    const role = targetRole || activeUser?.role;
    const token = activeUser?.token;

    if (!role || !token || !['student', 'uil'].includes(role.toLowerCase())) {
      setRecommendationLetter(null);
      return null;
    }

    const endpoint =
      role.toLowerCase() === 'uil'
        ? '/api/UIL/recommendation-letter'
        : '/api/student/recommendation-letter';

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const recommendation = response.data?.recommendation || null;
      setRecommendationLetter(recommendation);
      return recommendation;
    } catch (error) {
      setRecommendationLetter(null);
      return null;
    }
  }, [user]);

  useEffect(() => {
    if (user?.token && ['student', 'uil'].includes((user.role || '').toLowerCase())) {
      refreshRecommendationLetter(user.role);
    } else {
      setRecommendationLetter(null);
    }
  }, [user, refreshRecommendationLetter]);


  return (
    <AuthContext.Provider value={{ user, login, logout, completeSetup, isRecommendationAvailable, recommendationLetter, refreshRecommendationLetter }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
