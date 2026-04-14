import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getStudentDashboardData } from "../assets/mockData";

export default function InternshipsScreen() {
  const [savedIds, setSavedIds] = useState([]);
  const opportunities = getStudentDashboardData().opportunities;

  const toggleSave = (id) => {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#0B5AD9] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Internship Opportunities</Text>
          <Text className="mt-2 text-sm leading-6 text-blue-100">
            Browse openings, save the interesting ones, and apply from one place.
          </Text>
        </View>

        {opportunities.map((item) => {
          const isSaved = savedIds.includes(item.id);
          return (
            <Card key={item.id} className="mb-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-lg font-bold text-slate-800">{item.company}</Text>
                  <Text className="mt-1 text-base font-medium text-slate-600">{item.role}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.85} onPress={() => toggleSave(item.id)}>
                  <FontAwesome name={isSaved ? "bookmark" : "bookmark-o"} size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <View className="mt-4 flex-row flex-wrap">
                <View className="mb-2 mr-2 rounded-full bg-slate-100 px-3 py-2">
                  <Text className="text-xs font-semibold text-slate-600">{item.location}</Text>
                </View>
                <View className="mb-2 rounded-full bg-slate-100 px-3 py-2">
                  <Text className="text-xs font-semibold text-slate-600">{item.duration}</Text>
                </View>
              </View>

              <Text className="mt-2 text-sm leading-6 text-slate-500">{item.description}</Text>

              <View className="mt-5 flex-row">
                <Button
                  title="View Details"
                  variant="outline"
                  className="mr-3 flex-1"
                  onPress={() => Alert.alert(item.role, item.description)}
                />
                <Button
                  title="Apply"
                  className="flex-1"
                  onPress={() => Alert.alert("Application Submitted", `Application started for ${item.role}.`)}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
