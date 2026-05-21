import React from "react";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

export default function StatusCard({ status, organization, position, duration }) {
  const accent =
    status === "Waiting"
      ? "bg-amber-400"
      : status === "Approved"
        ? "bg-blue-400"
        : status === "Active"
          ? "bg-emerald-400"
          : "bg-slate-400";

  return (
    <Card className="mb-5 p-0">
      <View className={`h-2 w-full ${accent}`} />
      <View className="p-5">
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="mb-1 text-xs font-semibold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-400">
            Internship Status
          </Text>
          <Text className="text-xl font-bold text-slate-800 dark:text-slate-100">{organization}</Text>
          <Text className="mt-1 text-base font-medium text-slate-600 dark:text-slate-300">{position}</Text>
        </View>
        <Badge status={status} />
      </View>

      <View className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4">
        <View className="mb-2 flex-row items-center">
          <FontAwesome name="calendar" size={14} color="#64748B" />
          <Text className="ml-2 text-sm text-slate-600 dark:text-slate-300">{duration}</Text>
        </View>
        <View className="flex-row items-center">
          <FontAwesome name="info-circle" size={14} color="#64748B" />
          <Text className="ml-2 flex-1 text-sm text-slate-600 dark:text-slate-300">
            {status === "Waiting"
              ? "Awaiting confirmation from the university side."
              : status === "Approved"
                ? "Placement approved and ready for onboarding."
                : status === "Active"
                  ? "Internship in progress. Keep your attendance updated."
                  : "Internship completed. Final review is pending."}
          </Text>
        </View>
      </View>
      </View>
    </Card>
  );
}
