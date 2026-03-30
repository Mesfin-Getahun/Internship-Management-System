import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const StatusCard = ({ company, position, duration, status }) => {
  return (
    <Card className="mb-6">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Current Internship</Text>
          <Text className="text-xl font-bold text-gray-800 leading-tight">{position}</Text>
          <Text className="text-blue-600 font-medium mt-1">{company}</Text>
        </View>
        <Badge status={status} />
      </View>
      
      <View className="flex-row items-center mb-2">
        <FontAwesome name="calendar" size={14} color="#6B7280" style={{ width: 16, textAlign: 'center', marginRight: 8 }} />
        <Text className="text-gray-600 text-sm">{duration || 'Not specified'}</Text>
      </View>
      
      <View className="flex-row items-center p-3 bg-blue-50 rounded-xl mt-2 border border-blue-100">
        <FontAwesome name="info-circle" size={16} color="#2563EB" style={{ marginRight: 8 }} />
        <Text className="text-blue-800 text-sm flex-1">
          {status === 'Waiting' ? 'Awaiting university approval.' : 
           status === 'Approved' ? 'Ready to start. Please submit your schedule.' :
           status === 'Active' ? 'Remember to log your daily attendance.' :
           'Internship completed. Final report pending.'}
        </Text>
      </View>
    </Card>
  );
};

export default StatusCard;
