import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/StudentDashboardScreen');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F4F7FB]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Gradient-like Top Section */}
        <View className="h-1/3 bg-blue-600 rounded-b-[40px] items-center justify-end pb-8">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4 shadow-lg shadow-blue-900 border-4 border-blue-400">
            <FontAwesome name="graduation-cap" size={36} color="#2563EB" />
          </View>
          <Text className="text-white text-3xl font-bold tracking-tight">Welcome</Text>
          <Text className="text-blue-100 mt-1 font-medium text-base">Student Internship Portal</Text>
        </View>

        {/* Login Card */}
        <View className="flex-1 px-5 -mt-8">
          <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200 border border-gray-100">
            <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign In</Text>

            <View className="mb-2">
              <Text className="text-gray-600 font-medium mb-2 ml-1 text-sm">Username / Email</Text>
              <InputField
                iconName="user"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 font-medium mb-2 ml-1 text-sm">Password</Text>
              <InputField
                iconName="lock"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View className="flex-row justify-end mb-8">
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
            />
          </View>

          <View className="mt-8 flex-row justify-center pb-8">
            <Text className="text-gray-500 text-sm font-medium">Need help logging in? </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 text-sm font-bold">Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
