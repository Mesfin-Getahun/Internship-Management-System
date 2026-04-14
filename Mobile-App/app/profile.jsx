import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Screen from "../components/common/Screen";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { getStudentDashboardData } from "../assets/mockData";

export default function ProfileScreen() {
  const initialProfile = getStudentDashboardData().studentProfile;
  const [profile, setProfile] = useState(initialProfile);

  const updateField = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  return (
    <Screen withTabs>
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 items-center rounded-[30px] bg-slate-900 px-5 pb-6 pt-6">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-white/10">
            <FontAwesome name="user" size={38} color="#FFFFFF" />
          </View>
          <Text className="text-2xl font-bold text-white">{profile.name}</Text>
          <Text className="mt-1 text-sm text-slate-300">{profile.department}</Text>
        </View>

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800">Personal Info</Text>
          <InputField label="Full Name" iconName="user" value={profile.name} onChangeText={(value) => updateField("name", value)} className="mb-4" />
          <InputField label="Email" iconName="envelope" value={profile.email} onChangeText={(value) => updateField("email", value)} keyboardType="email-address" className="mb-4" />
          <InputField label="Phone" iconName="phone" value={profile.phone} onChangeText={(value) => updateField("phone", value)} keyboardType="phone-pad" className="mb-1" />
        </Card>

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800">Academic Info</Text>
          <InputField label="Department" iconName="book" value={profile.department} onChangeText={(value) => updateField("department", value)} className="mb-4" />
          <InputField label="Year" iconName="graduation-cap" value={profile.year} onChangeText={(value) => updateField("year", value)} className="mb-4" />
          <InputField label="CGPA" iconName="line-chart" value={profile.cgpa} onChangeText={(value) => updateField("cgpa", value)} className="mb-1" />
        </Card>

        <Card className="mb-4">
          <Text className="mb-4 text-lg font-bold text-slate-800">Skills</Text>
          <InputField
            label="Skills"
            iconName="code"
            value={profile.skills.join(", ")}
            onChangeText={(value) => updateField("skills", value.split(",").map((item) => item.trim()).filter(Boolean))}
            helperText="Separate skills with commas."
            className="mb-1"
          />
        </Card>

        <Card className="mb-5">
          <Text className="mb-4 text-lg font-bold text-slate-800">Contact Info</Text>
          <InputField label="Address" iconName="map-marker" value={profile.address} onChangeText={(value) => updateField("address", value)} className="mb-4" />
          <InputField
            label="Emergency Contact"
            iconName="users"
            value={profile.emergencyContact}
            onChangeText={(value) => updateField("emergencyContact", value)}
            className="mb-4"
          />
          <InputField label="Bio" iconName="file-text" value={profile.bio} onChangeText={(value) => updateField("bio", value)} className="mb-1" />
        </Card>

        <Button title="Save Changes" onPress={() => Alert.alert("Profile Saved", "Profile updates are stored locally in this UI prototype.")} />
      </ScrollView>
    </Screen>
  );
}
