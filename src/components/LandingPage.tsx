import React from "react";
import { useNavigate } from "react-router-dom";
import CardSwap, { Card } from "./common/CardSwap";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50 relative overflow-hidden">
      {/* Header with Sign Up button */}
      <header className="absolute top-0 left-0 w-full z-10 p-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-emerald-700">EduConnect</div>
          <div className="flex gap-4">
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 text-emerald-700 hover:text-emerald-800 font-medium transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUpClick}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6">
          {/* Left Side - Content */}
          <div className="flex-1 max-w-2xl mb-12 lg:mb-0">
            <h1 className="text-5xl lg:text-7xl font-bold text-emerald-800 mb-6 leading-tight">
              Connect, Learn,
              <br />
              <span className="text-green-600">Grow Together</span>
            </h1>
            <p className="text-xl text-emerald-700 mb-8 leading-relaxed">
              Join our educational community where students, professors, alumni,
              and management collaborate to create meaningful learning
              experiences and build lasting connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSignUpClick}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started Today
              </button>
              <button
                onClick={handleLoginClick}
                className="px-8 py-4 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                Already a Member?
              </button>
            </div>
          </div>

          {/* Right Side - Card Animation */}
          <div className="flex-1 flex justify-center items-center">
            <div style={{ height: "600px", position: "relative" }}>
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
