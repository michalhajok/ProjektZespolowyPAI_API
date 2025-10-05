// Globalny handler błędów – rejestrować po wszystkich trasach
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const details = process.env.NODE_ENV === "production" ? undefined : err.stack;
  res
    .status(status)
    .json({
      status: "error",
      message,
      error: details ? { details } : undefined,
    });
};
