import React from "react";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function EmptyState({ iconName, title, description, action }) {
  return (
    <View className="items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-10">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-50">
        <FontAwesome name={iconName} size={32} color="#2563EB" />
      </View>
      <Text className="text-center text-xl font-bold text-slate-800">{title}</Text>
      <Text className="mt-2 text-center text-base leading-6 text-slate-500">{description}</Text>
      <View className="mt-6">{action}</View>
    </View>
  );
}
