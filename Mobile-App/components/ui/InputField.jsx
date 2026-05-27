import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function InputField({
  label,
  iconName,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  helperText,
  error,
  editable = true,
  className = "",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View className={className}>
      {label ? <Text className="mb-2 ml-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</Text> : null}
      <View
        className={`flex-row items-center rounded-2xl border px-4 py-4 ${
          editable ? "bg-white dark:bg-slate-900" : "bg-slate-100 dark:bg-slate-800"
        } ${
          error
            ? "border-rose-400"
            : isFocused
              ? "border-blue-500"
              : "border-slate-200 dark:border-slate-700"
        }`}
      >
        {iconName ? (
          <FontAwesome
            name={iconName}
            size={18}
            color={error ? "#F43F5E" : isFocused ? "#2563EB" : "#94A3B8"}
            style={{ marginRight: 12 }}
          />
        ) : null}
        <TextInput
          className={`flex-1 text-base ${editable ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry ? (
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsPasswordVisible((current) => !current)}>
            <FontAwesome name={isPasswordVisible ? "eye-slash" : "eye"} size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="mt-2 ml-1 text-xs font-medium text-rose-500">{error}</Text> : null}
      {!error && helperText ? <Text className="mt-2 ml-1 text-xs text-slate-400 dark:text-slate-500">{helperText}</Text> : null}
    </View>
  );
}
