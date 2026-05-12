import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Linking } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Loader from "../components/common/Loader";
import { getRecommendationLetter } from "../services/studentService";

export default function DocumentsScreen() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecommendationLetter()
      .then((response) => {
        setRecommendation(response.recommendation || null);
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError.message || "Failed to load recommendation letter");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Screen withTabs>
        <Loader label="Checking for recommendation letter..." />
      </Screen>
    );
  }

  const isAvailable = Boolean(recommendation?.available && recommendation?.file_url);
  const documentItem = {
    id: "recommendation-letter",
    title: recommendation?.file_name || "Recommendation Letter",
    issuedBy: "UIL Office",
    status: isAvailable ? "Available" : "Not Available",
    updatedAt: recommendation?.updated_at
      ? `Published: ${new Date(recommendation.updated_at).toLocaleString()}`
      : "Waiting for UIL attachment",
    description: isAvailable
      ? "UIL has published a recommendation letter for students. You can open or download it below."
      : "This document will become available here when the UIL office uploads and attaches your recommendation letter.",
    fileUrl: recommendation?.file_url || null,
  };

  return (
    <Screen withTabs>
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 rounded-[30px] bg-[#0F766E] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Documents</Text>
          <Text className="mt-2 text-sm leading-6 text-teal-100">
            Documents sent by the UIL office will appear here. Until then, the download action stays inactive.
          </Text>
        </View>

        {error ? (
          <Card className="mb-4 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
          </Card>
        ) : null}

        <Card key={documentItem.id} className="mb-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-base font-bold text-slate-800">{documentItem.title}</Text>
              <Text className="mt-1 text-sm text-slate-500">{documentItem.issuedBy}</Text>
              <Text className="mt-2 text-xs text-slate-400">{documentItem.updatedAt}</Text>
            </View>
            <Badge status={documentItem.status} />
          </View>

          <Text className="mt-4 text-sm leading-6 text-slate-500">{documentItem.description}</Text>

          <View className="mt-5 flex-row">
            <TouchableOpacity
              className={`mr-3 flex-1 flex-row items-center justify-center rounded-2xl px-4 py-3 ${
                isAvailable ? "bg-blue-600" : "bg-slate-200"
              }`}
              activeOpacity={0.85}
              disabled={!isAvailable}
              onPress={async () => {
                if (!documentItem.fileUrl) {
                  Alert.alert(
                    "Document Not Ready",
                    "This document is still inactive until the UIL office uploads it."
                  );
                  return;
                }

                await Linking.openURL(documentItem.fileUrl);
              }}
            >
              <FontAwesome
                name="eye"
                size={14}
                color={isAvailable ? "#FFFFFF" : "#94A3B8"}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  isAvailable ? "text-white" : "text-slate-400"
                }`}
              >
                View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center rounded-2xl px-4 py-3 ${
                isAvailable ? "bg-slate-100" : "bg-slate-200"
              }`}
              activeOpacity={0.85}
              disabled={!isAvailable}
              onPress={async () => {
                if (!documentItem.fileUrl) {
                  Alert.alert(
                    "Document Not Ready",
                    "Download will be enabled when the UIL office attaches the recommendation letter."
                  );
                  return;
                }

                await Linking.openURL(documentItem.fileUrl);
              }}
            >
              <FontAwesome
                name="download"
                size={14}
                color={isAvailable ? "#334155" : "#94A3B8"}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  isAvailable ? "text-slate-700" : "text-slate-400"
                }`}
              >
                Download
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
