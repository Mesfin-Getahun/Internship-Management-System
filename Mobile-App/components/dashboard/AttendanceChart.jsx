import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Card from '../ui/Card';

const AttendanceChart = ({ present = 0, absent = 0 }) => {
  const screenWidth = Dimensions.get("window").width;
  
  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#6B7280'
    }
  };

  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [present, absent],
        colors: [
          (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green 
          (opacity = 1) => `rgba(239, 68, 68, ${opacity})`   // Red 
        ]
      }
    ]
  };

  return (
    <Card className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Attendance Overview</Text>
        <View className="bg-gray-100 rounded-lg px-2 py-1">
          <Text className="text-gray-600 text-xs font-medium">This Month</Text>
        </View>
      </View>
      
      <View className="flex-row justify-around mb-4 mt-2">
        <View className="items-center">
          <Text className="text-3xl font-bold text-green-500">{present}</Text>
          <Text className="text-gray-500 text-xs font-medium uppercase mt-1">Present Days</Text>
        </View>
        <View className="w-px h-full bg-gray-200" />
        <View className="items-center">
          <Text className="text-3xl font-bold text-red-500">{absent}</Text>
          <Text className="text-gray-500 text-xs font-medium uppercase mt-1">Absent Days</Text>
        </View>
      </View>

      <View className="items-center mt-4">
        <BarChart
          data={data}
          width={screenWidth - 64}
          height={200}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero
          showValuesOnTopOfBars
          withCustomBarColorFromData={true}
          flatColor={true}
          style={{
            borderRadius: 16,
          }}
        />
      </View>
    </Card>
  );
};

export default AttendanceChart;
