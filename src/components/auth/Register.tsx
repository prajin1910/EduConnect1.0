import { BookOpen, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { authAPI } from '../../services/api';

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

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    department: '',
    className: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
  ];

  const classes = ['I', 'II', 'III', 'IV'];
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  const batches = ['A', 'B', 'C'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      showToast('Name is required', 'error');
      return false;
    }
    
    if (!formData.email.trim()) {
      showToast('Email is required', 'error');
      return false;
    }
    
    if (formData.role !== 'alumni' && !formData.email.endsWith('@stjosephstechnology.ac.in')) {
      showToast('Please use your college email address (@stjosephstechnology.ac.in)', 'error');
      return false;
    }
    
    if (formData.role !== 'alumni' && !formData.password?.trim()) {
      showToast('Password is required', 'error');
      return false;
    }
    
    if (formData.role !== 'alumni' && formData.password && formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return false;
    }
    
    if (!formData.phoneNumber.trim()) {
      showToast('Phone number is required', 'error');
      return false;
    }
    
    if (!formData.department) {
      showToast('Department is required', 'error');
      return false;
    }
    
    if (formData.role === 'student' && !formData.className) {
      showToast('Class is required for students', 'error');
      return false;
    }
    
    if (formData.role === 'alumni') {
      if (!formData.graduationYear) {
        showToast('Graduation year is required for alumni', 'error');
        return false;
      }
      if (!formData.batch) {
        showToast('Batch is required for alumni', 'error');
        return false;
      }
      if (!formData.placedCompany?.trim()) {
        showToast('Company name is required for alumni', 'error');
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
      if (formData.role === 'alumni') {
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
      showToast(response, 'success');
      
      if (formData.role === 'alumni') {
        showToast('Alumni registration submitted successfully! Please wait for management approval to access the platform.', 'info');
        navigate('/login');
      } else {
        navigate('/verify-otp', { state: { email: formData.email } });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Registration failed';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600">
            Join the smart assessment platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.role === 'alumni' ? 'Enter your email' : 'Enter your college email'}
                value={formData.email}
                onChange={handleChange}
              />
              {formData.role !== 'alumni' && (
                <p className="text-xs text-gray-500 mt-1">
                  Use your college email ending with @stjosephstechnology.ac.in
                </p>
              )}
            </div>

            {formData.role !== 'alumni' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password || ''}
                  onChange={handleChange}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                name="phoneNumber"
                type="tel"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                name="department"
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <select
                  name="className"
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.className}
                  onChange={handleChange}
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.role === 'alumni' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Year *
                  </label>
                  <select
                    name="graduationYear"
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.graduationYear}
                    onChange={handleChange}
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch *
                  </label>
                  <select
                    name="batch"
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.batch}
                    onChange={handleChange}
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Company *
                  </label>
                  <input
                    name="placedCompany"
                    type="text"
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your current company name"
                    value={formData.placedCompany}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;