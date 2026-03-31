import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const Loader = ({ className = '' }) => {
  return (
    <View className={`flex-1 justify-center items-center p-10 ${className}`}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
};

export default Loader;
