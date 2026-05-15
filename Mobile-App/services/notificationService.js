import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { registerStudentPushToken } from "./studentService";

let registeredToken = null;

async function getExpoPushToken() {
  if (Platform.OS === "web") {
    return null;
  }

  const permissionResult = await Notifications.getPermissionsAsync();
  let status = permissionResult.status;

  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    null;

  const tokenResult = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  return tokenResult.data;
}

export async function registerPushNotifications() {
  const expoPushToken = await getExpoPushToken();

  if (!expoPushToken || expoPushToken === registeredToken) {
    return expoPushToken;
  }

  await registerStudentPushToken(expoPushToken);
  registeredToken = expoPushToken;

  return expoPushToken;
}