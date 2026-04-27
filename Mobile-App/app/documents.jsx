import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Screen from "../components/common/Screen";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import {
  getMyInternship,
  getPaymentApplication,
  submitPaymentForm,
  uploadInternshipReport,
} from "../services/studentService";
import { appendAssetToFormData, pickPdfDocument } from "../utils/documentUpload";

export default function DocumentsScreen() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
  });
  const [acceptanceLetterFile, setAcceptanceLetterFile] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.all([getMyInternship(), getPaymentApplication()])
      .then(([internshipResponse, paymentResponse]) => {
        setDashboardData({
          internship: internshipResponse.internship,
          payment: paymentResponse.payment,
        });
        setPaymentForm({
          bankName: paymentResponse.payment?.bank_name || "",
          accountHolder: paymentResponse.payment?.account_holder || "",
          accountNumber: paymentResponse.payment?.account_number || "",
        });
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError.message || "Failed to load reports and payment data");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePickReport = async () => {
    const file = await pickPdfDocument();
    if (file) {
      setReportFile(file);
    }
  };

  const handlePickAcceptanceLetter = async () => {
    const file = await pickPdfDocument();
    if (file) {
      setAcceptanceLetterFile(file);
    }
  };

  const handleUploadReport = async () => {
    if (!dashboardData?.internship?.internship_id) {
      Alert.alert("No Active Internship", "You need an active internship before uploading a report.");
      return;
    }

    if (!reportFile) {
      Alert.alert("Missing Report", "Please choose a PDF report first.");
      return;
    }

    setUploadingReport(true);

    const formData = new FormData();
    appendAssetToFormData(formData, "report", reportFile);

    try {
      await uploadInternshipReport(dashboardData.internship.internship_id, formData);
      setUploadingReport(false);
      setReportFile(null);
      Alert.alert("Report Uploaded", "Your internship report has been uploaded successfully.");
    } catch (requestError) {
      setUploadingReport(false);
      Alert.alert("Upload Failed", requestError.message || "Unable to upload your report.");
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentForm.bankName || !paymentForm.accountHolder || !paymentForm.accountNumber) {
      Alert.alert("Missing Details", "Please fill in your bank name, account holder, and account number.");
      return;
    }

    if (!acceptanceLetterFile) {
      Alert.alert("Missing File", "Please choose the signed acceptance letter PDF.");
      return;
    }

    setSubmittingPayment(true);

    const formData = new FormData();
    formData.append("bankName", paymentForm.bankName);
    formData.append("accountHolder", paymentForm.accountHolder);
    formData.append("accountNumber", paymentForm.accountNumber);
    appendAssetToFormData(formData, "acceptanceLetter", acceptanceLetterFile);

    try {
      const response = await submitPaymentForm(formData);
      setDashboardData((current) => ({
        ...current,
        payment: response.payment || null,
      }));
      setAcceptanceLetterFile(null);
      setSubmittingPayment(false);
      Alert.alert("Payment Submitted", response.message || "Payment application submitted successfully.");
    } catch (requestError) {
      setSubmittingPayment(false);
      Alert.alert("Payment Failed", requestError.message || "Unable to submit payment application.");
    }
  };

  if (loading) {
    return (
      <Screen withTabs>
        <Loader label="Loading reports and payment tools..." />
      </Screen>
    );
  }

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#0F766E] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">Reports & Payment</Text>
          <Text className="mt-2 text-sm leading-6 text-teal-100">
            Upload your internship report, manage stipend payment details, and track current submission status.
          </Text>
        </View>

        {error ? (
          <Card className="mb-4 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
          </Card>
        ) : null}

        {dashboardData?.internship ? (
          <Card className="mb-4">
            <Text className="mb-4 text-lg font-bold text-slate-800">Upload Internship Report</Text>
            <Text className="mb-3 text-sm text-slate-500">
              Active internship: {dashboardData.internship.title} at {dashboardData.internship.company_name}
            </Text>
            <TouchableOpacity
              className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4"
              activeOpacity={0.85}
              onPress={handlePickReport}
            >
              <Text className="text-sm font-semibold text-slate-700">
                {reportFile ? `Report: ${reportFile.name}` : "Choose internship report PDF"}
              </Text>
            </TouchableOpacity>
            <Button
              title="Upload Report"
              onPress={handleUploadReport}
              loading={uploadingReport}
              disabled={uploadingReport}
            />
          </Card>
        ) : (
          <EmptyState
            iconName="file-text"
            title="No active internship report slot yet"
            description="Once your internship is in progress, you can upload report PDFs from this screen."
          />
        )}

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800">Payment Application</Text>
          {dashboardData?.payment ? (
            <View className="mb-4 rounded-[22px] bg-slate-50 p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-base font-bold text-slate-800">{dashboardData.payment.bank_name || "Submitted Payment"}</Text>
                <Badge status={dashboardData.payment.status || "Pending Approval"} />
              </View>
              <Text className="text-sm text-slate-500">{dashboardData.payment.account_holder || "Account holder not available"}</Text>
              <Text className="mt-2 text-xs text-slate-400">
                Account: {dashboardData.payment.account_number || "Not available"}
              </Text>
            </View>
          ) : null}

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
          <TouchableOpacity
            className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4"
            activeOpacity={0.85}
            onPress={handlePickAcceptanceLetter}
          >
            <Text className="text-sm font-semibold text-slate-700">
              {acceptanceLetterFile ? `Acceptance Letter: ${acceptanceLetterFile.name}` : "Choose signed acceptance letter PDF"}
            </Text>
          </TouchableOpacity>
          <Button
            title="Submit Payment Application"
            onPress={handleSubmitPayment}
            loading={submittingPayment}
            disabled={submittingPayment}
          />
        </Card>

        <Card className="mb-4">
          <Text className="mb-3 text-lg font-bold text-slate-800">Submit Signed Report To Faculty</Text>
          <Text className="text-sm leading-6 text-slate-500">
            This endpoint exists in the backend, but the student app still does not receive a report list with
            `report_id` values. We can finish this action as soon as the backend exposes report IDs to students.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
