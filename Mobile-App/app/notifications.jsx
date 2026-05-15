import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Card from "../components/ui/Card";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { getStudentNotifications } from "../services/studentService";

function getNotificationIcon(category, title) {
  if (category === "feedback") {
    return "commenting";
  }

  if (category === "application") {
    return title?.toLowerCase().includes("reject") ? "times-circle" : "check-circle";
  }

  return "bell";
}

function formatNotificationTime(value) {
  if (!value) {
    return "Recent";
  }

  return new Date(value).toLocaleString();
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentNotifications()
      .then((response) => {
        setNotifications(response.notifications || []);
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError.message || "Failed to load notifications");
        setLoading(false);
      });
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => Number(item.is_read) === 0).length,
    [notifications]
  );

  if (loading) {
    return (
      <Screen withTabs>
        <Loader label="Loading notifications..." />
      </Screen>
    );
  }

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#7C3AED] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Notifications</Text>
          <Text className="mt-2 text-sm leading-6 text-violet-100">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"} waiting for you.`
              : "You’re up to date. New alerts will appear here when your status changes."}
          </Text>
        </View>

        {error ? (
          <Card className="mb-4 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
          </Card>
        ) : null}

        {notifications.length === 0 ? (
          <EmptyState
            iconName="bell-o"
            title="No notifications yet"
            description="Application updates and feedback alerts will appear here as soon as they are created."
          />
        ) : (
          notifications.map((item) => (
            <Card key={item.notification_id} className={`mb-4 border ${Number(item.is_read) ? "border-slate-100" : "border-blue-100"}`}>
              <View className="flex-row items-start">
                <View className={`mr-3 h-12 w-12 items-center justify-center rounded-full ${Number(item.is_read) ? "bg-slate-100" : "bg-blue-50"}`}>
                  <FontAwesome
                    name={getNotificationIcon(item.category, item.title)}
                    size={18}
                    color={Number(item.is_read) ? "#64748B" : "#2563EB"}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 pr-3 text-sm font-bold text-slate-800">{item.title}</Text>
                    <Text className="text-xs text-slate-400">{formatNotificationTime(item.created_at)}</Text>
                  </View>
                  <Text className="mt-1 text-xs font-semibold uppercase tracking-[1.2px] text-violet-500">
                    {item.category || "General"}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-slate-500">{item.body}</Text>
                  {Number(item.is_read) === 0 ? (
                    <View className="mt-3 self-start rounded-full bg-blue-50 px-3 py-1">
                      <Text className="text-xs font-semibold text-blue-700">Unread</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}