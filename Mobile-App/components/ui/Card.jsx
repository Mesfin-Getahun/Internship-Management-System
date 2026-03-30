import React from 'react';
import { View } from 'react-native';

const Card = ({ children, className = '' }) => {
  return (
    <View className={`bg-white rounded-2xl p-4 shadow-md mb-4 ${className}`}>
      {children}
    </View>
  );
};

export default Card;
