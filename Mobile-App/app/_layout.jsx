import React from "react";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="home" />
      <Stack.Screen name="internships" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
