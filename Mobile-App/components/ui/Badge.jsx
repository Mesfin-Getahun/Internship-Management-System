import React from 'react';
import { View, Text } from 'react-native';

const Badge = ({ status, className = '' }) => {
  const getBadgeStyle = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case 'waiting':
        return { bg: 'bg-orange-100', text: 'text-orange-600' };
      case 'approved':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'completed':
        return { bg: 'bg-gray-200', text: 'text-gray-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-500' };
    }
  };

  const styles = getBadgeStyle(status);

  return (
    <View className={`px-3 py-1 rounded-full items-center justify-center self-start ${styles.bg} ${className}`}>
      <Text className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
        {status}
      </Text>
    </View>
  );
};

export default Badge;
