import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Card from '../ui/Card';

const NotificationItem = ({ icon, title, time, color = '#2563EB', isLast = false, isUnread = false }) => (
  <TouchableOpacity className={`flex-row items-start py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
    <View className="mt-1 relative">
      <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3 border border-gray-100">
        <FontAwesome name={icon} size={16} color={color} />
      </View>
      {isUnread && (
        <View className="absolute top-0 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
      )}
    </View>
    <View className="flex-1 pr-2">
      <Text className={`text-sm ${isUnread ? 'text-gray-800 font-bold' : 'text-gray-600 font-medium'}`}>{title}</Text>
      <Text className="text-xs text-gray-400 mt-1">{time}</Text>
    </View>
  </TouchableOpacity>
);

const NotificationList = () => {
  return (
    <Card className="mb-8">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-800">Recent Updates</Text>
        <TouchableOpacity>
          <Text className="text-blue-600 text-sm font-medium">See all</Text>
        </TouchableOpacity>
      </View>
      
      <View>
        <NotificationItem 
          icon="bell" 
          title="Your daily attendance for today is pending." 
          time="2 hours ago" 
          color="#F59E0B"
          isUnread={true}
        />
        <NotificationItem 
          icon="file-text" 
          title="Mid-term evaluation form has been published." 
          time="Yesterday, 10:30 AM" 
          color="#3B82F6"
        />
        <NotificationItem 
          icon="check-circle" 
          title="Placement in Ethio Tech Solutions confirmed." 
          time="Mon, 14 Mar" 
          color="#10B981"
          isLast={true}
        />
      </View>
    </Card>
  );
};

export default NotificationList;
