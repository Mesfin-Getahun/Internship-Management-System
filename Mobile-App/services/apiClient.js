import { Platform } from "react-native";

const defaultBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || defaultBaseUrl).replace(/\/$/, "");

let authToken = null;

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}

export async function apiRequest(
  path,
  { method = "GET", body, headers = {}, isFormData = false, requiresAuth = false, timeoutMs = 15000 } = {}
) {
  const requestHeaders = { ...headers };

  if (!isFormData) {
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
  }

  if (requiresAuth) {
    if (!authToken) {
      throw new Error("You are not logged in.");
    }

    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection and backend server.");
    }

    throw new Error("Network request failed. Please confirm your phone can reach the backend server.");
  } finally {
    clearTimeout(timeoutId);
  }

  const rawText = await response.text();
  let data = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("Server returned an unexpected response.");
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
