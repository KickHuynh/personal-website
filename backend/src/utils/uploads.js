const fs = require("fs");
const path = require("path");

const uploadsDir = path.resolve(__dirname, "../../uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function normalizeExtension(mimeType = "") {
  const allowed = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };

  return allowed[mimeType] || null;
}

function sanitizeFilename(name = "image") {
  return String(name)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "image";
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    base64Data: match[2],
  };
}

function saveBase64Image({ dataUrl, filename }) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new Error("Dữ liệu ảnh không hợp lệ");
  }

  const extension = normalizeExtension(parsed.mimeType);
  if (!extension) {
    throw new Error("Định dạng ảnh chưa được hỗ trợ");
  }

  ensureUploadsDir();

  const safeName = sanitizeFilename(filename);
  const finalFilename = `${Date.now()}-${safeName}${extension}`;
  const absolutePath = path.join(uploadsDir, finalFilename);

  fs.writeFileSync(absolutePath, Buffer.from(parsed.base64Data, "base64"));

  return {
    filename: finalFilename,
    relativePath: `/uploads/${finalFilename}`,
    absolutePath,
  };
}

module.exports = {
  ensureUploadsDir,
  saveBase64Image,
  uploadsDir,
};
