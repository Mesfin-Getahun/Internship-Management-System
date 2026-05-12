import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Card from "../components/ui/Card";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { getStudentFeedbacks } from "../services/studentService";

function getFeedbackIcon(sourceRole) {
  return sourceRole === "company_mentor" ? "building" : "user";
}

export default function NotificationsScreen() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentFeedbacks()
      .then((response) => {
        setFeedbacks(response.feedbacks || []);
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError.message || "Failed to load feedback");
        setLoading(false);
      });
  }, []);

  const categorizedFeedbacks = useMemo(
    () => ({
      company: feedbacks.filter((item) => item.source_role === "company_mentor"),
      faculty: feedbacks.filter((item) => item.source_role !== "company_mentor"),
    }),
    [feedbacks]
  );

  if (loading) {
    return (
      <Screen withTabs>
        <Loader label="Loading feedback and evaluations..." />
      </Screen>
    );
  }

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#7C3AED] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Feedback & Evaluations</Text>
          <Text className="mt-2 text-sm leading-6 text-violet-100">
            Review performance notes and official evaluations from your company and faculty mentors.
          </Text>
        </View>

        {error ? (
          <Card className="mb-4 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
          </Card>
        ) : null}

        {feedbacks.length === 0 ? (
          <EmptyState
            iconName="commenting"
            title="No feedback yet"
            description="Evaluations from company mentors and faculty mentors will appear here once submitted."
          />
        ) : (
          <>
            <View className="mb-4">
              <Text className="mb-2 text-lg font-bold text-slate-800">Company Mentor Feedback</Text>
              <Text className="text-sm leading-6 text-slate-500">
                Workplace feedback and performance evaluations from your organization supervisor.
              </Text>
            </View>

            {categorizedFeedbacks.company.length === 0 ? (
              <Card className="mb-5">
                <Text className="text-sm leading-6 text-slate-500">No company mentor feedback has been submitted yet.</Text>
              </Card>
            ) : (
              categorizedFeedbacks.company.map((item) => (
                <Card key={`company-${item.feedback_id}`} className="mb-4">
                  <View className="flex-row items-start">
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                      <FontAwesome name={getFeedbackIcon(item.source_role)} size={18} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="flex-1 pr-3 text-sm font-bold text-slate-800">
                          {item.source_name || item.company_mentor_name || "Company Mentor"}
                        </Text>
                        <Text className="text-xs text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                        </Text>
                      </View>
                      <Text className="mt-1 text-xs font-semibold uppercase tracking-[1.2px] text-violet-500">
                        Company Mentor Feedback
                      </Text>
                      <Text className="mt-2 text-sm leading-6 text-slate-500">
                        {item.overall_comment || "No feedback comment provided."}
                      </Text>
                      {(item.strengths || item.weaknesses || item.suggestions) ? (
                        <View className="mt-3 rounded-[20px] bg-slate-50 p-4">
                          <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">
                            Strengths
                          </Text>
                          <Text className="mt-1 text-sm text-slate-600">{item.strengths || "Not provided"}</Text>
                          <Text className="mt-3 text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">
                            Weaknesses
                          </Text>
                          <Text className="mt-1 text-sm text-slate-600">{item.weaknesses || "Not provided"}</Text>
                          <Text className="mt-3 text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">
                            Suggestions
                          </Text>
                          <Text className="mt-1 text-sm text-slate-600">{item.suggestions || "Not provided"}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Card>
              ))
            )}

            <View className="mb-4 mt-2">
              <Text className="mb-2 text-lg font-bold text-slate-800">Faculty Mentor Feedback</Text>
              <Text className="text-sm leading-6 text-slate-500">
                Academic supervision notes and university-side evaluations.
              </Text>
            </View>

            {categorizedFeedbacks.faculty.length === 0 ? (
              <Card className="mb-5">
                <Text className="text-sm leading-6 text-slate-500">No faculty mentor feedback has been submitted yet.</Text>
              </Card>
            ) : (
              categorizedFeedbacks.faculty.map((item) => (
                <Card key={`faculty-${item.feedback_id}`} className="mb-4">
                  <View className="flex-row items-start">
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                      <FontAwesome name={getFeedbackIcon(item.source_role)} size={18} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="flex-1 pr-3 text-sm font-bold text-slate-800">
                          {item.source_name || item.mentor_name || "Faculty Mentor"}
                        </Text>
                        <Text className="text-xs text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                        </Text>
                      </View>
                      <Text className="mt-1 text-xs font-semibold uppercase tracking-[1.2px] text-violet-500">
                        Faculty Mentor Feedback
                      </Text>
                      <Text className="mt-2 text-sm leading-6 text-slate-500">
                        {item.overall_comment || "No feedback comment provided."}
                      </Text>
                      {item.rating ? (
                        <View className="mt-3 flex-row">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <FontAwesome
                              key={`${item.feedback_id}-rating-${index}`}
                              name="star"
                              size={14}
                              color={index < item.rating ? "#FBBF24" : "#CBD5E1"}
                              style={{ marginRight: 4 }}
                            />
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
