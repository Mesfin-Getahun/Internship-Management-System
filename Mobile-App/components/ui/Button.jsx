import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  className = '', 
  textClassName = '',
  loading = false,
  icon = null
}) => {
  const baseStyles = "rounded-2xl p-4 flex-row justify-center items-center shadow-md";
  const variants = {
    primary: "bg-blue-600",
    secondary: "bg-gray-200",
    outline: "bg-transparent border border-blue-600",
    ghost: "bg-transparent shadow-none"
  };
  
  const textBaseStyles = "text-center font-semibold text-lg";
  const textVariants = {
    primary: "text-white",
    secondary: "text-gray-800",
    outline: "text-blue-600",
    ghost: "text-blue-600"
  };

  return (
    <TouchableOpacity 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#2563EB'} />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${textBaseStyles} ${textVariants[variant]} ${textClassName}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
