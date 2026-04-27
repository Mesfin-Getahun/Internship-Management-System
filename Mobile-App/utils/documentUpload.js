import * as DocumentPicker from "expo-document-picker";

export async function pickPdfDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets[0];
}

export function appendAssetToFormData(formData, fieldName, asset) {
  if (!asset?.uri) {
    return;
  }

  formData.append(fieldName, {
    uri: asset.uri,
    name: asset.name || `${fieldName}.pdf`,
    type: asset.mimeType || "application/pdf",
  });
}
