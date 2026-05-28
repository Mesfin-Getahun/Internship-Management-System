const PDF_MIME_TYPE = "application/pdf";
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const hasExtension = (fileName, extensions) => {
  const normalizedName = String(fileName || "").toLowerCase();
  return extensions.some((extension) => normalizedName.endsWith(extension));
};

export const isPdfFile = (file) => (
  file?.type === PDF_MIME_TYPE || hasExtension(file?.name, [".pdf"])
);

export const isImageFile = (file) => (
  IMAGE_MIME_TYPES.has(file?.type) || hasExtension(file?.name, [".jpg", ".jpeg", ".png", ".webp"])
);

