import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Card from "../ui/Card";

export default function NotificationPreview({ notifications }) {
  const router = useRouter();

  return (
    <Card className="mb-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-slate-800">Notifications</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/notifications")}>
          <Text className="text-sm font-semibold text-blue-600">See all</Text>
        </TouchableOpacity>
      </View>

      {notifications.slice(0, 3).map((item, index) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          onPress={() => router.push("/notifications")}
          className={`flex-row items-start rounded-[20px] py-3 ${index < 2 ? "border-b border-slate-100" : ""}`}
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-[16px] bg-slate-100">
            <FontAwesome name={item.icon} size={16} color={item.unread ? "#2563EB" : "#64748B"} />
          </View>
          <View className="flex-1">
            <Text className={`text-sm ${item.unread ? "font-bold text-slate-800" : "font-medium text-slate-700"}`}>
              {item.title}
            </Text>
            <Text className="mt-1 text-xs text-slate-400">{item.time}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </Card>
  );
}
