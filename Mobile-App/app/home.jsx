import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Screen from "../components/common/Screen";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Card from "../components/ui/Card";
import Header from "../components/home/Header";
import StatusCard from "../components/home/StatusCard";
import ReportCard from "../components/home/ReportCard";
import Badge from "../components/ui/Badge";
import { getCurrentSession } from "../services/authService";
import Button from "../components/ui/Button";
import { cancelStudentApplication, getMyInternship, getPaymentApplication, getStudentFeedbacks } from "../services/studentService";

function formatStatusLabel(status) {
  if (!status) {
    return "Waiting";
  }

  const value = status.toLowerCase();

  if (value === "in progress") return "Active";
  if (value === "pending") return "Waiting";
  if (value === "accepted" || value === "approved") return "Approved";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return "Schedule not available";
  }

  return [startDate, endDate].filter(Boolean).join(" to ");
}

export default function HomeScreen() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);

  const loadDashboard = async () => {
    setError("");
    setData(null);

    const [internshipResult, feedbackResult, paymentResult] = await Promise.allSettled([
      getMyInternship(),
      getStudentFeedbacks(),
      getPaymentApplication(),
    ]);

    const nextData = {
      internship: internshipResult.status === "fulfilled" ? internshipResult.value.internship : null,
      applications: internshipResult.status === "fulfilled" ? internshipResult.value.applications || [] : [],
      feedbacks: feedbackResult.status === "fulfilled" ? feedbackResult.value.feedbacks || [] : [],
      payment: paymentResult.status === "fulfilled" ? paymentResult.value.payment : null,
      paymentFeatureAvailable:
        paymentResult.status === "fulfilled"
          ? paymentResult.value.paymentFeatureAvailable !== false
          : true,
    };

    setData(nextData);

    const errors = [internshipResult, feedbackResult, paymentResult]
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason?.message)
      .filter(Boolean);

    if (errors.length > 0) {
      setError(errors[0]);
    }
  };

  useEffect(() => {
    loadDashboard().catch((requestError) => {
      setError(requestError.message || "Failed to load dashboard");
      setData({
        internship: null,
        applications: [],
        feedbacks: [],
        payment: null,
        paymentFeatureAvailable: true,
      });
    });
  }, []);

  const handleCancelApplication = (applicationId) => {
    Alert.alert(
      "Cancel Application",
      "Are you sure you want to cancel this internship application?",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Cancel Application",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelingId(applicationId);
              const response = await cancelStudentApplication(applicationId);
              setCancelingId(null);
              Alert.alert("Application Cancelled", response.message || "Application cancelled successfully.");
              loadDashboard();
            } catch (requestError) {
              setCancelingId(null);
              Alert.alert("Cancel Failed", requestError.message || "Unable to cancel the application.");
            }
          },
        },
      ],
    );
  };

  if (!data && !error) {
    return (
      <Screen withTabs>
        <Loader label="Loading student dashboard..." />
      </Screen>
    );
  }

  const session = getCurrentSession();
  const studentName = session?.user?.full_name || "Student";
  const activeInternship = data?.internship || null;
  const latestApplication = data?.applications?.[0] || null;
  const latestFeedback = data?.feedbacks?.[0] || null;
  const payment = data?.payment || null;

  const statusLabel = formatStatusLabel(activeInternship?.status || latestApplication?.status);
  const currentTrack = activeInternship?.title || latestApplication?.title || "No active internship";
  const statusOrganization = activeInternship?.company_name || latestApplication?.company_name || "No company assigned";
  const statusPosition = activeInternship?.title || latestApplication?.title || "Waiting for application";
  const statusDuration = formatDateRange(
    activeInternship?.start_date || latestApplication?.start_date,
    activeInternship?.end_date || latestApplication?.end_date
  );

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <Header studentName={studentName} currentTrack={currentTrack} statusLabel={statusLabel} />

        {error ? (
          <Card className="mb-5 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
          </Card>
        ) : null}

        <StatusCard
          status={statusLabel}
          organization={statusOrganization}
          position={statusPosition}
          duration={statusDuration}
        />

        {activeInternship ? (
          <Card className="mb-5">
            <Text className="mb-3 text-lg font-bold text-slate-800">Current Internship Details</Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="mb-3 w-[48%] rounded-[22px] bg-slate-50 p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Company</Text>
                <Text className="mt-2 text-base font-bold text-slate-800">{activeInternship.company_name}</Text>
              </View>
              <View className="mb-3 w-[48%] rounded-[22px] bg-slate-50 p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Location</Text>
                <Text className="mt-2 text-base font-bold text-slate-800">{activeInternship.location || "Not set"}</Text>
              </View>
              <View className="w-[48%] rounded-[22px] bg-slate-50 p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Company Mentor</Text>
                <Text className="mt-2 text-base font-bold text-slate-800">
                  {activeInternship.company_mentor_name || "Not assigned"}
                </Text>
              </View>
              <View className="w-[48%] rounded-[22px] bg-slate-50 p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">University Mentor</Text>
                <Text className="mt-2 text-base font-bold text-slate-800">
                  {activeInternship.university_mentor_name || "Not assigned"}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <EmptyState
            iconName="briefcase"
            title="No active internship yet"
            description="Once an application is approved or an internship starts, the details will appear here."
          />
        )}

        {latestFeedback ? (
          <ReportCard
            report={{
              message: latestFeedback.overall_comment || latestFeedback.suggestions || "Feedback received from your mentor.",
              supervisorName: latestFeedback.source_name || "Mentor",
              date: latestFeedback.created_at || "Recently",
            }}
          />
        ) : (
          <Card className="mb-5">
            <Text className="mb-2 text-lg font-bold text-slate-800">Latest Feedback</Text>
            <Text className="text-sm leading-6 text-slate-500">
              No mentor feedback has been posted yet. New feedback will show up here once it is submitted.
            </Text>
          </Card>
        )}

        <Card className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-800">Recent Applications</Text>
          {data?.applications?.length ? (
            data.applications.slice(0, 3).map((application) => (
              <View
                key={application.application_id}
                className="mb-3 rounded-[22px] bg-slate-50 p-4"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="mr-3 flex-1 text-base font-bold text-slate-800">{application.title}</Text>
                  <Badge status={formatStatusLabel(application.status)} />
                </View>
                <Text className="text-sm text-slate-500">{application.company_name}</Text>
                <Text className="mt-2 text-xs text-slate-400">Applied on {application.applied_date}</Text>
                {application.status?.toLowerCase() === "pending" ? (
                  <View className="mt-3">
                    <Button
                      title="Cancel Application"
                      variant="outline"
                      onPress={() => handleCancelApplication(application.application_id)}
                      loading={cancelingId === application.application_id}
                      disabled={cancelingId === application.application_id}
                    />
                  </View>
                ) : null}
              </View>
            ))
          ) : (
            <Text className="text-sm leading-6 text-slate-500">
              You have not submitted any internship applications yet.
            </Text>
          )}
        </Card>

        <Card className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-800">Payment Application</Text>
          {payment ? (
            <View className="rounded-[22px] bg-slate-50 p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-bold text-slate-800">{payment.bank_name || "Bank details submitted"}</Text>
                <Badge status={payment.status || "Pending"} />
              </View>
              <Text className="text-sm text-slate-500">{payment.account_holder || "Account holder not available"}</Text>
              <Text className="mt-2 text-xs text-slate-400">
                Account: {payment.account_number || "Not available"}
              </Text>
            </View>
          ) : (
            <Text className="text-sm leading-6 text-slate-500">
              No payment application has been submitted yet.
            </Text>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
