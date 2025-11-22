export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log detailed error information
  console.error("❌ Error Details:", {
    message: err.message,
    code: err.code,
    name: err.name,
    stack: err.stack?.split("\n")[0], // First line of stack
    url: req.originalUrl,
    method: req.method,
  });

  // Database connection errors - only if it's actually a DB connection error
  // Check if error is from pg (PostgreSQL) library
  const isDbConnectionError =
    (err.code === "ECONNREFUSED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ETIMEDOUT") &&
    (err.syscall === "connect" || err.address || err.port);

  if (isDbConnectionError) {
    console.error("🔴 Database connection error detected:", {
      code: err.code,
      address: err.address,
      port: err.port,
      syscall: err.syscall,
    });
    const message = "خطا در اتصال به دیتابیس. لطفاً بعداً تلاش کنید.";
    error = { message, statusCode: 503 };
  }

  if (err.code === "28P01") {
    const message = "خطا در احراز هویت دیتابیس";
    error = { message, statusCode: 503 };
  }

  if (err.code === "3D000") {
    const message = "دیتابیس یافت نشد";
    error = { message, statusCode: 503 };
  }

  // PostgreSQL errors
  if (err.code === "23505") {
    const message = "مقدار تکراری - این رکورد قبلاً وجود دارد";
    error = { message, statusCode: 400 };
  }

  if (err.code === "23503") {
    const message = "ارجاع نامعتبر - رکورد مرتبط یافت نشد";
    error = { message, statusCode: 400 };
  }

  if (err.code === "22P02") {
    const message = "فرمت داده نامعتبر است";
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "توکن نامعتبر است";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "توکن منقضی شده است";
    error = { message, statusCode: 401 };
  }

  // Validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message, statusCode: 400 };
  }

  // Always include error code and details for debugging (even in production)
  const response = {
    success: false,
    message: error.message || "خطای سرور",
    errorCode: err.code || "UNKNOWN",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port,
      name: err.name,
    }),
  };

  res.status(error.statusCode || 500).json(response);
};

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.originalUrl} یافت نشد`,
  });
};
