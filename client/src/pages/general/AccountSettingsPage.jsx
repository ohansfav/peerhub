import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  LockIcon,
  Upload,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useUpdateProfile } from "../../hooks/profile/useUpdateProfile";
import { useUpdateStudentProfile } from "../../hooks/profile/useUpdateStudentProfile";
import { useUpdateTutorProfile } from "../../hooks/profile/useUpdateTutorProfile";
import { useChangePassword } from "../../hooks/profile/useChangePassword";
import useSubjects from "../../hooks/useSubjects";
import toast from "react-hot-toast";
import { handleToastError } from "../../utils/toastDisplayHandler";
import { useUserProfile } from "../../hooks/profile/useUserProfile";
import Input from "../../components/ui/Input";
import ErrorAlert from "../../components/common/ErrorAlert";

const AccountSettingsPage = () => {
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // fetch full profile (with student/tutor relations)
  const { data: user, isLoading } = useUserProfile();

  const { subjects, subjectLoading } = useSubjects();

  // Local editable state (only set when editing starts)
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
  });
  const [roleSpecificData, setRoleSpecificData] = useState({
    gradeLevel: "",
    learningGoals: "",
    subjects: [],
    exams: [],
    bio: "",
    // education: "",
    profileVisibility: "active",
    timezone: "",
    tutorSubjects: [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfileMutation = useUpdateProfile();
  const updateStudentMutation = useUpdateStudentProfile();
  const updateTutorMutation = useUpdateTutorProfile();
  const changePasswordMutation = useChangePassword();

  // ========== Handlers ==========

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData();
    formData.append("firstName", profileData.firstName);
    formData.append("lastName", profileData.lastName);
    if (imageFile) formData.append("file", imageFile);

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        data: formData,
      });

      if (user.role === "student" && user.id) {
        await updateStudentMutation.mutateAsync({
          studentId: user.id,
          data: {
            gradeLevel: roleSpecificData.gradeLevel,
            learningGoals: roleSpecificData.learningGoals
              ? roleSpecificData.learningGoals
                  .split(",")
                  .map((g) => g.trim())
                  .filter(Boolean)
              : [],
            subjects: roleSpecificData.subjects,
            exams: roleSpecificData.exams,
          },
        });
      } else if (user.role === "tutor" && user.id) {
        await updateTutorMutation.mutateAsync({
          tutorId: user.id,
          data: {
            bio: roleSpecificData.bio,
            // education: roleSpecificData.education,
            profileVisibility: roleSpecificData.profileVisibility,
            timezone: roleSpecificData.timezone,
            subjects: roleSpecificData.tutorSubjects,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setImagePreview(null);
      setImageFile(null);
    } catch (error) {
      handleToastError(error, "Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error) {
      handleToastError(error, "Failed to change password");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSpecificChange = (e) => {
    const { name, value } = e.target;
    setRoleSpecificData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectToggle = (subjectId) => {
    const key = user.role === "tutor" ? "tutorSubjects" : "subjects";
    setRoleSpecificData((prev) => ({
      ...prev,
      [key]: prev[key].includes(subjectId)
        ? prev[key].filter((id) => id !== subjectId)
        : [...prev[key], subjectId],
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const startEditing = () => {
    if (!user) return;
    setProfileData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });
    setRoleSpecificData({
      gradeLevel: user.student?.gradeLevel || "",
      learningGoals: Array.isArray(user.student?.learningGoals)
        ? user.student.learningGoals.join(", ") // join array for textarea
        : user.student?.learningGoals || "",
      subjects: user.student?.subjects?.map((s) => s.id) || [],
      bio: user.tutor?.bio || "",
      // education: user.tutor?.education || "",
      profileVisibility: user.tutor?.profileVisibility || "active",
      timezone: user.tutor?.timezone || "",
      tutorSubjects: user.tutor?.subjects?.map((s) => s.id) || [],
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setImagePreview(null);
    setImageFile(null);
  };

  // ========== Rendering ==========

  if (isLoading) {
    return <p className="text-center py-8">Loading settings...</p>;
  }

  if (!user) {
    return <p className="text-center py-8 text-red-500">No profile found</p>;
  }

  const displayImage = imagePreview || user?.profileImageUrl;

  return (
    <div className="max-w-6xl mx-auto px-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Picture & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 overflow-hidden">
                  <img
                    src={displayImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-primary/90"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="inline-block bg-primary text-white px-3 py-1 rounded-full text-sm mt-2">
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserIcon className="w-5 h-5" /> Profile Information
                </h3>
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 text-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                // ================== Editable Form ==================
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Role-specific Fields */}
                  {user.role === "student" && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium flex items-center gap-2 text-gray-900">
                        <BookOpen className="w-4 h-4" /> Student Information
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grade Level
                        </label>
                        <input
                          type="text"
                          name="gradeLevel"
                          value={roleSpecificData.gradeLevel}
                          onChange={handleRoleSpecificChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g., SS2/SS3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Learning Goals
                        </label>
                        <textarea
                          name="learningGoals"
                          value={roleSpecificData.learningGoals}
                          onChange={handleRoleSpecificChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          rows="3"
                          placeholder="What do you want to achieve?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subjects of Interest
                        </label>
                        {subjectLoading ? (
                          <p className="text-sm text-gray-500">
                            Loading subjects...
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {subjects?.map((subject) => (
                              <button
                                key={subject.id}
                                type="button"
                                onClick={() => handleSubjectToggle(subject.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  roleSpecificData.subjects.includes(subject.id)
                                    ? "bg-primary text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {subject.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {user.role === "tutor" && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium flex items-center gap-2 text-gray-900">
                        <GraduationCap className="w-4 h-4" /> Tutor Information
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={roleSpecificData.bio}
                          onChange={handleRoleSpecificChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          rows="3"
                          maxLength={1000}
                          placeholder="Tell students about yourself..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {roleSpecificData.bio.length}/1000 characters
                        </p>
                      </div>

                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Education
                        </label>
                        <input
                          type="text"
                          name="education"
                          value={roleSpecificData.education}
                          onChange={handleRoleSpecificChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          maxLength={255}
                          placeholder="e.g., Bachelor's in Mathematics"
                        />
                      </div> */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Visibility
                          </label>
                          <select
                            name="profileVisibility"
                            value={roleSpecificData.profileVisibility}
                            onChange={handleRoleSpecificChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="active">Active</option>
                            <option value="hidden">Hidden</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Timezone
                          </label>
                          <input
                            type="text"
                            name="timezone"
                            value={roleSpecificData.timezone}
                            onChange={handleRoleSpecificChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g., UTC+1"
                            pattern="^UTC(?:[+-][0-9]{1,2})?$"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subjects You Teach{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        {subjectLoading ? (
                          <p className="text-sm text-gray-500">
                            Loading subjects...
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {subjects?.map((subject) => (
                              <button
                                key={subject.id}
                                type="button"
                                onClick={() => handleSubjectToggle(subject.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  roleSpecificData.tutorSubjects.includes(
                                    subject.id
                                  )
                                    ? "bg-primary text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {subject.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {user?.role === "tutor" &&
                          roleSpecificData.tutorSubjects.length === 0 && (
                            <p className="text-sm text-red-500 mt-1">
                              Please select at least one subject
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Save / Cancel */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                      disabled={
                        updateProfileMutation.isPending ||
                        updateStudentMutation.isPending ||
                        updateTutorMutation.isPending ||
                        (user.role === "tutor" &&
                          roleSpecificData.tutorSubjects.length === 0)
                      }
                    >
                      {updateProfileMutation.isPending ||
                      updateStudentMutation.isPending ||
                      updateTutorMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // ================== Read-Only Display ==================
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        First Name
                      </span>
                      <p className="text-gray-900">{user.firstName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Last Name
                      </span>
                      <p className="text-gray-900">{user.lastName}</p>
                    </div>
                  </div>

                  {user.role === "student" && (
                    <div className="pt-4 border-t space-y-4">
                      <h4 className="font-medium flex items-center gap-2 text-gray-900">
                        <BookOpen className="w-4 h-4" /> Student Information
                      </h4>

                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Grade Level
                        </span>
                        <p className="text-gray-900">
                          {user?.student?.gradeLevel || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Learning Goals
                        </span>
                        <p className="text-gray-900">
                          {Array.isArray(user?.student?.learningGoals)
                            ? user.student.learningGoals.join(", ")
                            : user?.student?.learningGoals ||
                              "Not specified"}{" "}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Subjects of Interest
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user?.student?.subjects?.length > 0 ? (
                            user.student.subjects.map((subject) => (
                              <span
                                key={subject.id}
                                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                              >
                                {subject.name}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No subjects selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.role === "tutor" && (
                    <div className="pt-4 border-t space-y-4">
                      <h4 className="font-medium flex items-center gap-2 text-gray-900">
                        <GraduationCap className="w-4 h-4" /> Tutor Information
                      </h4>

                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Bio
                        </span>
                        <p className="text-gray-900">
                          {user?.tutor?.bio || "No bio added yet"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* <div>
                          <span className="text-sm font-medium text-gray-600">
                            Education
                          </span>
                          <p className="text-gray-900">
                            {user?.tutor?.education || "Not specified"}
                          </p>
                        </div> */}
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Profile Status
                          </span>
                          <p className="text-gray-900">
                            {user?.tutor?.profileVisibility === "active"
                              ? "Active"
                              : "Hidden"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Timezone
                        </span>
                        <p className="text-gray-900">
                          {user?.tutor?.timezone || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Subjects You Teach
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user?.tutor?.subjects?.length > 0 ? (
                            user.tutor.subjects.map((subject) => (
                              <span
                                key={subject.id}
                                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                              >
                                {subject.name}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No subjects selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <LockIcon className="w-5 h-5" /> Change Password
                </h3>

                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {changePasswordMutation.error && (
                <ErrorAlert error={changePasswordMutation.error} />
              )}
              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <Input
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <Input
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending
                        ? "Changing..."
                        : "Change Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600">
                  Keep your account secure by using a strong password.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
