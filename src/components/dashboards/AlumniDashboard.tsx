import {
  Brain,
  Briefcase,
  Calendar,
  GraduationCap,
  Heart,
  Lock,
  LogOut,
  MessageSquare,
  Plus,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Menu,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { alumniAPI } from "../../services/api";
import AIStudentAnalysis from "../features/AIStudentAnalysis";
import AlumniDirectoryNew from "../features/AlumniDirectoryNew";
import AlumniEventRequest from "../features/AlumniEventRequest";
import AlumniManagementRequests from "../features/AlumniManagementRequests";
import AlumniProfileNew from "../features/AlumniProfileNew";
import ConnectionRequests from "../features/ConnectionRequests";
import EventsDashboard from "../features/EventsDashboard";
import EventsView from "../features/EventsView";
import JobBoardFixed from "../features/JobBoardFixed";
import PasswordChange from "../features/PasswordChange";
import UserChat from "../features/UserChat";

interface AlumniStats {
  networkConnections: number;
  eventsCount: number;
  jobsPosted: number;
}

const AlumniDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<AlumniStats>({
    networkConnections: 0,
    eventsCount: 0,
    jobsPosted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showToast } = useToast();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadStats();

    // Listen for connection updates to refresh stats
    const handleConnectionUpdate = () => {
      loadStats(true);
    };

    // Listen for job updates to refresh stats
    const handleJobUpdate = () => {
      loadStats(true);
    };

    window.addEventListener("connectionUpdated", handleConnectionUpdate);
    window.addEventListener("jobUpdated", handleJobUpdate);

    return () => {
      window.removeEventListener("connectionUpdated", handleConnectionUpdate);
      window.removeEventListener("jobUpdated", handleJobUpdate);
    };
  }, []);

  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoading(true);
      }
      const response = await alumniAPI.getAlumniStats();
      setStats(response);

      if (isRefresh) {
        showToast("Statistics refreshed successfully", "success");
      }
    } catch (error: any) {
      console.error("Failed to load alumni stats:", error);

      if (isRefresh) {
        showToast("Failed to refresh statistics", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const mainTabs = [
    { id: "dashboard", name: "Dashboard", icon: User },
    { id: "profile", name: "Profile", icon: User },
    { id: "directory", name: "Alumni Directory", icon: Users },
    { id: "connections", name: "Connections", icon: UserCheck },
    { id: "chat", name: "Messages", icon: MessageSquare },
  ];

  const professionalTabs = [
    { id: "jobs", name: "Job Board", icon: Briefcase },
    { id: "events", name: "Events", icon: Calendar },
    { id: "request-event", name: "Request Event", icon: Plus },
  ];

  const managementTabs = [
    {
      id: "alumni-managment-requests",
      name: "Alumni Requests",
      icon: GraduationCap,
    },
    {
      id: "resume-analysis",
      name: "Resume Analysis",
      icon: Brain,
    },
  ];

  const renderActiveComponent = () => {
    if (loading && activeTab !== "dashboard") {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return null; // Dashboard content is rendered in main area
      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Navigation */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveProfileTab("profile")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeProfileTab === "profile"
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-purple-600 hover:bg-white/50"
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setActiveProfileTab("security")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeProfileTab === "security"
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-purple-600 hover:bg-white/50"
                  }`}
                >
                  Security Settings
                </button>
              </div>
            </div>

            {/* Profile Content */}
            {activeProfileTab === "profile" ? (
              <AlumniProfileNew />
            ) : (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Security Settings
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Manage your account security and password settings.
                  </p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <PasswordChange />
                </div>
              </div>
            )}
          </div>
        );
      case "directory":
        return <AlumniDirectoryNew />;
      case "connections":
        return <ConnectionRequests />;
      case "jobs":
        return <JobBoardFixed />;
      case "events":
        return <EventsView />;
      case "request-event":
        return <AlumniEventRequest />;
      case "alumni-managment-requests":
        return <AlumniManagementRequests />;
      case "resume-analysis":
        return <AIStudentAnalysis />;
      case "chat":
        return <UserChat />;
      default:
        return null;
    }
  };

  const CircularProgress = ({
    percentage,
    color,
  }: {
    percentage: number;
    color: string;
  }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-700">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static lg:translate-x-0 top-0 left-0 z-50
        w-64 sm:w-72 md:w-80 lg:w-64 xl:w-72 2xl:w-80
        h-full lg:h-auto
        bg-gradient-to-b from-purple-400 to-purple-600 
        text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-purple-300/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Logo/Brand */}
        <div className="p-4 lg:p-6 border-b border-purple-300/20">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 lg:h-6 lg:w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold truncate">
                Alumni Network
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          {/* Main Section */}
          <div className="mb-4 lg:mb-6">
            <div className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-2 lg:mb-3 px-2 lg:px-3">
              Main
            </div>
            <div className="space-y-1">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    className={`w-full flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg text-left transition-all duration-200 text-sm lg:text-sm ${
                      isActive
                        ? "bg-white text-purple-700 shadow-lg font-medium"
                        : "text-purple-100 hover:bg-purple-300/20 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Professional Section */}
          <div className="mb-4 lg:mb-6">
            <div className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-2 lg:mb-3 px-2 lg:px-3">
              Professional
            </div>
            <div className="space-y-1">
              {professionalTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    className={`w-full flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg text-left transition-all duration-200 text-sm lg:text-sm ${
                      isActive
                        ? "bg-white text-purple-700 shadow-lg font-medium"
                        : "text-purple-100 hover:bg-purple-300/20 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Management Section */}
          <div>
            <div className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-2 lg:mb-3 px-2 lg:px-3">
              Management
            </div>
            <div className="space-y-1">
              {managementTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    className={`w-full flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg text-left transition-all duration-200 text-sm lg:text-sm ${
                      isActive
                        ? "bg-white text-purple-700 shadow-lg font-medium"
                        : "text-purple-100 hover:bg-purple-300/20 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-3 lg:p-4 border-t border-purple-300/20">
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg hover:bg-purple-300/20 transition-colors"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-white truncate text-sm lg:text-base">
                  {user?.name}
                </div>
                <div className="text-xs lg:text-sm text-purple-200">Alumni</div>
              </div>
            </button>

            {profileMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setActiveProfileTab("profile");
                    setProfileMenuOpen(false);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">View Profile</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setActiveProfileTab("security");
                    setProfileMenuOpen(false);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Security Settings</span>
                </button>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer with Visual Indicator */}
        <div className="p-3 lg:p-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* Page Title for Mobile */}
              <div className="lg:hidden">
                <h1 className="text-lg font-semibold text-gray-900 capitalize">
                  {activeTab.replace('-', ' ')}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="hidden md:inline">Active Status</span>
                <span className="md:hidden">Active</span>
              </div>
              
              {/* Mobile Profile Quick Access */}
              <div className="lg:hidden">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center"
                >
                  <User className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-gray-50">
          {activeTab === "dashboard" ? (
            <div className="space-y-4 lg:space-y-6">
              {/* University Info Card */}
              <div className="bg-gradient-to-r from-white to-purple-50 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-3 lg:mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                          {user?.name || "Alumni"} Dashboard
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 truncate">
                          <span className="hidden sm:inline">Computer Science Alumni • Class of 2020 • Professional Network</span>
                          <span className="sm:hidden">CS Alumni • Class of 2020</span>
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 lg:mt-6">
                      <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1">
                          {stats.networkConnections}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          <span className="hidden sm:inline">Network Connections</span>
                          <span className="sm:hidden">Connections</span>
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">
                          {stats.eventsCount}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          <span className="hidden sm:inline">Events Attended</span>
                          <span className="sm:hidden">Events</span>
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                          {stats.jobsPosted}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          <span className="hidden sm:inline">Opportunities Shared</span>
                          <span className="sm:hidden">Opportunities</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Refresh button removed */}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                {/* Analytics Section */}
                <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                  {/* Upcoming Events */}
                  <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Upcoming Events
                      </h3>
                      <button
                        onClick={() => setActiveTab("events")}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium self-start sm:self-auto"
                      >
                        <span className="hidden sm:inline">View All Events →</span>
                        <span className="sm:hidden">View All →</span>
                      </button>
                    </div>
                    <EventsDashboard />
                  </div>

                  {/* Professional Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-3 lg:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          <span className="hidden sm:inline">Career Impact</span>
                          <span className="sm:hidden">Impact</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            {stats.jobsPosted + stats.networkConnections}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 lg:mb-4">
                        <span className="hidden sm:inline">total contributions</span>
                        <span className="sm:hidden">contributions</span>
                      </p>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">This Quarter</span>
                        <span className="text-green-600 font-medium">
                          +{stats.jobsPosted * 2}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                        <span className="hidden sm:inline">Alumni Engagement</span>
                        <span className="sm:hidden">Engagement</span>
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 lg:mb-4 space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm text-gray-600">
                              <span className="hidden sm:inline">Active Alumni</span>
                              <span className="sm:hidden">Active</span>
                            </span>
                          </div>
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            {Math.min(
                              Math.round(
                                (stats.networkConnections /
                                  (stats.networkConnections + 20)) *
                                  100
                              ),
                              95
                            )}
                            %
                          </div>
                        </div>
                        <div className="self-center sm:self-auto">
                          <CircularProgress
                            percentage={Math.min(
                              Math.round(
                                (stats.networkConnections /
                                  (stats.networkConnections + 20)) *
                                  100
                              ),
                              95
                            )}
                            color="#a855f7"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-gray-600 flex-1">
                          <span className="hidden sm:inline">New Graduates</span>
                          <span className="sm:hidden">New Grads</span>
                        </span>
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          {Math.max(
                            100 -
                              Math.round(
                                (stats.networkConnections /
                                  (stats.networkConnections + 20)) *
                                  100
                              ),
                            5
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4 lg:space-y-6">
                  {/* Profile Card */}
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 sm:p-5 lg:p-6 text-white">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      {/* Refresh button removed */}
                    </div>
                    <div className="mb-3 lg:mb-4">
                      <h3 className="text-base sm:text-lg font-bold truncate">{user?.name}</h3>
                      <p className="text-sm sm:text-base text-purple-100">
                        <span className="hidden sm:inline">Alumni Network Member</span>
                        <span className="sm:hidden">Alumni Member</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <span className="hidden sm:inline">Manage Profile</span>
                      <span className="sm:hidden">Profile</span>
                    </button>
                  </div>

                  {/* Alumni Network */}
                  <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        <span className="hidden sm:inline">Your Network</span>
                        <span className="sm:hidden">Network</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab("connections")}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        <span className="hidden sm:inline">View All</span>
                        <span className="sm:hidden">All</span>
                      </button>
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      {/* Real network preview */}
                      <div className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            <span className="hidden sm:inline">Recent Connection</span>
                            <span className="sm:hidden">Recent</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            <span className="hidden sm:inline">Software Engineer at Tech Corp</span>
                            <span className="sm:hidden">Software Engineer</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {stats.networkConnections} <span className="hidden sm:inline">Total Connections</span><span className="sm:hidden">Connections</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            <span className="hidden sm:inline">Active in your network</span>
                            <span className="sm:hidden">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                      <span className="hidden sm:inline">Quick Actions</span>
                      <span className="sm:hidden">Actions</span>
                    </h3>
                    <div className="space-y-2 lg:space-y-3">
                      <button
                        onClick={() => setActiveTab("jobs")}
                        className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            <span className="hidden sm:inline">Post Job Opening</span>
                            <span className="sm:hidden">Post Job</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            <span className="hidden sm:inline">Share opportunities</span>
                            <span className="sm:hidden">Share ops</span>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("request-event")}
                        className="w-full flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            <span className="hidden sm:inline">Request Event</span>
                            <span className="sm:hidden">Event</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            <span className="hidden sm:inline">Organize networking</span>
                            <span className="sm:hidden">Organize</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Professional Growth */}
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        <span className="hidden sm:inline">Professional Growth</span>
                        <span className="sm:hidden">Growth</span>
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 lg:mb-4">
                      <span className="hidden sm:inline">Expand your network and enhance your career opportunities through alumni connections.</span>
                      <span className="sm:hidden">Expand your network through alumni connections.</span>
                    </p>
                    <button
                      onClick={() => setActiveTab("directory")}
                      className="w-full bg-white hover:bg-gray-50 text-purple-700 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <span className="hidden sm:inline">Explore Alumni Directory</span>
                      <span className="sm:hidden">Explore Directory</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
              {renderActiveComponent()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AlumniDashboard;