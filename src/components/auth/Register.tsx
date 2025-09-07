import { Briefcase, Code2, Database, Eye, EyeOff, GraduationCap, Monitor, Server, Shield, Users, Zap } from 'lucide-react';
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-5 w-5" />;
      case 'professor': return <Users className="h-5 w-5" />;
      case 'alumni': return <Briefcase className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Floating tech icons - Hidden on small screens */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <Code2 className="absolute top-20 left-20 w-6 h-6 text-blue-400 opacity-30 animate-float" />
        <Server className="absolute top-40 right-32 w-8 h-8 text-purple-400 opacity-20 animate-float-delay-1" />
        <Database className="absolute bottom-32 left-32 w-7 h-7 text-indigo-400 opacity-25 animate-float-delay-2" />
        <Monitor className="absolute bottom-20 right-20 w-6 h-6 text-cyan-400 opacity-30 animate-float" />
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen relative z-10">
        {/* Left Content Section - Same as Login */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-6 xl:px-8">
          <div className="max-w-lg mx-auto w-full">
            {/* Logo/Brand */}
            <div className="mb-6">
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-3">
                EduConnect
              </h1>
              <p className="text-lg text-blue-200 mb-4 leading-relaxed">
                Empowering Educational Excellence Through Technology
              </p>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            </div>

            {/* Compact Features */}
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Smart Learning</h3>
                    <p className="text-blue-200 text-sm">AI-driven insights and personalized curriculum</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Professional Network</h3>
                    <p className="text-blue-200 text-sm">Connect with industry professionals</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Career Growth</h3>
                    <p className="text-blue-200 text-sm">Certifications and job placement support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section - Compact Register Form */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile Logo - Only shown on small screens */}
            <div className="lg:hidden text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                EduConnect
              </h1>
              <p className="text-blue-200 text-sm">
                Create your educational journey
              </p>
            </div>
            {/* Main register card - Compact */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5">
              {/* Header - Compact */}
              <div className="text-center mb-4">
                <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Join EduConnect
                </h2>
                <p className="text-blue-200 text-sm">
                  Create your educational journey
                </p>
              </div>

              {/* Register form - Compact */}
              <form className="space-y-3" onSubmit={handleSubmit}>
                {/* Role selection - Compact */}
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Choose Your Role *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['student', 'professor', 'alumni'].map((role) => (
                      <label key={role} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={formData.role === role}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`p-2 rounded-lg border-2 transition-all duration-300 ${
                          formData.role === role
                            ? 'border-blue-400 bg-blue-500/20 text-white'
                            : 'border-white/20 bg-white/5 text-blue-200 hover:bg-white/10'
                        }`}>
                          <div className="flex flex-col items-center space-y-1">
                            {getRoleIcon(role)}
                            <span className="text-xs font-medium capitalize">{role}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">
                      Full Name *
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 text-sm"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">
                      Phone Number *
                    </label>
                    <input
                      name="phoneNumber"
                      type="tel"
                      required
                      className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 text-sm"
                      placeholder="Enter phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 pr-10 text-sm"
                      placeholder={formData.role === 'alumni' ? 'Enter your email' : 'Enter your college email'}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Zap className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                </div>

                {formData.role !== 'alumni' && (
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 pr-12 text-sm"
                        placeholder="Create a secure password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-blue-300 hover:text-white" />
                        ) : (
                          <Eye className="h-4 w-4 text-blue-300 hover:text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    required
                    className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 text-sm"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="" className="bg-slate-800 text-white">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept} className="bg-slate-800 text-white">{dept}</option>
                    ))}
                  </select>
                </div>

                {formData.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">
                      Class *
                    </label>
                    <select
                      name="className"
                      required
                      className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 text-sm"
                      value={formData.className}
                      onChange={handleChange}
                    >
                      <option value="" className="bg-slate-800 text-white">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls} className="bg-slate-800 text-white">{cls}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === 'alumni' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-100 mb-1">
                          Graduation Year *
                        </label>
                        <select
                          name="graduationYear"
                          required
                          className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 text-sm"
                          value={formData.graduationYear}
                          onChange={handleChange}
                        >
                          <option value="" className="bg-slate-800 text-white">Select Year</option>
                          {years.map(year => (
                            <option key={year} value={year} className="bg-slate-800 text-white">{year}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-100 mb-1">
                          Batch *
                        </label>
                        <select
                          name="batch"
                          required
                          className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 text-sm"
                          value={formData.batch}
                          onChange={handleChange}
                        >
                          <option value="" className="bg-slate-800 text-white">Select Batch</option>
                          {batches.map(batch => (
                            <option key={batch} value={batch} className="bg-slate-800 text-white">{batch}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-100 mb-1">
                        Current Company *
                      </label>
                      <input
                        name="placedCompany"
                        type="text"
                        required
                        className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 text-sm"
                        placeholder="Enter your current company"
                        value={formData.placedCompany}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <Users className="h-4 w-4 text-purple-200 group-hover:text-white transition-colors" />
                  </span>
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white/10 backdrop-blur-sm text-blue-200 rounded-lg text-xs">Already have an account?</span>
                  </div>
                </div>

                {/* Login link */}
                <div className="text-center">
                  <Link
                    to="/login"
                    className="group inline-flex items-center font-medium text-purple-300 hover:text-white transition-all duration-300 transform hover:scale-105 text-sm"
                  >
                    Sign in to your account
                    <Shield className="ml-2 h-3 w-3 group-hover:animate-pulse" />
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
