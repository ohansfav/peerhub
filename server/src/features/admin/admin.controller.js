// Create user (student or tutor)
exports.createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    sendResponse(res, 201, "User created successfully", user);
  } catch (error) {
    next(error);
  }
};

// Update user (student or tutor)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    sendResponse(res, 200, "User updated successfully", user);
  } catch (error) {
    next(error);
  }
};
const sendResponse = require("@utils/sendResponse");
const {
  sendApprovalEmail,
  sendRejectionEmail,
} = require("@src/shared/email/email.service");
const adminService = require("./admin.service");

// =====================
// User Operations
// =====================

exports.getAllUsers = async (req, res, next) => {
  try {
    // use query params to get by tutor or students, just deleted, suspended, onboarded or all users
    const users = await adminService.getUsers(req.query);
    sendResponse(res, 200, "Users fetched successfully", users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUser(req.params.id);
    sendResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

exports.restoreUser = async (req, res, next) => {
  try {
    const user = await adminService.restoreUser(req.params.id);
    sendResponse(res, 200, "User restored successfully", user);
  } catch (error) {
    next(error);
  }
};

exports.getUserSummaryCounts = async (req, res, next) => {
  try {
    const counts = await adminService.getUserCounts();
    sendResponse(res, 200, "User summary counts fetched successfully", counts);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const [counts, pendingTutors, students] = await Promise.all([
      adminService.getUserCounts(),
      adminService.getAllPendingTutors(),
      adminService.getUsers({ role: "student", page: 1, limit: 5 }),
    ]);

    sendResponse(res, 200, "Admin dashboard summary fetched successfully", {
      counts,
      pendingTutors,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Pending Tutor Operations
// =====================

exports.getPendingTutors = async (req, res, next) => {
  try {
    const tutors = await adminService.getAllPendingTutors();
    sendResponse(res, 200, "Pending tutors fetched successfully", tutors);
  } catch (error) {
    next(error);
  }
};

exports.getPendingTutorById = async (req, res, next) => {
  try {
    const includeSignedUrl = true;
    const tutor = await adminService.getTutor(req.params.id, {
      includeSignedUrl,
    });
    sendResponse(res, 200, "Pending tutor fetched successfully", tutor);
  } catch (error) {
    next(error);
  }
};

exports.getTutorDocument = async (req, res, next) => {
  try {
    const { signedUrl } = await adminService.getTutorDocument(req.params.id);
    sendResponse(res, 200, "Tutor document fetched successfully", {
      documentUrl: signedUrl,
    });
  } catch (err) {
    next(err);
  }
};

exports.approveTutor = async (req, res, next) => {
  try {
    const tutor = await adminService.approveTutor(req.params.id);
    await sendApprovalEmail(tutor.user.email, tutor.user.firstName);
    sendResponse(res, 200, "Tutor approved successfully", tutor);
  } catch (error) {
    next(error);
  }
};

exports.rejectTutor = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const tutor = await adminService.rejectTutor(
      req.params.id,
      rejectionReason
    );
    await sendRejectionEmail(
      tutor.user.email,
      tutor.user.firstName,
      tutor.rejectionReason
    );
    sendResponse(res, 200, "Tutor rejected successfully", tutor);
  } catch (error) {
    next(error);
  }
};

// =====================
// Super Admin Operations
// =====================

exports.createAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, isSuperAdmin } = req.body;

    const newAdmin = await adminService.createAdmin({
      firstName,
      lastName,
      email,
      password,
      isSuperAdmin,
    });

    const result = {
      id: newAdmin.id,
      email: newAdmin.email,
      fullName: `${newAdmin.firstName} ${newAdmin.lastName}`,
      isSuperAdmin: newAdmin.isSuperAdmin,
      role: newAdmin.role,
      profileImageUrl: newAdmin.profileImageUrl,
      createdAt: newAdmin.createdAt,
    };

    sendResponse(res, 201, "Admin created successfully", result);
  } catch (error) {
    next(error);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdmins();
    sendResponse(res, 200, "All admins fetched successfully", admins);
  } catch (error) {
    next(error);
  }
};

// =====================
// Suspend / Unsuspend / Delete / Update
// =====================

exports.suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await adminService.suspendUser(req.params.id, reason);
    sendResponse(res, 200, "User suspended successfully", user);
  } catch (error) {
    next(error);
  }
};

exports.unsuspendUser = async (req, res, next) => {
  try {
    const user = await adminService.unsuspendUser(req.params.id);
    sendResponse(res, 200, "User unsuspended successfully", user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    sendResponse(res, 200, "User deleted successfully", result);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    sendResponse(res, 200, "User updated successfully", user);
  } catch (error) {
    next(error);
  }
};

// =====================
// Course Management
// =====================

exports.getAllCourses = async (req, res, next) => {
  try {
    const result = await adminService.getAllCourses(req.query);
    sendResponse(res, 200, "Courses fetched", result);
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const course = await adminService.createCourse(req.body);
    sendResponse(res, 201, "Course created successfully", course);
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await adminService.updateCourse(req.params.id, req.body);
    sendResponse(res, 200, "Course updated successfully", course);
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const result = await adminService.deleteCourse(req.params.id);
    sendResponse(res, 200, "Course deleted successfully", result);
  } catch (error) {
    next(error);
  }
};
