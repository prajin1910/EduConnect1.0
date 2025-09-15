import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import CardSwap, { Card } from "./common/CardSwap";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUpClick = () => {
    navigate("/register");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50 relative overflow-hidden">
      {/* Header with Sign Up button */}
      <header className="absolute top-0 left-0 w-full z-10 p-4 lg:p-6">
        <div className="flex justify-between items-center">
          <div className="text-xl lg:text-2xl font-bold text-emerald-700">EduConnect</div>
          <div className="flex gap-4">
            <button
              onClick={handleSignUpClick}
              className="px-4 py-2 lg:px-6 lg:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm lg:text-base"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:min-h-screen">
        {/* Mobile Layout: Login form at top */}
        <div className="lg:hidden pt-32 px-4 pb-6">
          <div className="max-w-xs mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-emerald-100">
              <div className="text-center mb-5">
                <div className="mx-auto h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center mb-3">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-emerald-800">
                  Welcome Back
                </h2>
                <p className="mt-1 text-xs text-emerald-600">
                  Sign in to your EduConnect portal
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="email-mobile" className="block text-xs font-medium text-emerald-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email-mobile"
                      name="email"
                      type="email"
                      required
                      className="appearance-none relative block w-full px-3 py-2 text-sm border border-emerald-300 placeholder-emerald-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your college email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="password-mobile" className="block text-xs font-medium text-emerald-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password-mobile"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="appearance-none relative block w-full px-3 py-2 pr-9 text-sm border border-emerald-300 placeholder-emerald-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-emerald-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="text-center">
                  <span className="text-xs text-emerald-600">Don't have an account? </span>
                  <Link
                    to="/register"
                    className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors text-xs"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile: Animation section directly below login */}
        <div className="lg:hidden px-4 pb-8 -mt-4">
          <div className="flex justify-center">
            <div style={{ height: "300px", position: "relative" }}>
              <CardSwap
                cardDistance={25}
                verticalDistance={35}
                delay={5000}
                pauseOnHover={false}
                width={240}
                height={280}
              >
                <Card>
                  <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-emerald-800 mb-1">
                      For Students
                    </h3>
                    <p className="text-xs text-emerald-600 leading-relaxed">
                      Access learning resources, connect with peers, and build
                      your professional network
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-emerald-800 mb-1">
                      For Professors
                    </h3>
                    <p className="text-xs text-emerald-600 leading-relaxed">
                      Manage courses, track student progress, and collaborate
                      with faculty members
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-emerald-800 mb-1">
                      For Alumni
                    </h3>
                    <p className="text-xs text-emerald-600 leading-relaxed">
                      Stay connected with your alma mater and mentor the next
                      generation
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-emerald-800 mb-1">
                      For Management
                    </h3>
                    <p className="text-xs text-emerald-600 leading-relaxed">
                      Oversee operations, manage resources, and drive
                      institutional growth
                    </p>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Side by side (unchanged) */}
        <div className="hidden lg:flex lg:items-center lg:justify-between w-full max-w-7xl mx-auto px-6" style={{ transform: "translateX(80px)" }}>
          {/* Left Side - Login Form */}
          <div className="flex-1 max-w-md mb-12 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
              <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-emerald-800">
                  Welcome Back
                </h2>
                <p className="mt-2 text-emerald-600">
                  Sign in to your EduConnect portal
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-emerald-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="appearance-none relative block w-full px-3 py-3 border border-emerald-300 placeholder-emerald-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your college email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-emerald-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="appearance-none relative block w-full px-3 py-3 pr-10 border border-emerald-300 placeholder-emerald-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="text-center">
                  <span className="text-emerald-600">Don't have an account? </span>
                  <Link
                    to="/register"
                    className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Card Animation */}
          <div className="flex-1 flex justify-center items-center">
            <div style={{ height: "600px", position: "relative", transform: "translate(40px, -120px)" }}>
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
                width={320}
                height={420}
              >
                <Card>
                  <div className="p-8 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-800 mb-3">
                      For Students
                    </h3>
                    <p className="text-emerald-600 leading-relaxed">
                      Access learning resources, connect with peers, and build
                      your professional network
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-8 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-800 mb-3">
                      For Professors
                    </h3>
                    <p className="text-emerald-600 leading-relaxed">
                      Manage courses, track student progress, and collaborate
                      with faculty members
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-8 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-800 mb-3">
                      For Alumni
                    </h3>
                    <p className="text-emerald-600 leading-relaxed">
                      Stay connected with your alma mater and mentor the next
                      generation
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-8 h-full flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-800 mb-3">
                      For Management
                    </h3>
                    <p className="text-emerald-600 leading-relaxed">
                      Oversee operations, manage resources, and drive
                      institutional growth
                    </p>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-300 rounded-full opacity-25 animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 right-40 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-bounce delay-500"></div>
    </div>
  );
};

export default LandingPage;
