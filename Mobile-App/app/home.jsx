import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../components/common/Screen";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Header from "../components/home/Header";
import StatusCard from "../components/home/StatusCard";
import ReportCard from "../components/home/ReportCard";
import Badge from "../components/ui/Badge";
import { getCurrentSession } from "../services/authService";
import Button from "../components/ui/Button";
import { cancelStudentApplication, getMyInternship, getPaymentApplication, getStudentFeedbacks, submitPaymentForm } from "../services/studentService";
import { registerPushNotifications } from "../services/notificationService";
import { appendAssetToFormData, pickPdfDocument } from "../utils/documentUpload";

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
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    registerPushNotifications().catch(() => {
      // Best effort only; the inbox still works even if push registration fails.
    });
  }, []);

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
    setPaymentForm({
      bankName: nextData.payment?.bank_name || "",
      accountHolder: nextData.payment?.account_holder || "",
      accountNumber: nextData.payment?.account_number || "",
    });

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



  const handleSubmitPayment = async () => {
    if (data?.paymentFeatureAvailable === false) {
      Alert.alert(
        "Payment Unavailable",
        "The payment application feature is not available yet because the backend payment table is missing."
      );
      return;
    }

    if (!paymentForm.bankName || !paymentForm.accountHolder || !paymentForm.accountNumber) {
      Alert.alert("Missing Details", "Please fill in your bank name, account holder, and account number.");
      return;
    }



    setSubmittingPayment(true);

    const formData = new FormData();
    formData.append("bankName", paymentForm.bankName);
    formData.append("accountHolder", paymentForm.accountHolder);
    formData.append("accountNumber", paymentForm.accountNumber);

    try {
      const response = await submitPaymentForm(formData);
      setSubmittingPayment(false);
      Alert.alert("Payment Submitted", response.message || "Payment application submitted successfully.");
      loadDashboard().catch(() => {});
    } catch (requestError) {
      setSubmittingPayment(false);
      Alert.alert("Payment Failed", requestError.message || "Unable to submit payment application.");
    }
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
          <Card className="mb-5 border border-rose-200 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-900/30">
            <Text className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</Text>
          </Card>
        ) : null}

        <StatusCard
          status={statusLabel}
          organization={statusOrganization}
          position={statusPosition}
          duration={statusDuration}
        />

        <View className="mb-5">
          <Button title="Open Internship Status" variant="outline" onPress={() => router.push("/status")} />
        </View>

        {activeInternship ? (
          <Card className="mb-5">
            <Text className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">Current Internship Details</Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="mb-3 w-[48%] rounded-[22px] bg-slate-50 dark:bg-slate-800/80 p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400 dark:text-slate-400">Company</Text>
                <Text className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">{activeInternship.company_name}</Text>
              </View>
              <View className="mb-3 w-[48%] rounded-[22px] bg-slate-50 dark:bg-slate-800/80 p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400 dark:text-slate-400">Location</Text>
                <Text className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">{activeInternship.location || "Not set"}</Text>
              </View>
              <View className="w-[48%] rounded-[22px] bg-slate-50 dark:bg-slate-800/80 p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400 dark:text-slate-400">Company Mentor</Text>
                <Text className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">
                  {activeInternship.company_mentor_name || "Not assigned"}
                </Text>
              </View>
              <View className="w-[48%] rounded-[22px] bg-slate-50 dark:bg-slate-800/80 p-4">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400 dark:text-slate-400">University Mentor</Text>
                <Text className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">
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
            <Text className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">Latest Feedback</Text>
            <Text className="text-sm leading-6 text-slate-500 dark:text-slate-300">
              No mentor feedback has been posted yet. New feedback will show up here once it is submitted.
            </Text>
          </Card>
        )}

        <Card className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">Recent Applications</Text>
          {data?.applications?.length ? (
            data.applications.slice(0, 3).map((application) => (
              <View
                key={application.application_id}
                className="mb-3 rounded-[22px] bg-slate-50 dark:bg-slate-800/80 p-4"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="mr-3 flex-1 text-base font-bold text-slate-800 dark:text-slate-100">{application.title}</Text>
                  <Badge status={formatStatusLabel(application.status)} />
                </View>
                <Text className="text-sm text-slate-500 dark:text-slate-300">{application.company_name}</Text>
                <Text className="mt-2 text-xs text-slate-400 dark:text-slate-400">Applied on {application.applied_date}</Text>
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
            <Text className="text-sm leading-6 text-slate-500 dark:text-slate-300">
              You have not submitted any internship applications yet.
            </Text>
          )}
        </Card>

        <Card className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">Payment Application</Text>
          {payment ? (
            <View className="rounded-[22px] bg-slate-50 dark:bg-slate-800/80 p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-bold text-slate-800 dark:text-slate-100">{payment.bank_name || "Bank details submitted"}</Text>
                <Badge status={payment.status || "Pending"} />
              </View>
              <Text className="text-sm text-slate-500 dark:text-slate-300">{payment.account_holder || "Account holder not available"}</Text>
              <Text className="mt-2 text-xs text-slate-400 dark:text-slate-400">
                Account: {payment.account_number || "Not available"}
              </Text>
            </View>
          ) : (
            <Text className="text-sm leading-6 text-slate-500 dark:text-slate-300">
              No payment application has been submitted yet.
            </Text>
          )}

          {data?.paymentFeatureAvailable === false ? (
            <View className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 p-4">
              <Text className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Payment application is currently unavailable because the backend payment table is not set up yet.
              </Text>
            </View>
          ) : (
            <View className="mt-4">
              <Text className="mb-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                Fill this form so the faculty side can review your payment application.
              </Text>

              <InputField
                label="Bank Name"
                iconName="university"
                placeholder="Enter your bank name"
                value={paymentForm.bankName}
                onChangeText={(value) => setPaymentForm((current) => ({ ...current, bankName: value }))}
                className="mb-4"
              />
              <InputField
                label="Account Holder"
                iconName="user"
                placeholder="Enter account holder name"
                value={paymentForm.accountHolder}
                onChangeText={(value) => setPaymentForm((current) => ({ ...current, accountHolder: value }))}
                className="mb-4"
              />
              <InputField
                label="Account Number"
                iconName="credit-card"
                placeholder="Enter account number"
                value={paymentForm.accountNumber}
                onChangeText={(value) => setPaymentForm((current) => ({ ...current, accountNumber: value }))}
                keyboardType="number-pad"
                className="mb-4"
              />

              <Button
                title="Submit Payment Application"
                onPress={handleSubmitPayment}
                loading={submittingPayment}
                disabled={submittingPayment}
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
