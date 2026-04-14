const { createHttpError } = require("../utils/httpErrors");
const { saveBase64Image } = require("../utils/uploads");

function resolvePublicUrl(req, relativePath) {
  const forwardedProto = req.get("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}${relativePath}`;
}

const uploadImage = async (req, res, next) => {
  try {
    const { data_url, filename } = req.body;

    if (!data_url) {
      throw createHttpError(400, "Thiếu dữ liệu ảnh để upload");
    }

    const result = saveBase64Image({
      dataUrl: data_url,
      filename,
    });

    return res.status(201).json({
      success: true,
      message: "Upload ảnh thành công",
      data: {
        filename: result.filename,
        path: result.relativePath,
        url: resolvePublicUrl(req, result.relativePath),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
};
