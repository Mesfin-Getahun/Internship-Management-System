import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getMyInternship, getStudentReports, submitSignedReportToFaculty, uploadInternshipReport } from "../services/studentService";
import { appendAssetToFormData, pickPdfDocument } from "../utils/documentUpload";
import { formatDate } from "../utils/dateFormat";

function formatReportStatus(status) {
  if (!status) {
    return "Submitted";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusClassName(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "faculty_submitted") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized === "signed") {
    return "bg-blue-100 text-blue-700";
  }

  if (normalized === "submitted") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState([]);
  const [activeInternship, setActiveInternship] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.allSettled([getStudentReports(), getMyInternship()]).then(([reportsResult, internshipResult]) => {
      if (reportsResult.status === "fulfilled") {
        setReports(reportsResult.value.reports || []);
      } else {
        setError(reportsResult.reason?.message || "Failed to load reports");
      }

      if (internshipResult.status === "fulfilled") {
        setActiveInternship(internshipResult.value.internship || null);
      }

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

  const handleUploadReport = async () => {
    if (!activeInternship?.internship_id) {
      Alert.alert("No Active Internship", "You need an active internship before uploading a report.");
      return;
    }

    if (!reportFile) {
      Alert.alert("Missing File", "Choose a PDF report before uploading.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    appendAssetToFormData(formData, "report", reportFile);

    try {
      const response = await uploadInternshipReport(activeInternship.internship_id, formData);
      Alert.alert("Report Uploaded", response.message || "Your report was uploaded successfully.");
      setReportFile(null);
      loadData();
    } catch (requestError) {
      Alert.alert("Upload Failed", requestError.message || "Unable to upload the report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenFile = async (fileUrl) => {
    if (!fileUrl) {
      Alert.alert("Unavailable", "This report does not have a file link yet.");
      return;
    }

    try {
      await Linking.openURL(fileUrl);
    } catch {
      Alert.alert("Open Failed", "Unable to open this file link.");
    }
  };

  const handleSubmitToFaculty = async (reportId) => {
    try {
      await submitSignedReportToFaculty(reportId);
      Alert.alert("Submitted", "The signed report was sent to the faculty side.");
      loadData();
    } catch (requestError) {
      Alert.alert("Submit Failed", requestError.message || "Unable to submit the report to faculty.");
    }
  };

  if (loading) {
    return (
      <Screen withTabs>
        <Loader label="Loading reports..." />
      </Screen>
    );
  }

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 rounded-[30px] bg-[#0F766E] px-5 pb-5 pt-5">
          <View className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10" />
          <Text className="text-2xl font-bold text-white">My Reports</Text>
          <Text className="mt-2 text-sm leading-6 text-teal-100">
            Upload your internship report and track whether it has been signed or forwarded to faculty.
          </Text>
        </View>

        {error ? (
          <Card className="mb-4 border border-rose-200 bg-rose-50">
            <Text className="text-sm font-medium text-rose-600">{error}</Text>
          </Card>
        ) : null}

        <Card className="mb-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-800">Upload New Report</Text>
            <FontAwesome name="cloud-upload" size={18} color="#0F766E" />
          </View>

          <Text className="text-sm leading-6 text-slate-500">
            {activeInternship
              ? `Active internship: ${activeInternship.title || "Internship"} at ${activeInternship.company_name || "company"}.`
              : "You do not have an active internship yet, so report upload is unavailable."}
          </Text>

          <TouchableOpacity
            className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4"
            activeOpacity={0.85}
            onPress={handlePickReport}
          >
            <Text className="text-sm font-semibold text-slate-700">
              {reportFile ? `Selected Report: ${reportFile.name}` : "Choose Report PDF"}
            </Text>
          </TouchableOpacity>

          <View className="mt-4">
            <Button
              title="Upload Report"
              onPress={handleUploadReport}
              loading={submitting}
              disabled={!activeInternship?.internship_id || !reportFile}
            />
          </View>
        </Card>

        <Text className="mb-3 text-lg font-bold text-slate-800">Submitted Reports</Text>

        {reports.length === 0 ? (
          <EmptyState
            iconName="file-pdf-o"
            title="No reports yet"
            description="Uploaded reports will appear here once you submit your first PDF."
          />
        ) : (
          reports.map((report) => (
            <Card key={report.report_id} className="mb-4">
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-bold text-slate-800">
                    {report.internship_title || "Internship Report"}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500">{report.company_name || "Company not listed"}</Text>
                </View>
                <View className={`rounded-full px-3 py-1 ${getStatusClassName(report.status)}`}>
                  <Text className="text-xs font-bold">{formatReportStatus(report.status)}</Text>
                </View>
              </View>

              <Text className="text-xs text-slate-400">
                Submitted: {formatDate(report.submitted_at || report.created_at)}
              </Text>

              <View className="mt-4 flex-row flex-wrap">
                <Button
                  title="Open Report"
                  variant="outline"
                  className="mr-3 mb-3 flex-1"
                  onPress={() => handleOpenFile(report.file_url)}
                />

                {report.status === "signed" ? (
                  <Button
                    title="Send to Faculty"
                    className="mb-3 flex-1"
                    onPress={() => handleSubmitToFaculty(report.report_id)}
                  />
                ) : null}
              </View>

              {report.mentor_signed_url ? (
                <Text className="mt-1 text-xs text-slate-400">Mentor signed copy is available.</Text>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
