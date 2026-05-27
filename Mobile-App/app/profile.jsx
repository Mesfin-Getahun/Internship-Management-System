import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Loader from "../components/common/Loader";
import { getCurrentSession, logout, updateCurrentSessionUser } from "../services/authService";
import { getStudentProfile, updateStudentProfile } from "../services/studentService";
import { useTheme } from "../providers/ThemeProvider";
import { formatDate } from "../utils/dateFormat";

const skillsToText = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (!value) return "";
  if (typeof value !== "string") return String(value);

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).join(", ");
  } catch {
    // Fall back to the stored comma-separated text.
  }

  return value;
};

const buildProfileState = (student = {}) => ({
  full_name: student.full_name || "",
  email: student.email || "",
  phone_number: student.phone_number || "",
  student_id: student.student_id || "",
  faculty: student.faculty || "",
  department: student.department || "",
  gender: student.gender || "",
  date_of_birth: formatDate(student.date_of_birth, ""),
  program: student.program || "",
  academic_year: student.academic_year || "",
  current_semester: student.current_semester ? String(student.current_semester) : "",
  cgpa: student.cgpa ? String(student.cgpa) : "",
  expected_graduation_year: student.expected_graduation_year ? String(student.expected_graduation_year) : "",
  skills: skillsToText(student.skills || student.technical_skills),
});

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const session = getCurrentSession();
  const student = session?.user || {};
  const [profile, setProfile] = useState(buildProfileState(student));
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    getStudentProfile()
      .then((response) => {
        const nextStudent = response.student || {};
        updateCurrentSessionUser(nextStudent);
        setProfile(buildProfileState(nextStudent));
      })
      .catch(() => {
        setProfile(buildProfileState(getCurrentSession()?.user || {}));
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleSave = () => {
    setLoading(true);

    updateStudentProfile({
      skills: profile.skills,
      technical_skills: profile.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    })
      .then((response) => {
        const nextStudent = response.student || { skills: profile.skills };
        updateCurrentSessionUser(nextStudent);
        setProfile(buildProfileState({ ...profile, ...nextStudent }));
        setLoading(false);
        Alert.alert("Skills Saved", "Your skills were updated successfully.");
      })
      .catch((requestError) => {
        setLoading(false);
        Alert.alert("Update Failed", requestError.message || "Unable to update your profile.");
      });
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <Screen withTabs>
      {loadingProfile ? (
        <Loader label="Loading profile..." />
      ) : (
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 items-center rounded-[30px] bg-slate-900 px-5 pb-6 pt-6">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-white/10">
            <FontAwesome name="user" size={38} color="#FFFFFF" />
          </View>
          <Text className="text-2xl font-bold text-white">{profile.full_name || "Student"}</Text>
          <Text className="mt-1 text-sm text-slate-300">{profile.department || "Department not set"}</Text>
        </View>

        <Card className="mb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">Appearance</Text>
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Switch between light and dark theme for the mobile app.
              </Text>
            </View>
            <Button
              title={isDark ? "Dark On" : "Light On"}
              variant={isDark ? "primary" : "secondary"}
              onPress={toggleTheme}
            />
          </View>
        </Card>

        <Card className="mb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">Session</Text>
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sign out when you are done using the student portal.
              </Text>
            </View>
            <Button title="Log Out" variant="outline" onPress={handleLogout} />
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Personal Info</Text>
          <InputField label="Full Name" iconName="user" value={profile.full_name} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Email" iconName="envelope" value={profile.email} onChangeText={() => {}} editable={false} keyboardType="email-address" className="mb-4" />
          <InputField label="Phone" iconName="phone" value={profile.phone_number} onChangeText={() => {}} editable={false} keyboardType="phone-pad" className="mb-1" />
          <InputField label="Gender" iconName="venus-mars" value={profile.gender} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Date of Birth" iconName="calendar" value={profile.date_of_birth} onChangeText={() => {}} editable={false} className="mb-1" />
        </Card>

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Academic Info</Text>
          <InputField label="Student ID" iconName="id-card" value={profile.student_id} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Faculty" iconName="university" value={profile.faculty} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Department" iconName="book" value={profile.department} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Program" iconName="bookmark" value={profile.program} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Academic Year" iconName="graduation-cap" value={profile.academic_year} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Current Semester" iconName="calendar-check-o" value={profile.current_semester} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="CGPA" iconName="star" value={profile.cgpa} onChangeText={() => {}} editable={false} keyboardType="decimal-pad" className="mb-4" />
          <InputField label="Expected Graduation Year" iconName="flag-checkered" value={profile.expected_graduation_year} onChangeText={() => {}} editable={false} keyboardType="numeric" className="mb-1" />
        </Card>

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Skills</Text>
          <InputField
            label="Skills"
            iconName="code"
            value={profile.skills}
            onChangeText={(value) => updateField("skills", value)}
            helperText="Separate skills with commas, for example: React, Node.js, SQL."
            className="mb-1"
          />
        </Card>

        <Card className="mb-5">
          <Text className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Profile Notes</Text>
          <Text className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Personal and academic values are loaded from the database. Students can update only their skills here.
          </Text>
        </Card>

        <Button title="Save Skills" onPress={handleSave} loading={loading} />
      </ScrollView>
      )}
    </Screen>
  );
}
