import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../components/common/Screen";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import { applyForInternship } from "../services/studentService";
import { appendAssetToFormData, pickPdfDocument } from "../utils/documentUpload";

export default function InternshipDetailScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const item = data ? JSON.parse(data) : null;

  const [statement, setStatement] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [academicDocFile, setAcademicDocFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!item) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">Internship data not found.</Text>
          <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
        </View>
      </Screen>
    );
  }

  const handlePickFile = async (fieldName) => {
    const file = await pickPdfDocument();
    if (!file) return;

    if (fieldName === "cv") setCvFile(file);
    else setAcademicDocFile(file);
  };

  const handleSubmitApplication = async () => {
    if (!cvFile || !academicDocFile) {
      Alert.alert("Missing Files", "Please choose both your CV and academic document before applying.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("statement", statement);
    appendAssetToFormData(formData, "cv", cvFile);
    appendAssetToFormData(formData, "academic_doc", academicDocFile);

    try {
      await applyForInternship(item.internship_id || item.id, formData);
      setSuccess(true);
      setSubmitting(false);
    } catch (requestError) {
      setSubmitting(false);
      Alert.alert("Application Failed", requestError.message || "Unable to submit internship application.");
    }
  };

  if (success) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-32 w-32 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <FontAwesome name="check" size={60} color="#10B981" />
          </View>
          <Text className="mt-6 text-center text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Successfully Applied!
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-slate-500 dark:text-slate-400">
            Your application for {item.title} at {item.company_name} has been submitted securely.
          </Text>
          <Button
            title="Back to Opportunities"
            className="mt-8 w-full"
            onPress={() => router.back()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Detail Header Region */}
        <View className="w-full bg-[#0B5AD9] px-6 pb-8 pt-10">
          <TouchableOpacity className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-white/20" onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-extrabold text-white">{item.title}</Text>
          <Text className="mt-2 text-lg font-medium text-blue-100">{item.company_name}</Text>
        </View>

        {/* Info Grid */}
        <View className="-mt-4 flex-1 rounded-t-3xl bg-slate-50 dark:bg-slate-900 px-6 pt-8 pb-10">
          <Text className="text-xl font-bold text-slate-800 dark:text-slate-100">Description</Text>
          <Text className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">
            {item.description || "No specific description has been provided by the company."}
          </Text>

          <View className="mt-8 flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm">
            <View>
              <Text className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</Text>
              <Text className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">{item.location || "Remote"}</Text>
            </View>
            <FontAwesome name="map-marker" size={24} color="#0B5AD9" />
          </View>

          {/* Form Region */}
          <Text className="mt-10 text-xl font-bold text-slate-800 dark:text-slate-100">Apply Now</Text>
          <View className="mt-4">
            <InputField
              label="Statement (Optional)"
              iconName="file-text"
              placeholder="Why are you a great fit?"
              value={statement}
              onChangeText={setStatement}
              className="mb-5"
            />
            
            <TouchableOpacity
              className="mb-4 flex-row items-center justify-between rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5"
              activeOpacity={0.8}
              onPress={() => handlePickFile("cv")}
            >
              <View className="flex-row items-center">
                <FontAwesome name="file-pdf-o" size={24} color="#EF4444" className="mr-3" />
                <View className="ml-3">
                  <Text className="text-base font-bold text-slate-800 dark:text-slate-100">Upload CV</Text>
                  <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {cvFile ? cvFile.name : "Tap to pick PDF document"}
                  </Text>
                </View>
              </View>
              {cvFile && <FontAwesome name="check-circle" size={24} color="#10B981" />}
            </TouchableOpacity>

            <TouchableOpacity
              className="mb-8 flex-row items-center justify-between rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5"
              activeOpacity={0.8}
              onPress={() => handlePickFile("academic_doc")}
            >
              <View className="flex-row items-center">
                <FontAwesome name="graduation-cap" size={24} color="#3B82F6" className="mr-3" />
                <View className="ml-3">
                  <Text className="text-base font-bold text-slate-800 dark:text-slate-100">Academic Doc</Text>
                  <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {academicDocFile ? academicDocFile.name : "Tap to pick Grade Report"}
                  </Text>
                </View>
              </View>
              {academicDocFile && <FontAwesome name="check-circle" size={24} color="#10B981" />}
            </TouchableOpacity>

            <Button
              title="Submit Application"
              onPress={handleSubmitApplication}
              loading={submitting}
              className="py-4"
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
