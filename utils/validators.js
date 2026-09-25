const validRoles = ["user", "admin"];

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRegister = ({
  name,
  email,
  country,
  role,
  password,
  confirmPassword
}) => {
  if (!name || !name.trim()) {
    return { error: "Name is required" };
  }

  if (!email || !validateEmail(email)) {
    return { error: "A valid email is required" };
  }

  if (!country || !country.trim()) {
    return { error: "Country is required" };
  }

  if (role && !validRoles.includes(role.toLowerCase())) {
    return { error: "Role must be user or admin" };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { error: "Password and confirm password do not match" };
  }

  return { error: null };
};

const validateLogin = ({ email, password, role }) => {
  if (!email || !validateEmail(email)) {
    return { error: "A valid email is required" };
  }

  if (!password) {
    return { error: "Password is required" };
  }

  if (role && !validRoles.includes(role.toLowerCase())) {
    return { error: "Role must be user or admin" };
  }

  return { error: null };
};

module.exports = {
  validateRegister,
  validateLogin
};
