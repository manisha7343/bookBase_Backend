const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET || "bookbase_super_secret_jwt_key_2026",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
};

module.exports = generateToken;
