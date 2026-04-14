import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Header({ studentName }) {
  const router = useRouter();

  return (
    <View className="mb-6 rounded-[32px] bg-[#0B5AD9] px-5 pb-5 pt-5">
      <View className="absolute -right-8 -top-4 h-32 w-32 rounded-full bg-white/10" />
      <View className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-sky-300/20" />
      <View className="mb-5 flex-row items-center justify-between">
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          activeOpacity={0.8}
          onPress={() => router.push("/profile")}
        >
          <View className="mr-3 h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/15">
            <FontAwesome name="user" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-sm font-medium text-blue-100">Welcome back</Text>
            <Text className="text-xl font-bold text-white">{studentName}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="relative h-11 w-11 items-center justify-center rounded-full bg-white/15"
          activeOpacity={0.8}
          onPress={() => router.push("/notifications")}
        >
          <FontAwesome name="bell" size={18} color="#FFFFFF" />
          <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        <View className="mr-3 flex-1 rounded-[22px] bg-white/12 px-4 py-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-blue-100">Current Track</Text>
          <Text className="mt-2 text-base font-bold text-white">Frontend Internship</Text>
        </View>
        <View className="flex-1 rounded-[22px] bg-white px-4 py-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Status</Text>
          <Text className="mt-2 text-base font-bold text-slate-800">Waiting Approval</Text>
        </View>
      </View>
    </View>
  );
}
