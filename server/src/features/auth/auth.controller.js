const sendResponse = require("@utils/sendResponse");
const logger = require("@src/shared/utils/logger");
const {
  addStreamUser,
  changeUserPassword,
  createUser,
  fetchProfile,
  forgotUserPassword,
  loginUser,
  resendVerificationEmail,
  resetUserPassword,
  verifyUserEmail,
} = require("./auth.service");
const {
  sendPasswordChangeSuccessEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("@src/shared/email/email.service");
const trackEvent = require("@features/events/events.service");
const eventTypes = require("@features/events/eventTypes");
const { setAuthCookie, clearAuthCookie } = require("@src/shared/utils/cookies");

exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password,
    });

    await addStreamUser(newUser);

    await trackEvent(eventTypes.USER_SIGNED_UP, {
      userId: newUser.id,
      email: newUser.email,
      fullName: `${newUser.firstName} ${newUser.lastName}`,
    }).catch((err) => logger.warn("Failed to track signup event:", err.message));

    sendResponse(res, 201, "Account created successfully. Please sign in.", {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role || null,
      isVerified: newUser.isVerified,
      isOnboarded: newUser.isOnboarded,
      profileImageUrl: newUser.profileImageUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await loginUser({ ...req.body });
    
    // Skip email verification check in development mode
    const isDevMode = process.env.NODE_ENV === "development";
    if (!isDevMode && !user.isVerified) {
      const token = user.generateAuthToken();
      setAuthCookie(res, token);
      return sendResponse(res, 200, "Please verify your email", {
        id: user.id,
        email: user.email,
        isVerified: false,
        requiresVerification: true,
      });
    }
    
    const token = user.generateAuthToken();

    await trackEvent(eventTypes.USER_LOGGED_IN, {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      date: user.lastLogin,
    });

    setAuthCookie(res, token);

    sendResponse(res, 200, "User signed in successfully", {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
      isOnboarded: user.isOnboarded,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await fetchProfile(req.user.id);
    sendResponse(res, 200, "Profile fetch successful", user);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res, next) => {
  clearAuthCookie(res);

  sendResponse(res, 200, "Logout Successful");
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const verifiedUser = await verifyUserEmail(code);

    // Set auth cookie AFTER successful email verification
    const token = verifiedUser.generateAuthToken();
    setAuthCookie(res, token);

    await sendWelcomeEmail(verifiedUser.email, verifiedUser.firstName);
    await trackEvent(eventTypes.USER_VERIFIED_EMAIL, {
      userId: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
      fullName: `${verifiedUser.firstName} ${verifiedUser.lastName}`,
    });
    sendResponse(res, 200, "Email verified successfully", {
      id: verifiedUser.id,
      email: verifiedUser.email,
    });
  } catch (error) {
    next(error);
  }
};

exports.resendEmail = async (req, res, next) => {
  try {
    const user = await resendVerificationEmail(req.user.id);
    await sendVerificationEmail(user.email, user.verificationToken);

    sendResponse(res, 200, "Verification email resent successfully");
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await forgotUserPassword(req.body.email);

    if (result) {
      await sendPasswordResetEmail(
        result.userEmail,
        `${process.env.CLIENT_URL}/reset-password/${result.resetToken}`
      );
    }
    sendResponse(res, 200, "Password reset link sent to your email");
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const email = await resetUserPassword(token, req.body.password);

    await sendResetSuccessEmail(email);
    sendResponse(res, 200, "Password reset successful");
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await changeUserPassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    await sendPasswordChangeSuccessEmail(result.email);
    sendResponse(res, 200, "Password changed successfully", {
      id: result.id,
      email: result.email,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DEVELOPMENT/TEST ENDPOINTS ====================
// These endpoints only work in development mode to help with testing

/**
 * @route   GET /api/auth/test/verify-last
 * @desc    AUTO-VERIFY the last unverified user (DEV ONLY)
 * @access  Public (dev only)
 * TEST: http://localhost:3000/api/auth/test/verify-last
 */
exports.testVerifyLastUser = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return sendResponse(res, 403, "This endpoint is only available in development mode");
    }

    const { User } = require("@models");
    const lastUnverifiedUser = await User.findOne({
      where: { isVerified: false },
      order: [["createdAt", "DESC"]],
    });

    if (!lastUnverifiedUser) {
      return sendResponse(res, 404, "No unverified users found");
    }

    // Verify the user
    lastUnverifiedUser.isVerified = true;
    lastUnverifiedUser.verificationToken = null;
    lastUnverifiedUser.verificationTokenExpiresAt = null;
    await lastUnverifiedUser.save();

    // Generate and set auth token
    const token = lastUnverifiedUser.generateAuthToken();
    setAuthCookie(res, token);

    sendResponse(res, 200, "✅ User auto-verified (DEV MODE)", {
      id: lastUnverifiedUser.id,
      email: lastUnverifiedUser.email,
      message: "You can now see what happens after verification!",
    });
  } catch (error) {
    next(error);
  }
};
