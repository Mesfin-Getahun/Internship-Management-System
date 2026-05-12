import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

export default function Loader({ className = "", label = "Loading..." }) {
  return (
    <View className={`flex-1 items-center justify-center p-10 ${className}`}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</Text>
    </View>
  );
}
