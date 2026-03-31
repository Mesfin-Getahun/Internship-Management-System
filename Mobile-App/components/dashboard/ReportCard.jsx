import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ReportCard = ({ supervisorName = "Jane Doe", date = "May 15, 2026", message = "Student has shown excellent progress this week." }) => {
  return (
    <Card className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-800">Latest Feedback</Text>
        <FontAwesome name="commenting-o" size={20} color="#2563EB" />
      </View>
      
      <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
        <Text className="text-gray-700 italic text-sm mb-3">"{message}"</Text>
        <View className="flex-row justify-between items-center mt-2 border-t border-gray-200 pt-3">
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-blue-200 items-center justify-center mr-2">
              <Text className="text-blue-700 text-xs font-bold">{supervisorName.charAt(0)}</Text>
            </View>
            <Text className="text-gray-600 text-xs font-medium">{supervisorName} • Supervisor</Text>
          </View>
          <Text className="text-gray-400 text-xs">{date}</Text>
        </View>
      </View>
      
      <Button 
        title="View All Reports" 
        variant="outline" 
        className="py-2.5 rounded-xl border-gray-200 bg-white" 
        textClassName="text-gray-700 text-sm font-semibold"
      />
    </Card>
  );
};

export default ReportCard;
