import React from "react";
import { Stack } from "expo-router";
import "../global.css";
import { ThemeProvider } from "../providers/ThemeProvider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="home" />
        <Stack.Screen name="status" />
        <Stack.Screen name="internships" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="evaluations" />
        <Stack.Screen name="documents" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="profile" />
      </Stack>
    </ThemeProvider>
  );
}
