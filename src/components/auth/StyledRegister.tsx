import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import { authAPI } from "../../services/api";
import { Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { TextureButton } from "../ui/texture-button";
import {
  TextureCardContent,
  TextureCardFooter,
  TextureCardHeader,
  TextureCardStyled,
  TextureCardTitle,
  TextureSeparator,
} from "../ui/texture-card";

interface FormData {
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  department: string;
  className?: string;
  role: string;
  graduationYear?: string;
  batch?: string;
  placedCompany?: string;
}

const StyledRegister: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    department: "",
    className: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const departments = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ];

  const classes = ["I", "II", "III", "IV"];
  const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024"];
  const batches = ["A", "B", "C"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      showToast("Name is required", "error");
      return false;
    }

    if (!formData.email.trim()) {
      showToast("Email is required", "error");
      return false;
    }

    if (
      formData.role !== "alumni" &&
      !formData.email.endsWith("@stjosephstechnology.ac.in")
    ) {
      showToast(
        "Please use your college email address (@stjosephstechnology.ac.in)",
        "error"
      );
      return false;
    }

    if (formData.role !== "alumni" && !formData.password?.trim()) {
      showToast("Password is required", "error");
      return false;
    }

    if (
      formData.role !== "alumni" &&
      formData.password &&
      formData.password.length < 6
    ) {
      showToast("Password must be at least 6 characters long", "error");
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      showToast("Phone number is required", "error");
      return false;
    }

    if (!formData.department) {
      showToast("Department is required", "error");
      return false;
    }

    if (formData.role === "student" && !formData.className) {
      showToast("Class is required for students", "error");
      return false;
    }

    if (formData.role === "alumni") {
      if (!formData.graduationYear) {
        showToast("Graduation year is required for alumni", "error");
        return false;
      }
      if (!formData.batch) {
        showToast("Batch is required for alumni", "error");
        return false;
      }
      if (!formData.placedCompany?.trim()) {
        showToast("Company name is required for alumni", "error");
        return false;
      }
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
      // Prepare data based on role
      const submitData = { ...formData };

      // Clean up data based on role
      if (formData.role === "alumni") {
        // Remove fields not needed for alumni
        delete submitData.className;
        delete submitData.password; // Alumni don't set password during registration
      } else {
        // Remove alumni-specific fields for regular users
        delete submitData.graduationYear;
        delete submitData.batch;
        delete submitData.placedCompany;
      }

      const response = await authAPI.register(submitData);
      showToast(response, "success");

      if (formData.role === "alumni") {
        showToast(
          "Alumni registration submitted successfully! Please wait for management approval to access the platform.",
          "info"
        );
        navigate("/login");
      } else {
        navigate("/verify-otp", { state: { email: formData.email } });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data || error.message || "Registration failed";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-white via-green-50 to-emerald-50">
      <div className="w-full max-w-2xl">
        <TextureCardStyled className="max-w-2xl">
          <TextureCardHeader className="flex flex-col gap-1 items-center justify-center">
            <div className="p-3 bg-emerald-600 rounded-full mb-3">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <TextureCardTitle>Create Account</TextureCardTitle>
            <p className="text-center text-emerald-600">
              Join the smart assessment platform
            </p>
          </TextureCardHeader>

          <TextureSeparator />

          <TextureCardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              id="registerForm"
            >
              {/* Role Selection */}
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="alumni">Alumni</option>
                </Select>
              </div>

              {/* Name and Email in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={
                      formData.role === "alumni"
                        ? "Enter your email"
                        : "Enter your college email"
                    }
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formData.role !== "alumni" && (
                    <p className="text-xs text-emerald-600 mt-1"></p>
                  )}
                </div>
              </div>

              {/* Password and Phone in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.role !== "alumni" && (
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Create a password"
                        value={formData.password || ""}
                        onChange={handleChange}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-emerald-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={formData.role === "alumni" ? "md:col-span-2" : ""}
                >
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Department and Class/Alumni fields in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </div>

                {formData.role === "student" && (
                  <div>
                    <Label htmlFor="className">Class *</Label>
                    <Select
                      id="className"
                      name="className"
                      required
                      value={formData.className}
                      onChange={handleChange}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {formData.role === "alumni" && (
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Select
                      id="graduationYear"
                      name="graduationYear"
                      required
                      value={formData.graduationYear}
                      onChange={handleChange}
                    >
                      <option value="">Select Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              {formData.role === "alumni" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch">Batch *</Label>
                    <Select
                      id="batch"
                      name="batch"
                      required
                      value={formData.batch}
                      onChange={handleChange}
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="placedCompany">Current Company *</Label>
                    <Input
                      id="placedCompany"
                      name="placedCompany"
                      type="text"
                      required
                      placeholder="Enter your current company name"
                      value={formData.placedCompany}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </form>
          </TextureCardContent>

          <TextureSeparator />

          <TextureCardFooter>
            <TextureButton
              variant="accent"
              className="w-full"
              type="submit"
              disabled={loading}
              onClick={() => {
                const form = document.getElementById(
                  "registerForm"
                ) as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }}
            >
              <div className="flex gap-2 items-center justify-center">
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </div>
            </TextureButton>
          </TextureCardFooter>

          <div className="bg-emerald-50 pt-px rounded-b-3xl overflow-hidden">
            <div className="flex flex-col items-center justify-center">
              <div className="py-3 px-6">
                <div className="text-center text-sm text-emerald-700">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </TextureCardStyled>
      </div>
    </div>
  );
};

export default StyledRegister;
