import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { login } from "../services/authService";
import { getApiBaseUrl } from "../services/apiClient";

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");

    login({ identifier, password })
      .then((result) => {
        setLoading(false);

        if (result.firstLogin) {
          router.replace("/change-password");
          return;
        }

        router.replace("/home");
      })
      .catch((requestError) => {
        setLoading(false);
        setError(requestError.message || "Unable to sign in");
      });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-[#F4F7FB]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center overflow-hidden px-5 py-10">
          <View className="absolute inset-0 bg-[#F4F7FB]" />
          <View className="absolute -left-20 top-8 h-52 w-52 rounded-full bg-sky-200/45" />
          <View className="absolute -right-16 top-24 h-64 w-64 rounded-full bg-blue-300/25" />
          <View className="absolute bottom-0 left-0 right-0 h-[40%] rounded-t-[56px] bg-[#0B5AD9]" />

          <View className="mb-8 items-center px-4">
            <View className="mb-5 h-20 w-20 items-center justify-center rounded-[28px] border border-white/70 bg-white shadow-md">
              <FontAwesome name="graduation-cap" size={34} color="#2563EB" />
            </View>
            <Text className="text-center text-3xl font-extrabold text-slate-900">Student Internship Portal</Text>
            <Text className="mt-3 max-w-[300px] text-center text-sm leading-6 text-slate-500">
              Continue with your student credentials to manage internship progress and university documents.
            </Text>
          </View>

          <View className="rounded-[34px] border border-white/70 bg-white px-6 py-7 shadow-md">
            <View className="mb-6">
              <Text className="text-2xl font-bold text-slate-900">Sign In</Text>
              <Text className="mt-2 text-sm leading-6 text-slate-500">
                Welcome back. Access your dashboard, applications, and notifications here.
              </Text>
            </View>

            <InputField
              label="Username / Student ID / Email"
              iconName="user"
              placeholder="Enter your identifier"
              value={identifier}
              onChangeText={setIdentifier}
              className="mb-4"
            />

            <InputField
              label="Password"
              iconName="lock"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              helperText="Use your real student account password."
              className="mb-2"
            />

            {error ? (
              <View className="mb-4 mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <Text className="text-sm font-medium text-rose-600">{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.8}
              className="mb-6 mt-2 self-end"
              onPress={() =>
                Alert.alert("Forgot Password", "Password reset can be connected to your backend recovery flow.")
              }
            >
              <Text className="text-sm font-semibold text-blue-600">Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={!identifier.trim() || !password.trim()}
              className="rounded-[20px] bg-[#0B5AD9] shadow-md"
            />

            <View className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">
              <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-slate-400">Backend Login</Text>
              <Text className="mt-2 text-sm font-semibold text-slate-700">Use your student ID or email</Text>
              <Text className="mt-1 text-xs font-semibold text-slate-400">{getApiBaseUrl()}</Text>
              <Text className="mt-1 text-sm text-slate-500">
                If this is your first login, the app will send you to change your password before opening the
                dashboard.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
