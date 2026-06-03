// Global error handler — must be registered last in server.js.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message
  });
};
