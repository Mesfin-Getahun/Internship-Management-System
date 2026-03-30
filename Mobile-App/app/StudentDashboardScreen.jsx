import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Header from '../components/dashboard/Header';
import StatusCard from '../components/dashboard/StatusCard';
import QuickActions from '../components/dashboard/QuickActions';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import ReportCard from '../components/dashboard/ReportCard';
import NotificationList from '../components/dashboard/NotificationList';
import ProgressBar from '../components/ui/ProgressBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function StudentDashboardScreen() {
  // Mock Data aligned with requirements
  const userData = {
    name: "Mesfin Getahun",
    profileCompletion: 80,
    internship: {
      company: "Ethio Tech Solutions",
      position: "Frontend Intern",
      status: "Waiting",
      duration: "Sept 2026 - Jan 2027"
    },
    attendance: {
      present: 20,
      absent: 2
    },
    latestFeedback: {
      supervisorName: "Alemayehu K.",
      date: "Mar 20, 2026",
      message: "Mesfin is quickly adapting to our frontend stack. Excellent work on the recent UI task."
    }
  };

  return (
    <View className="flex-1 bg-[#F4F7FB]">
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 40 }}
      >
        {/* Section 1: Header */}
        <Header studentName={userData.name} />

        {/* Section 2: Profile Completion */}
        {userData.profileCompletion < 100 && (
          <Card className="mb-6 border-l-4 border-blue-500">
            <Text className="text-gray-800 font-bold text-base mb-2">
              Complete your profile to unlock opportunities
            </Text>
            <ProgressBar progress={userData.profileCompletion} label="Profile Completion" className="mb-4" />
            <Button 
              title="Complete Profile" 
              variant="outline"
              className="py-2.5 rounded-xl border-gray-200"
              textClassName="text-sm font-semibold"
            />
          </Card>
        )}

        {/* Section 3: Internship Status */}
        <StatusCard 
          company={userData.internship.company}
          position={userData.internship.position}
          status={userData.internship.status}
          duration={userData.internship.duration}
        />

        {/* Section 4: Quick Actions */}
        <QuickActions />

        {/* Section 5: Attendance Summary */}
        <AttendanceChart 
          present={userData.attendance.present} 
          absent={userData.attendance.absent} 
        />

        {/* Section 6: Supervisor Reports */}
        <ReportCard 
          supervisorName={userData.latestFeedback.supervisorName}
          date={userData.latestFeedback.date}
          message={userData.latestFeedback.message}
        />

        {/* Section 7: Announcements / Notifications */}
        <NotificationList />

      </ScrollView>
    </View>
  );
}
