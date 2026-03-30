import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const ActionButton = ({ icon, label, onPress, color = '#2563EB', bgColor = 'bg-blue-50' }) => (
  <TouchableOpacity 
    className="items-center justify-center w-[48%] bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className={`w-12 h-12 rounded-full ${bgColor} items-center justify-center mb-3`}>
      <FontAwesome name={icon} size={22} color={color} />
    </View>
    <Text className="text-gray-800 font-semibold text-sm text-center">{label}</Text>
  </TouchableOpacity>
);

const QuickActions = () => {
  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-800 mb-3 ml-1">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        <ActionButton 
          icon="search" 
          label="Browse Internships" 
          color="#8B5CF6" 
          bgColor="bg-purple-50"
        />
        <ActionButton 
          icon="briefcase" 
          label="My Applications" 
          color="#3B82F6" 
          bgColor="bg-blue-50"
        />
        <ActionButton 
          icon="file-text" 
          label="Documents" 
          color="#F59E0B" 
          bgColor="bg-orange-50"
        />
        <ActionButton 
          icon="user" 
          label="Update Profile" 
          color="#10B981" 
          bgColor="bg-green-50"
        />
      </View>
    </View>
  );
};

export default QuickActions;
