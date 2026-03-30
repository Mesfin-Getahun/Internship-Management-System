import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

// --- Mock Data ---
const studentData = {
  name: 'Abel Tesfaye',
  avatar: 'https://i.pravatar.cc/150?u=abeltesfaye',
  internship: {
    status: 'Waiting', // 'Waiting', 'Active', 'Completed'
    organization: 'Tech Solutions PLC',
    position: 'Software Developer Intern',
    startDate: 'July 1, 2026',
    endDate: 'September 30, 2026',
  },
  recommendation: {
    available: true,
  },
  attendance: {
    present: 22,
    absent: 2,
    total: 24,
  },
  feedback: {
    latest: 'Good progress in backend development tasks.',
    supervisor: 'John Doe',
  },
  notifications: [
    { id: 1, icon: 'file-text', message: 'Recommendation letter uploaded', time: '2 hours ago' },
    { id: 2, icon: 'user-check', message: 'Supervisor submitted evaluation', time: '1 day ago' },
    { id: 3, icon: 'play-circle', message: 'Internship period officially started', time: '3 days ago' },
  ],
};

// --- Helper Components ---

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Waiting: { backgroundColor: '#FFFBEB', color: '#F59E0B' },
    Active: { backgroundColor: '#ECFDF5', color: '#10B981' },
    Completed: { backgroundColor: '#EFF6FF', color: '#3B82F6' },
  };
  const style = statusStyles[status] || {};
  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: style.color }]}>{status}</Text>
    </View>
  );
};

// --- Main Screen Component ---

const StudentDashboardScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Image source={{ uri: studentData.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.studentName}>{studentData.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellIcon}>
          <Feather name="bell" size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Internship Status Card */}
      <Card>
        <View style={styles.cardHeader}>
          <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Internship Status</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.detailLabel}>Status:</Text>
          <StatusBadge status={studentData.internship.status} />
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Organization:</Text>
          <Text style={styles.detailValue}>{studentData.internship.organization}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Position:</Text>
          <Text style={styles.detailValue}>{studentData.internship.position}</Text>
        </View>
        <View style={styles.dateContainer}>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Start Date:</Text>
                <Text style={styles.detailValue}>{studentData.internship.startDate}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>End Date:</Text>
                <Text style={styles.detailValue}>{studentData.internship.endDate}</Text>
            </View>
        </View>
      </Card>

      {/* Recommendation Letter Card */}
      <Card>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Recommendation Letter</Text>
        </View>
        {studentData.recommendation.available ? (
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Download Letter</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.infoText}>
            Your recommendation letter will be available once UIL releases it.
          </Text>
        )}
      </Card>

      {/* Attendance Summary Card */}
      <Card>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Attendance Summary</Text>
        </View>
        <View style={styles.attendanceGrid}>
          <View style={styles.attendanceItem}>
            <Text style={styles.attendanceValue}>{studentData.attendance.present}</Text>
            <Text style={styles.attendanceLabel}>Present</Text>
          </View>
          <View style={styles.attendanceItem}>
            <Text style={styles.attendanceValue}>{studentData.attendance.absent}</Text>
            <Text style={styles.attendanceLabel}>Absent</Text>
          </View>
          <View style={styles.attendanceItem}>
            <Text style={styles.attendanceValue}>{studentData.attendance.total}</Text>
            <Text style={styles.attendanceLabel}>Total Days</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>View Attendance</Text>
        </TouchableOpacity>
      </Card>

      {/* Supervisor Feedback Card */}
      <Card>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Supervisor Feedback</Text>
        </View>
        <Text style={styles.feedbackText}>“{studentData.feedback.latest}”</Text>
        <Text style={styles.supervisorText}>- {studentData.feedback.supervisor}</Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>View Reports</Text>
        </TouchableOpacity>
      </Card>

      {/* Latest Notifications Card */}
      <Card>
        <View style={styles.cardHeader}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Latest Notifications</Text>
        </View>
        {studentData.notifications.map((item) => (
          <View key={item.id} style={styles.notificationItem}>
            <Feather name={item.icon} size={16} color="#64748B" />
            <View style={styles.notificationTextContainer}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const colors = {
  primary: '#1E3A8A',
  background: '#F4F7FB',
  card: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  shadow: 'rgba(0, 0, 0, 0.05)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  bellIcon: {
    padding: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dateContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  attendanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  attendanceItem: {
    alignItems: 'center',
  },
  attendanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  attendanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  feedbackText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  supervisorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notificationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default StudentDashboardScreen;
