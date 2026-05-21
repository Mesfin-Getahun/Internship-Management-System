import { Platform } from "react-native";
// import Constants from "expo-constants";
// import { registerStudentPushToken } from "./studentService";

// Mock implementation to avoid Expo Go SDK 53 crash
// Native push notifications are disabled while in standard Expo Go

export async function registerPushNotifications() {
  if (Platform.OS === "web") {
    return null;
  }
  console.log("Push notifications are disabled in Expo Go. Skipping registration.");
  return null;
}