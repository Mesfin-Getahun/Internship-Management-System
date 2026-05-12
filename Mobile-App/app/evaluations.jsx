import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Card from "../components/ui/Card";
import { getStudentEvaluations } from "../services/studentService";

function openDocument(fileUrl) {
  if (!fileUrl) {
    Alert.alert("Unavailable", "This file has not been uploaded yet.");
    return;
  }

  Linking.openURL(fileUrl).catch(() => {
    Alert.alert("Open Failed", "Unable to open this document link.");
  });
}

export default function EvaluationsScreen() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentEvaluations()
      .then((response) => {
        setEvaluations(response.evaluations || []);
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError.message || "Failed to load evaluations");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Screen withTabs>
        <Loader label="Loading evaluations..." />
      </Screen>
    );
  }

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#5B21B6] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Evaluations</Text>
          <Text className="mt-2 text-sm leading-6 text-violet-100">
            Review company assessments and attendance PDFs linked to your internship evaluation.
          </Text>
        </View>

        {error ? (
          <Card className="mb-4 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
          </Card>
        ) : null}

        {evaluations.length === 0 ? (
          <EmptyState
            iconName="bar-chart"
            title="No evaluations yet"
            description="Once your company mentor submits assessment documents, they will appear here."
          />
        ) : (
          evaluations.map((evaluation) => (
            <Card key={evaluation.internship_evaluation_id} className="mb-4">
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-bold text-slate-800">
                    {evaluation.internship_title || "Internship Evaluation"}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500">{evaluation.company_name || "Company not listed"}</Text>
                </View>
                <View className="rounded-full bg-violet-100 px-3 py-1">
                  <Text className="text-xs font-bold text-violet-700">
                    {evaluation.total_mark ?? "N/A"}
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-slate-400">
                Published: {evaluation.created_at || "Not available"}
              </Text>

              <View className="mt-4 flex-row flex-wrap">
                <TouchableOpacity
                  className="mr-3 mb-3 flex-1 flex-row items-center justify-center rounded-2xl bg-blue-600 px-4 py-3"
                  activeOpacity={0.85}
                  onPress={() => openDocument(evaluation.assessment_pdf_url)}
                >
                  <FontAwesome name="file-text" size={14} color="#FFFFFF" />
                  <Text className="ml-2 text-sm font-semibold text-white">Assessment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mb-3 flex-1 flex-row items-center justify-center rounded-2xl bg-slate-100 px-4 py-3"
                  activeOpacity={0.85}
                  onPress={() => openDocument(evaluation.attendance_pdf_url)}
                >
                  <FontAwesome name="calendar" size={14} color="#334155" />
                  <Text className="ml-2 text-sm font-semibold text-slate-700">Attendance</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}