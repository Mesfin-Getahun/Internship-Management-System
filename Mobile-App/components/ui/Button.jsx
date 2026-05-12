import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

const variants = {
  primary: {
    wrapper: "bg-blue-600",
    text: "text-white",
    loader: "#FFFFFF",
  },
  secondary: {
    wrapper: "bg-slate-200 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-100",
    loader: "#334155",
  },
  outline: {
    wrapper: "border border-blue-600 bg-transparent dark:border-blue-400",
    text: "text-blue-600",
    loader: "#2563EB",
  },
  ghost: {
    wrapper: "bg-transparent",
    text: "text-blue-600",
    loader: "#2563EB",
  },
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  className = "",
  textClassName = "",
  loading = false,
  disabled = false,
  icon = null,
}) {
  const style = variants[variant] || variants.primary;

  return (
    <TouchableOpacity
      className={`min-h-[56px] flex-row items-center justify-center rounded-2xl px-5 py-4 ${style.wrapper} ${(disabled || loading) ? "opacity-60" : ""} ${className}`}
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={style.loader} />
      ) : (
        <>
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text className={`text-base font-bold ${style.text} ${textClassName}`}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
