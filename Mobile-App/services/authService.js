import { apiRequest, clearAuthToken, setAuthToken } from "./apiClient";

let currentSession = null;
let pendingFirstLogin = null;

function resolveUserId(user, role) {
  if (!user || !role) {
    return null;
  }

  const idKeyByRole = {
    student: "student_id",
    admin: "admin_id",
    mentor: "mentor_id",
    faculty: "faculty_id",
    UIL: "UIL_id",
    company_mentor: "company_mentor_id",
    company: "company_id",
  };

  const key = idKeyByRole[role];
  return key ? user[key] : null;
}

export async function login({ identifier, password }) {
  const data = await apiRequest("/api/login", {
    method: "POST",
    body: {
      id: identifier,
      password,
    },
  });

  if (data.role !== "student") {
    throw new Error("This mobile app currently supports student accounts only.");
  }

  if (data.firstLogin) {
    pendingFirstLogin = {
      id: resolveUserId(data.user, data.role),
      role: data.role,
      identifier,
    };

    return {
      success: true,
      firstLogin: true,
      user: data.user,
      role: data.role,
      message: data.message,
    };
  }

  setAuthToken(data.token);
  currentSession = {
    token: data.token,
    role: data.role,
    user: data.user,
  };
  pendingFirstLogin = null;

  return {
    success: true,
    firstLogin: false,
    user: data.user,
    role: data.role,
    token: data.token,
    message: data.message,
  };
}

export async function completeFirstLogin(newPassword) {
  if (!pendingFirstLogin?.id || !pendingFirstLogin?.role || !pendingFirstLogin?.identifier) {
    throw new Error("Your first-login session expired. Please sign in again.");
  }

  await apiRequest("/api/change-password", {
    method: "POST",
    body: {
      id: pendingFirstLogin.id,
      role: pendingFirstLogin.role,
      newPassword,
    },
  });

  return login({
    identifier: pendingFirstLogin.identifier,
    password: newPassword,
  });
}

export function getCurrentSession() {
  return currentSession;
}

export function updateCurrentSessionUser(updates) {
  if (!currentSession?.user) {
    return null;
  }

  currentSession = {
    ...currentSession,
    user: {
      ...currentSession.user,
      ...updates,
    },
  };

  return currentSession.user;
}

export function logout() {
  currentSession = null;
  pendingFirstLogin = null;
  clearAuthToken();
}
