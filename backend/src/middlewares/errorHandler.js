/**
 * middlewares/errorHandler.js
 * Centralized Express error handler.
 *
 * Usage: app.use(errorHandler) — phải đặt CUỐI CÙNG sau tất cả routes.
 *
 * Trên production (NODE_ENV=production):
 *   - Không trả stack trace / internal error messages ra client
 *   - Chỉ log chi tiết ở server
 */

/**
 * @param {Error} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV !== "production";

  // Always log full error on server
  console.error(`[Error ${statusCode}]`, err.message);
  if (isDev) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message: isDev ? err.message : "Lỗi server. Vui lòng thử lại sau.",
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
