import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { updatePassword } from "../assets/mockData";

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", width: "33%", color: "bg-rose-500" };
  if (score <= 3) return { label: "Medium", width: "66%", color: "bg-amber-500" };
  return { label: "Strong", width: "100%", color: "bg-emerald-500" };
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(newPassword), [newPassword]);

  const handleSubmit = () => {
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      const result = updatePassword(currentPassword, newPassword);
      setLoading(false);

      if (!result.success) {
        setError(result.error);
        return;
      }

      Alert.alert("Password Updated", "Your password has been changed successfully.", [
        { text: "Continue", onPress: () => router.replace("/home") },
      ]);
    }, 700);
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
          <View className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-blue-200/35" />
          <View className="absolute -right-12 top-24 h-64 w-64 rounded-full bg-sky-200/35" />
          <View className="absolute bottom-0 left-0 right-0 h-[42%] rounded-t-[56px] bg-[#0B5AD9]" />

          <View className="mb-8 items-center px-4">
            <View className="mb-5 h-20 w-20 items-center justify-center rounded-[28px] border border-white/70 bg-white shadow-md">
              <FontAwesome name="shield" size={32} color="#2563EB" />
            </View>
            <Text className="text-center text-3xl font-extrabold text-slate-900">Secure Your Account</Text>
            <Text className="mt-3 max-w-[300px] text-center text-sm leading-6 text-slate-500">
              First login detected. Create a stronger password before entering the student app.
            </Text>
          </View>

          <View className="rounded-[34px] border border-white/70 bg-white px-6 py-7 shadow-md">
            <View className="mb-6">
              <Text className="text-2xl font-bold text-slate-900">Change Password</Text>
              <Text className="mt-2 text-sm leading-6 text-slate-500">
                Choose a password you will remember and use going forward.
              </Text>
            </View>

            <InputField
              label="Current Password"
              iconName="lock"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              className="mb-4"
            />
            <InputField
              label="New Password"
              iconName="key"
              placeholder="Choose a new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              className="mb-4"
            />
            <InputField
              label="Confirm Password"
              iconName="check"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              className="mb-2"
            />

            {error ? (
              <View className="mb-4 mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <Text className="text-sm font-medium text-rose-600">{error}</Text>
              </View>
            ) : null}

            <View className="mb-6 mt-2 rounded-[24px] bg-slate-50 p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-slate-700">Password Strength</Text>
                <Text className="text-sm font-semibold text-slate-500">{newPassword ? strength.label : "Not set"}</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-slate-200">
                <View className={`h-full rounded-full ${strength.color}`} style={{ width: strength.width }} />
              </View>
              <Text className="mt-3 text-xs leading-5 text-slate-400">
                Strong passwords use uppercase letters, numbers, symbols, and at least 8 characters.
              </Text>
            </View>

            <Button
              title="Continue to App"
              onPress={handleSubmit}
              loading={loading}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className="rounded-[20px] bg-[#0B5AD9] shadow-md"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
