const sendResponse = require("@utils/sendResponse");
const UserService = require("./user.service");
const { addStreamUser } = require("../auth/auth.service");

exports.profile = async (req, res, next) => {
  try {
    const user = await UserService.fetchFullProfile(req.user.id, req.user.role);

    sendResponse(res, 200, "Profile fetch successful", user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    let fileData = {};
    if (req.file) {
      if (req.file.path && req.file.path.startsWith("http")) {
        // Cloudinary upload - path is a full URL
        fileData = {
          profileImageUrl: req.file.path,
          profileImagePublicId: req.file.filename,
        };
      } else {
        // Local upload - construct URL from filename
        fileData = {
          profileImageUrl: `/api/uploads/profiles/${req.file.filename}`,
          profileImagePublicId: null,
        };
      }
    }

    const updatedUser = await UserService.updateUser(targetId, {
      ...req.body,
      ...fileData,
    });

    await addStreamUser(updatedUser);

    sendResponse(res, 200, "Profile updated successfully", updatedUser);
  } catch (error) {
    next(error);
  }
};

// exports.profile = async (req, res, next) => {
//   try {
//     const user = await UserService.fetchProfile(req.user.id);
//     sendResponse(res, 200, "Profile fetch successful", user);
//   } catch (error) {
//     next(error);
//   }
// };

exports.deleteUser = async (req, res, next) => {
  try {
    await UserService.deleteUser(req.user.id);
    sendResponse(res, 200, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};
