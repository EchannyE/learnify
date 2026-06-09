/**
 * 404 NOT FOUND MIDDLEWARE
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * GLOBAL ERROR HANDLER
 * Safe for production (Vercel / Render / Railway)
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  res.status(statusCode);

  // 🔥 Log full error internally (server only)
  console.error("🔥 SERVER ERROR:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.json({
    success: false,
    message: err.message || "Internal Server Error",

    // ✅ Never expose stack trace in production
    stack: process.env.NODE_ENV === "development"
      ? err.stack
      : undefined
  });
};
