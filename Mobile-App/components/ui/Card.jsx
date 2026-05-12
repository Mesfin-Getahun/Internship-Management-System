import React from "react";
import { View } from "react-native";

export default function Card({ children, className = "" }) {
  return (
    <View className={`overflow-hidden rounded-[28px] border border-slate-100 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {children}
    </View>
  );
}
