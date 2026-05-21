import React from "react";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Card from "../ui/Card";

export default function ReportCard({ report }) {
  const supervisorName = report?.supervisorName || "Mentor";
  const supervisorInitial = supervisorName.charAt(0).toUpperCase() || "M";
  const reportMessage = report?.message || "No feedback message available.";
  const reportDate = report?.date || "Recently";

  return (
    <Card className="mb-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">Supervisor Report</Text>
        <FontAwesome name="commenting" size={18} color="#2563EB" />
      </View>

      <View className="rounded-[24px] bg-slate-50 dark:bg-slate-800/80 p-4">
        <Text className="text-sm leading-6 text-slate-700 dark:text-slate-200">{`"${reportMessage}"`}</Text>
        <View className="mt-4 flex-row items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
          <View className="flex-row items-center">
            <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Text className="text-xs font-bold text-blue-700 dark:text-blue-300">{supervisorInitial}</Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">{supervisorName}</Text>
              <Text className="text-xs text-slate-400 dark:text-slate-400">Company Supervisor</Text>
            </View>
          </View>
          <Text className="text-xs text-slate-400 dark:text-slate-400">{reportDate}</Text>
        </View>
      </View>
    </Card>
  );
}
