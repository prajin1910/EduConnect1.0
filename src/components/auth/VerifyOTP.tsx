import { Code2, Database, Mail, Monitor, RefreshCw, Server, Shield, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { authAPI } from '../../services/api';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP({ email, otp });
      showToast(response, 'success');
      navigate('/login');
    } catch (error: any) {
      showToast(error.response?.data || error.message || 'OTP verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await authAPI.resendOTP(email);
      showToast(response, 'success');
      setTimeLeft(300);
    } catch (error: any) {
      showToast(error.response?.data || error.message || 'Failed to resend OTP', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Floating tech icons - Hidden on small screens */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <Code2 className="absolute top-20 left-20 w-6 h-6 text-blue-400 opacity-30 animate-float" />
        <Server className="absolute top-40 right-32 w-8 h-8 text-purple-400 opacity-20 animate-float-delay-1" />
        <Database className="absolute bottom-32 left-32 w-7 h-7 text-indigo-400 opacity-25 animate-float-delay-2" />
        <Monitor className="absolute bottom-20 right-20 w-6 h-6 text-cyan-400 opacity-30 animate-float" />
      </div>

      <div className="flex w-full relative z-10">
        {/* Left Content Section - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 p-12 xl:p-16">
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-5xl xl:text-6xl font-bold text-white mb-4">
                EduConnect
              </h1>
              <p className="text-xl text-blue-200 mb-8 leading-relaxed">
                Secure Email Verification Process
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">Secure Verification</h3>
                    <p className="text-blue-200 leading-relaxed">
                      Our advanced email verification system ensures the security and authenticity of your account using industry-standard encryption.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">Privacy Protection</h3>
                    <p className="text-blue-200 leading-relaxed">
                      Your personal information is protected with enterprise-grade security measures and complies with global privacy standards.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">Quick Access</h3>
                    <p className="text-blue-200 leading-relaxed">
                      Once verified, you'll have instant access to all platform features including personalized dashboards and learning resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-md mx-auto">
            {/* Main verification card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
              <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-blue-200 text-base sm:text-lg mb-2">
              Enter the code sent to your EduConnect email
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-blue-300 font-medium text-sm break-all">{email}</p>
            </div>
            <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-400"></div>
            </div>
          </div>

          {/* Verification form */}
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-blue-100 mb-3">
                Enter 4-Digit Verification Code
              </label>
              <div className="relative">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={4}
                  className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-center text-2xl sm:text-3xl tracking-widest font-mono transition-all duration-300 hover:bg-white/15"
                  placeholder="0000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* Timer and resend section */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex items-center justify-center space-x-2 text-blue-200">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="font-mono text-base sm:text-lg font-semibold">
                      {formatTime(timeLeft)}
                    </span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-blue-300 text-xs sm:text-sm mt-1">Time remaining</p>
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                  >
                    <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
                    {resendLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                  <p className="text-red-300 text-xs sm:text-sm mt-2">Code expired - Get a new one</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="group relative w-full flex justify-center py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl text-sm sm:text-base"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-200 group-hover:text-white transition-colors" />
              </span>
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Progress indicators */}
            <div className="flex justify-center space-x-2 mt-5 sm:mt-6">
              <div className="w-6 sm:w-8 h-1 bg-blue-500 rounded-full"></div>
              <div className="w-6 sm:w-8 h-1 bg-green-500 rounded-full"></div>
              <div className="w-6 sm:w-8 h-1 bg-white/20 rounded-full"></div>
            </div>
            <p className="text-center text-blue-300 text-xs sm:text-sm">Step 2 of 3 - Email Verification</p>
          </form>
        </div>

        {/* Help section */}
        <div className="mt-6 sm:mt-8 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center text-sm sm:text-base">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400" />
            Need Help?
          </h3>
          <div className="space-y-2 text-xs sm:text-sm text-blue-200">
            <p>• Check your spam/junk folder</p>
            <p>• Make sure you entered the correct email</p>
            <p>• Code expires in 5 minutes</p>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;