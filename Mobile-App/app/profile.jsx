import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { getCurrentSession, logout, updateCurrentSessionUser } from "../services/authService";
import { updateStudentProfile } from "../services/studentService";
import { useTheme } from "../providers/ThemeProvider";

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const session = getCurrentSession();
  const student = session?.user || {};
  const [profile, setProfile] = useState({
    full_name: student.full_name || "",
    email: student.email || "",
    phone_number: student.phone_number || "",
    student_id: student.student_id || "",
    faculty: student.faculty || "",
    department: student.department || "",
    skills: student.skills || "",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    setLoading(true);

    updateStudentProfile({
      full_name: profile.full_name,
      email: profile.email,
      phone_number: profile.phone_number,
    })
      .then(() => {
        updateCurrentSessionUser({
          full_name: profile.full_name,
          email: profile.email,
          phone_number: profile.phone_number,
        });
        setLoading(false);
        Alert.alert("Profile Saved", "Your student profile was updated successfully.");
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
          <InputField label="Full Name" iconName="user" value={profile.full_name} onChangeText={(value) => updateField("full_name", value)} className="mb-4" />
          <InputField label="Email" iconName="envelope" value={profile.email} onChangeText={(value) => updateField("email", value)} keyboardType="email-address" className="mb-4" />
          <InputField label="Phone" iconName="phone" value={profile.phone_number} onChangeText={(value) => updateField("phone_number", value)} keyboardType="phone-pad" className="mb-1" />
        </Card>

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Academic Info</Text>
          <InputField label="Student ID" iconName="id-card" value={profile.student_id} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Faculty" iconName="university" value={profile.faculty} onChangeText={() => {}} editable={false} className="mb-4" />
          <InputField label="Department" iconName="book" value={profile.department} onChangeText={() => {}} editable={false} className="mb-1" />
        </Card>

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Skills</Text>
          <InputField
            label="Skills"
            iconName="code"
            value={profile.skills}
            onChangeText={() => {}}
            editable={false}
            helperText="Skills are currently read-only in the backend profile update endpoint."
            className="mb-1"
          />
        </Card>

        <Card className="mb-5">
          <Text className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">Profile Notes</Text>
          <Text className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            The current backend lets students update full name, email, phone number, password, and profile picture.
            Additional academic and bio fields can be connected once those backend update fields are added.
          </Text>
        </Card>

        <Button title="Save Changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </Screen>
  );
}
