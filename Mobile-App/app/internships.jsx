import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  applyForInternship,
  getStudentInternships,
  getSuggestedInternships,
} from "../services/studentService";
import { appendAssetToFormData, pickPdfDocument } from "../utils/documentUpload";
import { formatDateRange } from "../utils/dateFormat";

function formatDuration(item) {
  if (item.start_date && item.end_date) {
    return formatDateRange(item.start_date, item.end_date);
  }

  return item.duration || "Duration not specified";
}

export default function InternshipsScreen() {
  const [savedIds, setSavedIds] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeApplyId, setActiveApplyId] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [academicDocFile, setAcademicDocFile] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const loadInternships = () => {
    setLoading(true);
    setError("");

    Promise.allSettled([getStudentInternships(), getSuggestedInternships()]).then(
      ([internshipsResult, suggestionsResult]) => {
        if (internshipsResult.status === "fulfilled") {
          setOpportunities(internshipsResult.value.internships || []);
        } else {
          setError(internshipsResult.reason?.message || "Failed to load internships");
        }

        if (suggestionsResult.status === "fulfilled") {
          setSuggestions(suggestionsResult.value.suggestions || []);
        } else {
          setSuggestions([]);
        }

        setLoading(false);
      }
    );
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const toggleSave = (id) => {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const resetApplicationForm = () => {
    setActiveApplyId(null);
    setCvFile(null);
    setAcademicDocFile(null);
    setSubmittingId(null);
  };

  const handlePickFile = async (fieldName) => {
    const file = await pickPdfDocument();

    if (!file) {
      return;
    }

    if (fieldName === "cv") {
      setCvFile(file);
      return;
    }

    setAcademicDocFile(file);
  };

  const handleSubmitApplication = async (internshipId) => {
    if (!cvFile || !academicDocFile) {
      Alert.alert("Missing Files", "Please choose both your CV and academic document before applying.");
      return;
    }

    setSubmittingId(internshipId);

    const formData = new FormData();
    appendAssetToFormData(formData, "cv", cvFile);
    appendAssetToFormData(formData, "academic_doc", academicDocFile);

    try {
      const response = await applyForInternship(internshipId, formData);
      Alert.alert("Application Sent", response.message || "Application submitted successfully.");
      resetApplicationForm();
      loadInternships();
    } catch (requestError) {
      setSubmittingId(null);
      Alert.alert("Application Failed", requestError.message || "Unable to submit internship application.");
    }
  };

  if (loading) {
    return (
      <Screen withTabs>
        <Loader label="Loading available internships..." />
      </Screen>
    );
  }

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

        {suggestions.length > 0 ? (
          <Card className="mb-4 border border-blue-100 bg-blue-50/70">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-800">Recommended for You</Text>
              <FontAwesome name="sparkles" size={18} color="#2563EB" />
            </View>
            {suggestions.slice(0, 3).map((item) => (
              <View key={item.internship_id} className="mb-3 rounded-[22px] bg-white p-4 last:mb-0">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-bold text-slate-800">{item.company}</Text>
                    <Text className="mt-1 text-sm font-medium text-slate-600">{item.title}</Text>
                  </View>
                  <View className="rounded-full bg-blue-100 px-3 py-1">
                    <Text className="text-xs font-bold text-blue-700">{item.match_score || 0}</Text>
                  </View>
                </View>
                <Text className="mt-2 text-xs text-slate-500">{item.location || "Location not specified"}</Text>
                {item.matched_skills?.length ? (
                  <Text className="mt-2 text-xs leading-5 text-slate-500">
                    Matched skills: {item.matched_skills.join(", ")}
                  </Text>
                ) : null}
              </View>
            ))}
          </Card>
        ) : null}

        {error ? (
          <Card className="mb-4 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
            <View className="mt-3">
              <Button title="Try Again" variant="outline" onPress={loadInternships} />
            </View>
          </Card>
        ) : null}

        {opportunities.length === 0 ? (
          <EmptyState
            iconName="briefcase"
            title="No internships available"
            description="Approved internship opportunities will appear here once they are published."
          />
        ) : opportunities.map((item) => {
          const internshipId = item.internship_id || item.id;
          const isSaved = savedIds.includes(internshipId);
          return (
            <Card key={internshipId} className="mb-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-lg font-bold text-slate-800">{item.company_name}</Text>
                  <Text className="mt-1 text-base font-medium text-slate-600">{item.title}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.85} onPress={() => toggleSave(internshipId)}>
                  <FontAwesome name={isSaved ? "bookmark" : "bookmark-o"} size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <View className="mt-4 flex-row flex-wrap">
                <View className="mb-2 mr-2 rounded-full bg-slate-100 px-3 py-2">
                  <Text className="text-xs font-semibold text-slate-600">{item.location}</Text>
                </View>
                <View className="mb-2 rounded-full bg-slate-100 px-3 py-2">
                  <Text className="text-xs font-semibold text-slate-600">{formatDuration(item)}</Text>
                </View>
              </View>

              <Text className="mt-2 text-sm leading-6 text-slate-500">{item.description}</Text>

              <View className="mt-5 flex-row">
                <Button
                  title="View Details"
                  variant="outline"
                  className="mr-3 flex-1"
                  onPress={() =>
                    Alert.alert(
                      item.title,
                      `Company: ${item.company_name}\nLocation: ${item.location || "Not specified"}\n\n${item.description || "No description provided."}`
                    )
                  }
                />
                <Button
                  title={activeApplyId === internshipId ? "Close Form" : "Apply"}
                  className="flex-1"
                  onPress={() => {
                    if (activeApplyId === internshipId) {
                      resetApplicationForm();
                      return;
                    }

                    setActiveApplyId(internshipId);
                    setCvFile(null);
                    setAcademicDocFile(null);
                  }}
                />
              </View>

              {activeApplyId === internshipId ? (
                <View className="mt-4 rounded-[22px] bg-slate-50 p-4">
                  <Text className="mb-3 text-base font-bold text-slate-800">Apply for this internship</Text>
                  <Text className="mb-4 text-sm leading-6 text-slate-500">
                    Upload your CV and academic document as PDF files.
                  </Text>

                  <TouchableOpacity
                    className="mb-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4"
                    activeOpacity={0.85}
                    onPress={() => handlePickFile("cv")}
                  >
                    <Text className="text-sm font-semibold text-slate-700">
                      {cvFile ? `CV: ${cvFile.name}` : "Choose CV PDF"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4"
                    activeOpacity={0.85}
                    onPress={() => handlePickFile("academic_doc")}
                  >
                    <Text className="text-sm font-semibold text-slate-700">
                      {academicDocFile ? `Academic Document: ${academicDocFile.name}` : "Choose Academic Document PDF"}
                    </Text>
                  </TouchableOpacity>

                  <Button
                    title="Submit Application"
                    onPress={() => handleSubmitApplication(internshipId)}
                    loading={submittingId === internshipId}
                    disabled={submittingId === internshipId}
                  />
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
