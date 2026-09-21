const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists"
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
};

module.exports = {
  notFound,
  errorHandler
};
