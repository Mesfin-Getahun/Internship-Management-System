import React from "react";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Card from "../ui/Card";

export default function ReportCard({ report }) {
  return (
    <Card className="mb-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-slate-800">Supervisor Report</Text>
        <FontAwesome name="commenting" size={18} color="#2563EB" />
      </View>

      <View className="rounded-[24px] bg-slate-50 p-4">
        <Text className="text-sm leading-6 text-slate-700">{`"${report.message}"`}</Text>
        <View className="mt-4 flex-row items-center justify-between border-t border-slate-200 pt-3">
          <View className="flex-row items-center">
            <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Text className="text-xs font-bold text-blue-700">{report.supervisorName.charAt(0)}</Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-slate-700">{report.supervisorName}</Text>
              <Text className="text-xs text-slate-400">Company Supervisor</Text>
            </View>
          </View>
          <Text className="text-xs text-slate-400">{report.date}</Text>
        </View>
      </View>
    </Card>
  );
}
