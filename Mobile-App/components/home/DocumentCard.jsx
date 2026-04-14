import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

function handleAction(title, action) {
  Alert.alert(action, `${action} is prepared for ${title}. Backend file handling can be connected next.`);
}

export default function DocumentCard({ document }) {
  const available = document.status === "Available";

  return (
    <Card className="mb-3 bg-slate-50">
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-base font-bold text-slate-800">{document.title}</Text>
          <Text className="mt-1 text-sm text-slate-500">{document.issuedBy}</Text>
          <Text className="mt-2 text-xs text-slate-400">Updated {document.updatedAt}</Text>
        </View>
        <Badge status={document.status} />
      </View>

      <View className="mt-4 flex-row">
        <TouchableOpacity
          className={`mr-3 flex-1 flex-row items-center justify-center rounded-[18px] px-4 py-3 ${available ? "bg-blue-600" : "bg-slate-200"}`}
          activeOpacity={0.85}
          disabled={!available}
          onPress={() => handleAction(document.title, "View")}
        >
          <FontAwesome name="eye" size={14} color={available ? "#FFFFFF" : "#94A3B8"} />
          <Text className={`ml-2 text-sm font-semibold ${available ? "text-white" : "text-slate-400"}`}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`mr-3 flex-1 flex-row items-center justify-center rounded-[18px] px-4 py-3 ${available ? "bg-white" : "bg-slate-200"}`}
          activeOpacity={0.85}
          disabled={!available}
          onPress={() => handleAction(document.title, "Download")}
        >
          <FontAwesome name="download" size={14} color={available ? "#334155" : "#94A3B8"} />
          <Text className={`ml-2 text-sm font-semibold ${available ? "text-slate-700" : "text-slate-400"}`}>Download</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
