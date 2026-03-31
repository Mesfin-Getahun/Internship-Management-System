import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const EmptyState = ({ iconName, title, description, action }) => {
  return (
    <View className="flex-1 items-center justify-center p-6 py-10">
      <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
        <FontAwesome name={iconName} size={32} color="#2563EB" />
      </View>
      <Text className="text-xl font-bold text-gray-800 text-center mb-2">{title}</Text>
      <Text className="text-gray-500 text-center text-base mb-6">{description}</Text>
      {action}
    </View>
  );
};

export default EmptyState;
