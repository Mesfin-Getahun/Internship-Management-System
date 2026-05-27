import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Loader from "../components/common/Loader";
import Card from "../components/ui/Card";
import { getMyInternship } from "../services/studentService";
import { getInternshipProgressState } from "../utils/internshipProgress";
import { formatDate } from "../utils/dateFormat";

function InfoCard({ iconName, label, value, subValue }) {
  return (
    <View className="rounded-[22px] bg-slate-50 p-4">
      <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">{label}</Text>
      <View className="mt-3 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
          <FontAwesome name={iconName} size={18} color="#64748B" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-slate-800">{value || "N/A"}</Text>
          {subValue ? <Text className="mt-1 text-xs text-slate-500">{subValue}</Text> : null}
        </View>
      </View>
    </View>
  );
}

export default function InternshipStatusScreen() {
  const [internship, setInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyInternship()
      .then((response) => {
        setInternship(response.internship || null);
        setApplications(response.applications || []);
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError.message || "Failed to load internship status");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Screen withTabs>
        <Loader label="Loading internship status..." />
      </Screen>
    );
  }

  const activeStatus = (internship?.status || "").toLowerCase();
  const hasActivePlacement =
    internship && (activeStatus === "in progress" || activeStatus === "accepted" || activeStatus === "active");
  const progressState = getInternshipProgressState(internship || {});
  const progressColor = progressState.dormant ? "bg-slate-400" : "bg-blue-500";

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#14532D] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Internship Status</Text>
          <Text className="mt-2 text-sm leading-6 text-emerald-100">
            Review your current placement, supervisors, and activation progress.
          </Text>
        </View>

        {error ? (
          <Card className="mb-5 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
          </Card>
        ) : null}

        {!hasActivePlacement ? (
          <Card className="mb-5">
            <View className="items-center py-8">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                <FontAwesome name="briefcase" size={30} color="#15803D" />
              </View>
              <Text className="text-xl font-bold text-slate-800">No Active Placement</Text>
              <Text className="mt-2 max-w-[320px] text-center text-sm leading-6 text-slate-500">
                Your internship is not active yet. Apply through the opportunities screen and wait for approval.
              </Text>
            </View>
          </Card>
        ) : (
          <Card className="mb-5">
            <View className="flex-row items-start">
              <View className="mr-4 h-20 w-20 items-center justify-center rounded-[24px] bg-emerald-50">
                <Text className="text-3xl font-bold text-emerald-700">
                  {internship.company_name ? internship.company_name.charAt(0).toUpperCase() : "I"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-slate-800">{internship.title}</Text>
                <View className="mt-3 self-start rounded-full bg-emerald-100 px-3 py-1">
                  <Text className="text-xs font-bold uppercase tracking-[1.2px] text-emerald-700">
                    {internship.status}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-6 grid gap-3">
              <View className="rounded-[22px] bg-slate-50 p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Progress</Text>
                  <View className={`rounded-full px-3 py-1 ${progressState.dormant ? "bg-slate-100" : "bg-green-100"}`}>
                    <Text className={`text-xs font-bold ${progressState.dormant ? "text-slate-700" : "text-green-700"}`}>
                      {progressState.label}
                    </Text>
                  </View>
                </View>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-slate-800">Internship timeline</Text>
                  <Text className="text-sm font-bold text-blue-600">{progressState.progress}%</Text>
                </View>
                <View className="h-3 overflow-hidden rounded-full bg-white">
                  <View className={`h-full rounded-full ${progressColor}`} style={{ width: `${progressState.progress}%` }} />
                </View>
                <Text className="mt-3 text-xs leading-5 text-slate-500">{progressState.message}</Text>
              </View>
              <InfoCard iconName="building" label="Organization" value={internship.company_name} />
              <InfoCard
                iconName="user"
                label="Company Supervisor"
                value={internship.company_mentor_name}
                subValue="Internship Supervisor"
              />
              <InfoCard
                iconName="user"
                label="Assigned Mentor"
                value={internship.university_mentor_name}
                subValue="Faculty Advisor"
              />
              <InfoCard iconName="map-marker" label="Location" value={internship.location} />
            </View>
          </Card>
        )}

        <Card className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-800">Application Timeline</Text>
          {applications.length ? (
            applications.slice(0, 5).map((application) => (
              <View key={application.application_id} className="mb-3 rounded-[22px] bg-slate-50 p-4">
                <Text className="text-base font-bold text-slate-800">{application.title}</Text>
                <Text className="mt-1 text-sm text-slate-500">{application.company_name}</Text>
                <Text className="mt-2 text-xs uppercase tracking-[1.2px] text-slate-400">
                  Status: {application.status}
                </Text>
                <Text className="mt-1 text-xs text-slate-400">Applied on {formatDate(application.applied_date)}</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm leading-6 text-slate-500">
              You have not submitted any internship applications yet.
            </Text>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
