import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Header = ({ studentName = "Student" }) => {
  return (
    <View className="flex-row justify-between items-center mb-6 mt-4">
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center mr-3">
          <FontAwesome name="user" size={24} color="#2563EB" />
        </View>
        <View>
          <Text className="text-gray-500 text-sm font-medium">Welcome back,</Text>
          <Text className="text-gray-800 text-xl font-bold">{studentName}</Text>
          <Text className="text-gray-500 text-xs mt-1">Track your internship journey</Text>
        </View>
      </View>
      
      <TouchableOpacity className="w-10 h-10 rounded-full bg-white shadow-sm items-center justify-center border border-gray-100 relative">
        <FontAwesome name="bell" size={20} color="#4B5563" />
        <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
