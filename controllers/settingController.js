const Setting = require("../models/Setting");

// Helper to get or initialize default settings
const getOrCreateSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({
      libraryName: "BookBase Central Library",
      maxBooksPerUser: 5,
      borrowDuration: 14,
      contactEmail: "admin@bookbase.library",
      contactPhone: "+91 98765 43210",
      libraryAddress: "123 Campus Central Library",
      finePerDay: 5
    });
  }
  return settings;
};

// @desc    Get current library settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();

    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update library settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
const updateSettings = async (req, res, next) => {
  try {
    const {
      libraryName,
      maxBooksPerUser,
      borrowDuration,
      contactEmail,
      contactPhone,
      libraryAddress,
      finePerDay
    } = req.body;

    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting();
    }

    if (libraryName !== undefined) settings.libraryName = libraryName;
    if (maxBooksPerUser !== undefined) settings.maxBooksPerUser = maxBooksPerUser;
    if (borrowDuration !== undefined) settings.borrowDuration = borrowDuration;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (libraryAddress !== undefined) settings.libraryAddress = libraryAddress;
    if (finePerDay !== undefined) settings.finePerDay = finePerDay;

    const updatedSettings = await settings.save();

    return res.status(200).json({
      success: true,
      message: "Library settings updated successfully",
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
