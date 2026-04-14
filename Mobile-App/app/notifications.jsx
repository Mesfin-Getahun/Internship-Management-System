import React from "react";
import { ScrollView, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Card from "../components/ui/Card";
import { getStudentDashboardData } from "../assets/mockData";

export default function NotificationsScreen() {
  const notifications = getStudentDashboardData().notifications;

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#7C3AED] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Notifications</Text>
          <Text className="mt-2 text-sm leading-6 text-violet-100">
            Stay updated with approvals, reports, reminders, and UIL document uploads.
          </Text>
        </View>

        {notifications.map((item) => (
          <Card key={item.id} className="mb-4">
            <View className="flex-row items-start">
              <View className={`mr-3 h-12 w-12 items-center justify-center rounded-full ${item.unread ? "bg-blue-50" : "bg-slate-100"}`}>
                <FontAwesome name={item.icon} size={18} color={item.unread ? "#2563EB" : "#64748B"} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className={`flex-1 pr-3 text-sm ${item.unread ? "font-bold text-slate-800" : "font-semibold text-slate-700"}`}>
                    {item.title}
                  </Text>
                  <Text className="text-xs text-slate-400">{item.time}</Text>
                </View>
                <Text className="mt-2 text-sm leading-6 text-slate-500">{item.message}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
