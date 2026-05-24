const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message, err.stack);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'An error occurred',
    status: statusCode,
  });
};

module.exports = errorHandler;
