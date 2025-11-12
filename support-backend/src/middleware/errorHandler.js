export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // PostgreSQL errors
  if (err.code === '23505') {
    const message = 'مقدار تکراری - این رکورد قبلاً وجود دارد';
    error = { message, statusCode: 400 };
  }

  if (err.code === '23503') {
    const message = 'ارجاع نامعتبر - رکورد مرتبط یافت نشد';
    error = { message, statusCode: 400 };
  }

  if (err.code === '22P02') {
    const message = 'فرمت داده نامعتبر است';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'توکن نامعتبر است';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'توکن منقضی شده است';
    error = { message, statusCode: 401 };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'خطای سرور',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.originalUrl} یافت نشد`,
  });
};
