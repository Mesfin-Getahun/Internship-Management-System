import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import BottomTabs from "./BottomTabs";

export default function Screen({ children, withTabs = false, className = "" }) {
  return (
    <SafeAreaView className={`flex-1 bg-[#F4F7FB] dark:bg-slate-950 ${className}`} edges={["top", "left", "right", "bottom"]}>
      <View className="flex-1">{children}</View>
      {withTabs ? <BottomTabs /> : null}
    </SafeAreaView>
  );
}
