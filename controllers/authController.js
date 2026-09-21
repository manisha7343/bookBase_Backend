const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validateRegister, validateLogin } = require("../utils/validators");

const register = async (req, res, next) => {
  try {
    const { error } = validateRegister(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const { name, email, country, role, password } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      country,
      role: role.toLowerCase(),
      password: hashedPassword
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const { email, password, role } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked"
      });
    }

    if (user.role !== role.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Selected role does not match this account"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getMe
};
