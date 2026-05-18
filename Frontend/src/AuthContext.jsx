import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const decodeJwtPayload = (token) => {
  try {
    const payload = token?.split('.')?.[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch (e) {
    return null;
  }
};

const isJwtExpired = (token) => {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === 'number' && exp * 1000 <= Date.now();
};

const hasAuthorizationHeader = (headers) => {
  if (!headers) return false;
  if (typeof headers.get === 'function') {
    return Boolean(headers.get('Authorization') || headers.get('authorization'));
  }

  return Boolean(headers.Authorization || headers.authorization);
};

const redirectToLogin = () => {
  try {
    if (window.location.hash !== '#/login') {
      window.location.hash = '#/login';
    }
  } catch (e) {
    // noop
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('ims_user');
      const savedUser = raw ? JSON.parse(raw) : null;

      if (savedUser?.token && isJwtExpired(savedUser.token)) {
        localStorage.removeItem('ims_user');
        return null;
      }

      return savedUser;
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

  const login = useCallback((payload) => setUser(payload), []);
  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('ims_user');
    } catch (e) {
      // noop
    }
    redirectToLogin();
  }, []);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isUnauthorized = error.response?.status === 401;
        const requestHadToken = hasAuthorizationHeader(error.config?.headers);

        if (isUnauthorized && requestHadToken) {
          logout();
        }

        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptorId);
  }, [logout]);

  useEffect(() => {
    if (!user?.token) return undefined;

    const payload = decodeJwtPayload(user.token);
    if (typeof payload?.exp !== 'number') return undefined;

    const expiresInMs = payload.exp * 1000 - Date.now();

    if (expiresInMs <= 0) {
      logout();
      return undefined;
    }

    const timeoutId = window.setTimeout(logout, expiresInMs);
    return () => window.clearTimeout(timeoutId);
  }, [user?.token, logout]);

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
