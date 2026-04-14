import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Screen from "../components/common/Screen";
import Loader from "../components/common/Loader";
import Card from "../components/ui/Card";
import Header from "../components/home/Header";
import StatusCard from "../components/home/StatusCard";
import QuickActions from "../components/home/QuickActions";
import AttendanceChart from "../components/home/AttendanceChart";
import ReportCard from "../components/home/ReportCard";
import DocumentCard from "../components/home/DocumentCard";
import NotificationPreview from "../components/home/NotificationPreview";
import { getStudentDashboardData } from "../assets/mockData";

export default function HomeScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setData(getStudentDashboardData()), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!data) {
    return (
      <Screen withTabs>
        <Loader label="Loading student dashboard..." />
      </Screen>
    );
  }

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <Header studentName={data.studentProfile.name} />

        <StatusCard
          status={data.internshipStatus.status}
          organization={data.internshipStatus.organization}
          position={data.internshipStatus.position}
          duration={data.internshipStatus.duration}
        />

        <QuickActions />

        <Card className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-800">Current Internship Details</Text>
          <View className="flex-row flex-wrap justify-between">
            <View className="mb-3 w-[48%] rounded-[22px] bg-slate-50 p-4">
              <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Company</Text>
              <Text className="mt-2 text-base font-bold text-slate-800">{data.internshipStatus.company}</Text>
            </View>
            <View className="mb-3 w-[48%] rounded-[22px] bg-slate-50 p-4">
              <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Role</Text>
              <Text className="mt-2 text-base font-bold text-slate-800">{data.internshipStatus.role}</Text>
            </View>
            <View className="w-[48%] rounded-[22px] bg-slate-50 p-4">
              <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Supervisor</Text>
              <Text className="mt-2 text-base font-bold text-slate-800">{data.internshipStatus.supervisorName}</Text>
            </View>
            <View className="w-[48%] rounded-[22px] bg-slate-50 p-4">
              <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-slate-400">Schedule</Text>
              <Text className="mt-2 text-base font-bold text-slate-800">{data.internshipStatus.period}</Text>
            </View>
          </View>
        </Card>

        <AttendanceChart
          present={data.attendance.present}
          absent={data.attendance.absent}
          onPress={() => Alert.alert("Attendance Details", "Attendance details screen can be added next.")}
        />

        <ReportCard report={data.latestReport} />

        <View className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-800">Document Status</Text>
          {data.documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </View>

        <NotificationPreview notifications={data.notifications} />
      </ScrollView>
    </Screen>
  );
}
