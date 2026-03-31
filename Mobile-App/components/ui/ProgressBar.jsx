import React from 'react';
import { View, Text } from 'react-native';

const ProgressBar = ({ progress, label, className = '' }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View className={`w-full ${className}`}>
      {label && (
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 font-medium">{label}</Text>
          <Text className="text-blue-600 font-bold">{clampedProgress}%</Text>
        </View>
      )}
      <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full bg-blue-600 rounded-full" 
          style={{ width: `${clampedProgress}%` }} 
        />
      </View>
    </View>
  );
};

export default ProgressBar;
