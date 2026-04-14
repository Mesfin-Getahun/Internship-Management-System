import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const actions = [
  { label: "Browse Internships", icon: "search", path: "/internships", color: "#2563EB", bg: "bg-blue-50" },
  { label: "My Applications", icon: "briefcase", path: "/internships", color: "#0F766E", bg: "bg-teal-50" },
  { label: "Documents", icon: "file-text", path: "/documents", color: "#B45309", bg: "bg-amber-50" },
  { label: "Profile", icon: "user", path: "/profile", color: "#7C3AED", bg: "bg-violet-50" },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <View className="mb-5">
      <Text className="mb-3 text-lg font-bold text-slate-800">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            className="mb-4 w-[48%] rounded-[26px] border border-slate-100 bg-white p-4 shadow-sm"
            activeOpacity={0.85}
            onPress={() => router.push(action.path)}
          >
            <View className={`mb-4 h-14 w-14 items-center justify-center rounded-[18px] ${action.bg}`}>
              <FontAwesome name={action.icon} size={20} color={action.color} />
            </View>
            <Text className="text-sm font-semibold text-slate-700">{action.label}</Text>
            <Text className="mt-1 text-xs leading-5 text-slate-400">Open and manage this section</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
