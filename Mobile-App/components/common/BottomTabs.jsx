import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";

const tabs = [
  { label: "Home", path: "/home", icon: "home" },
  { label: "Internships", path: "/internships", icon: "briefcase" },
  { label: "Documents", path: "/documents", icon: "file-text" },
  { label: "Notifications", path: "/notifications", icon: "bell" },
  { label: "Profile", path: "/profile", icon: "user" },
];

export default function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="bg-transparent px-4 pb-5 pt-2">
      <View className="flex-row items-center justify-between rounded-[28px] border border-slate-200 bg-white px-2 py-2 shadow-md">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <TouchableOpacity
              key={tab.path}
              className={`flex-1 items-center justify-center rounded-[22px] py-2 ${isActive ? "bg-blue-600" : ""}`}
              activeOpacity={0.8}
              onPress={() => router.replace(tab.path)}
            >
              <View className={`h-9 w-9 items-center justify-center rounded-full ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                <FontAwesome name={tab.icon} size={16} color={isActive ? "#FFFFFF" : "#64748B"} />
              </View>
              <Text className={`mt-1 text-[11px] font-bold ${isActive ? "text-white" : "text-slate-500"}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
