import { Briefcase, Code2, Database, Eye, EyeOff, GraduationCap, Monitor, Server, Shield, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showToast('Login successful!', 'success');
      
      // Wait a bit longer to ensure state is properly updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Login successful, user role:', user.role);
      
      // Navigate based on role with proper error handling
      switch (user.role) {
        case 'STUDENT':
          console.log('Redirecting to student dashboard');
          navigate('/student');
          break;
        case 'PROFESSOR':
          console.log('Redirecting to professor dashboard');
          navigate('/professor');
          break;
        case 'MANAGEMENT':
          console.log('Redirecting to management dashboard');
          navigate('/management');
          break;
        case 'ALUMNI':
          console.log('Redirecting to alumni dashboard');
          navigate('/alumni');
          break;
        default:
          console.log('Unknown role:', user.role, 'redirecting to login');
          showToast('Invalid user role. Please contact support.', 'error');
          navigate('/login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
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
        {/* Left Content Section - Consistent across login/register */}
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

        {/* Right Form Section - Compact login form */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile Logo - Only shown on small screens */}
            <div className="lg:hidden text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                EduConnect
              </h1>
              <p className="text-blue-200 text-sm sm:text-base">
                Access your digital workspace
              </p>
            </div>
            {/* Main login card - Compact size */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5">
              {/* Header - Compact */}
              <div className="text-center mb-4">
                <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Welcome Back
                </h2>
                <p className="text-blue-200 text-sm">
                  Access your EduConnect account
                </p>
              </div>

              {/* Login form - Compact */}
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 text-sm"
                        placeholder="Enter your college email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Zap className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 pr-12 text-sm"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <Shield className="h-4 w-4 text-blue-200 group-hover:text-white transition-colors" />
                  </span>
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white/10 backdrop-blur-sm text-blue-200 rounded-lg text-xs">New to the platform?</span>
                  </div>
                </div>

                {/* Register link */}
                <div className="text-center">
                  <Link
                    to="/register"
                    className="group inline-flex items-center font-medium text-blue-300 hover:text-white transition-all duration-300 transform hover:scale-105 text-sm"
                  >
                    Create your account
                    <Zap className="ml-2 h-3 w-3 group-hover:animate-pulse" />
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

export default Login;
