import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { FontAwesome } from "@expo/vector-icons";
import Card from "../ui/Card";

export default function AttendanceChart({ present, absent, onPress }) {
  const chartWidth = Dimensions.get("window").width - 64;
  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [present, absent],
        colors: [
          () => "rgba(16, 185, 129, 1)",
          () => "rgba(239, 68, 68, 1)",
        ],
      },
    ],
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Card className="mb-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-800">Attendance Summary</Text>
          <View className="flex-row items-center rounded-full bg-slate-100 px-3 py-1">
            <FontAwesome name="bar-chart" size={12} color="#64748B" />
            <Text className="ml-2 text-xs font-medium text-slate-500">This Month</Text>
          </View>
        </View>

        <View className="mb-4 flex-row">
          <View className="flex-1 rounded-[22px] bg-emerald-50 p-4">
            <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-emerald-700">Present Days</Text>
            <Text className="mt-2 text-3xl font-bold text-emerald-600">{present}</Text>
          </View>
          <View className="w-3" />
          <View className="flex-1 rounded-[22px] bg-rose-50 p-4">
            <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-rose-700">Absent Days</Text>
            <Text className="mt-2 text-3xl font-bold text-rose-500">{absent}</Text>
          </View>
        </View>

        <View className="overflow-hidden rounded-[24px] bg-slate-50 pt-3">
          <BarChart
            data={data}
            width={chartWidth}
            height={210}
            fromZero
            showValuesOnTopOfBars
            withCustomBarColorFromData
            flatColor
            chartConfig={{
              backgroundGradientFrom: "#F8FAFC",
              backgroundGradientTo: "#F8FAFC",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: () => "#64748B",
              barPercentage: 0.7,
            }}
            style={{ borderRadius: 16 }}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
