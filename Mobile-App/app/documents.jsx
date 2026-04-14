import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import EmptyState from "../components/common/EmptyState";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { getStudentDashboardData } from "../assets/mockData";

export default function DocumentsScreen() {
  const documents = getStudentDashboardData().documents;
  const availableDocuments = documents.filter((item) => item.status === "Available");

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#0F766E] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Documents</Text>
          <Text className="mt-2 text-sm leading-6 text-teal-100">
            Access official letters, evaluation files, and shared internship documents.
          </Text>
        </View>

        {availableDocuments.length === 0 ? (
          <EmptyState
            iconName="folder-open"
            title="Documents not available yet"
            description="Uploaded recommendation letters, acceptance letters, and evaluation forms will show up here."
          />
        ) : (
          documents.map((item) => (
            <Card key={item.id} className="mb-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-bold text-slate-800">{item.title}</Text>
                  <Text className="mt-1 text-sm text-slate-500">{item.issuedBy}</Text>
                  <Text className="mt-2 text-xs text-slate-400">{`${item.format} • ${item.updatedAt}`}</Text>
                </View>
                <Badge status={item.status} />
              </View>

              <View className="mt-5 flex-row">
                <TouchableOpacity
                  className={`mr-3 flex-1 flex-row items-center justify-center rounded-2xl px-4 py-3 ${item.status === "Available" ? "bg-blue-600" : "bg-slate-200"}`}
                  activeOpacity={0.85}
                  disabled={item.status !== "Available"}
                  onPress={() => Alert.alert("View PDF", `Open ${item.title} PDF viewer.`)}
                >
                  <FontAwesome name="eye" size={14} color={item.status === "Available" ? "#FFFFFF" : "#94A3B8"} />
                  <Text className={`ml-2 text-sm font-semibold ${item.status === "Available" ? "text-white" : "text-slate-400"}`}>
                    View
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`mr-3 flex-1 flex-row items-center justify-center rounded-2xl px-4 py-3 ${item.status === "Available" ? "bg-slate-100" : "bg-slate-200"}`}
                  activeOpacity={0.85}
                  disabled={item.status !== "Available"}
                  onPress={() => Alert.alert("Download", `Download flow for ${item.title} can be linked next.`)}
                >
                  <FontAwesome name="download" size={14} color={item.status === "Available" ? "#334155" : "#94A3B8"} />
                  <Text className={`ml-2 text-sm font-semibold ${item.status === "Available" ? "text-slate-700" : "text-slate-400"}`}>
                    Download
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center rounded-2xl px-4 py-3 ${item.status === "Available" ? "bg-slate-100" : "bg-slate-200"}`}
                  activeOpacity={0.85}
                  disabled={item.status !== "Available"}
                  onPress={() => Alert.alert("Share", `Share sheet for ${item.title} can be integrated next.`)}
                >
                  <FontAwesome name="share-alt" size={14} color={item.status === "Available" ? "#334155" : "#94A3B8"} />
                  <Text className={`ml-2 text-sm font-semibold ${item.status === "Available" ? "text-slate-700" : "text-slate-400"}`}>
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
