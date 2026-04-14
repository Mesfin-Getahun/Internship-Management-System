import React from "react";
import { View, Text } from "react-native";

function getBadgeStyle(statusVal) {
  switch (statusVal?.toLowerCase()) {
    case "waiting":
      return { bg: "bg-orange-100", text: "text-orange-600" };
    case "approved":
    case "available":
      return { bg: "bg-blue-100", text: "text-blue-600" };
    case "active":
      return { bg: "bg-green-100", text: "text-green-600" };
    case "completed":
      return { bg: "bg-slate-200", text: "text-slate-600" };
    case "not available":
      return { bg: "bg-slate-100", text: "text-slate-500" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-500" };
  }
}

export default function Badge({ status, className = "" }) {
  const styles = getBadgeStyle(status);

  return (
    <View className={`self-start rounded-full px-3 py-1 ${styles.bg} ${className}`}>
      <Text className={`text-xs font-bold uppercase tracking-[1.2px] ${styles.text}`}>{status}</Text>
    </View>
  );
}
