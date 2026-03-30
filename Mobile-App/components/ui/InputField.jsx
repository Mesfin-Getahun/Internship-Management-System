import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const InputField = ({ 
  iconName, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View 
      className={`flex-row items-center bg-white rounded-2xl px-4 py-3 mb-4 shadow-sm border ${
        isFocused ? 'border-blue-600 shadow-blue-200' : 'border-gray-200'
      } ${className}`}
    >
      {iconName && (
        <FontAwesome 
          name={iconName} 
          size={20} 
          color={isFocused ? '#2563EB' : '#9CA3AF'} 
          style={{ marginRight: 12 }}
        />
      )}
      <TextInput
        className="flex-1 text-gray-800 text-base py-1"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isPasswordVisible}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ marginLeft: 8 }}>
          <FontAwesome 
            name={isPasswordVisible ? 'eye-slash' : 'eye'} 
            size={20} 
            color="#9CA3AF" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InputField;
