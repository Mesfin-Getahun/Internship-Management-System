import { Platform } from "react-native";
import Constants from "expo-constants";

function getExpoDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.replace(/^https?:\/\//, "").split(":")[0];
}

function getDefaultBaseUrl() {
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  const expoDevHost = getExpoDevHost();
  if (expoDevHost && !["localhost", "127.0.0.1"].includes(expoDevHost)) {
    return `http://${expoDevHost}:5000`;
  }

  return Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
}

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultBaseUrl()).replace(/\/$/, "");

if (typeof __DEV__ !== "undefined" && __DEV__) {
  console.log(`[API] Using backend ${API_BASE_URL}`);
}

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
  requestHeaders.Accept = requestHeaders.Accept || "application/json";

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
      throw new Error(`Request timed out while connecting to ${API_BASE_URL}. Check that your phone and backend are on the same network.`);
    }

    throw new Error(`Network request failed for ${API_BASE_URL}. Please confirm your phone can reach the backend server.`);
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
