import { Eye, EyeOff, Lock, Save } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import api from "../../services/api";

const PasswordChange: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      showToast("Current password is required", "error");
      return false;
    }

    if (!formData.newPassword.trim()) {
      showToast("New password is required", "error");
      return false;
    }

    if (formData.newPassword.length < 6) {
      showToast("New password must be at least 6 characters long", "error");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      showToast(
        "New password must be different from current password",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      showToast("Password changed successfully!", "success");

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to change password";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Security Settings
              </h2>
              <p className="text-blue-600 font-medium">
                Update your account password
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">🔐</div>
            <div className="text-sm text-gray-600">Secure Account</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enhanced Current Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Enhanced New Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </button>
            </div>
            <p className="text-sm text-blue-600 mt-2 font-medium">
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Enhanced Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="relative">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30"></div>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent absolute top-0"></div>
                </div>
                <span>Changing Password...</span>
              </>
            ) : (
              <>
                <Save className="h-6 w-6" />
                <span>Change Password</span>
              </>
            )}
          </button>
        </form>

        {/* Enhanced Security Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <Lock className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-bold text-blue-900">
              Password Security Tips
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm font-semibold text-gray-800">
                  Use a combination of letters, numbers, and symbols
                </span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm font-semibold text-gray-800">
                  Make it at least 8 characters long
                </span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-orange-500 font-bold">!</span>
                <span className="text-sm font-semibold text-gray-800">
                  Don't use personal information
                </span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-red-500 font-bold">✗</span>
                <span className="text-sm font-semibold text-gray-800">
                  Don't reuse passwords from other accounts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChange;
