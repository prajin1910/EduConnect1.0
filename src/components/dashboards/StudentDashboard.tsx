import {
  Brain,
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  GraduationCap,
  MessageCircle,
  User,
  Users,
  Bell,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  BarChart3,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { assessmentAPI, studentAPI, taskAPI } from "../../services/api";
import ActivityHeatmap from "../features/ActivityHeatmap";
import AIAssessment from "../features/AIAssessment";
import AIChat from "../features/AIChat";
import AlumniDirectory from "../features/AlumniDirectory";
import ClassAssessments from "../features/ClassAssessments";
import EventsView from "../features/EventsView";
import JobBoardEnhanced from "../features/JobBoardEnhanced";
import PasswordChange from "../features/PasswordChange";
import ResumeManager from "../features/ResumeManager";
import StudentAttendanceView from "../features/StudentAttendanceView";
import StudentProfile from "../features/StudentProfile";
import TaskManagement from "../features/TaskManagement";
import UserChat from "../features/UserChat";
import "./StudentDashboard.css";

interface DashboardStats {
  aiAssessments: number;
  classTests: number;
  activeTasks: number;
  alumniConnections: number;
}

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<DashboardStats>({
    aiAssessments: 0,
    classTests: 0,
    activeTasks: 0,
    alumniConnections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) {
        const target = event.target as HTMLElement;
        if (!target.closest(".notification-container")) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      console.log(
        "StudentDashboard: Loading dashboard stats for user:",
        user?.name
      );

      try {
        const [assessments, tasks] = await Promise.allSettled([
          assessmentAPI.getStudentAssessments(),
          taskAPI.getUserTasks(),
        ]);

        let classTestCount = 0;
        let activeTaskCount = 0;

        if (assessments.status === "fulfilled" && assessments.value) {
          const assessmentData = assessments.value;
          classTestCount = assessmentData.filter(
            (a: any) => a.type === "CLASS_ASSESSMENT" || a.type === "CLASS_TEST"
          ).length;
        }

        if (tasks.status === "fulfilled" && tasks.value) {
          activeTaskCount = tasks.value.filter(
            (t: any) =>
              t.status === "IN_PROGRESS" ||
              t.status === "PENDING" ||
              t.status === "TODO"
          ).length;
        }

        let aiAssessmentCountFromProfile = 0;
        let connectionCountFromProfile = 0;
        try {
          const profileResponse = await studentAPI.getMyProfile();
          console.log(
            "StudentDashboard: Profile response for stats:",
            profileResponse
          );
          aiAssessmentCountFromProfile = profileResponse.aiAssessmentCount || 0;
          connectionCountFromProfile = profileResponse.connectionCount || 0;
          console.log(
            "StudentDashboard: AI assessments:",
            aiAssessmentCountFromProfile,
            "Connections:",
            connectionCountFromProfile
          );
        } catch (profileError) {
          console.warn("Failed to load profile stats:", profileError);
        }

        setStats({
          aiAssessments: aiAssessmentCountFromProfile,
          classTests: classTestCount,
          activeTasks: activeTaskCount,
          alumniConnections: connectionCountFromProfile,
        });

        // Calculate notification count based on pending tasks and active assessments
        const totalNotifications =
          activeTaskCount + (classTestCount > 0 ? 1 : 0);
        setNotificationCount(totalNotifications);

        console.log("StudentDashboard: Stats loaded successfully");
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        setStats({
          aiAssessments: 0,
          classTests: 0,
          activeTasks: 0,
          alumniConnections: 0,
        });
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      setStats({
        aiAssessments: 0,
        classTests: 0,
        activeTasks: 0,
        alumniConnections: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    // Main Dashboard
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Home,
      color: "text-purple-600",
      section: "main",
    },

    // Academic Section
    {
      id: "ai-assessment",
      name: "AI Assessment",
      icon: Brain,
      color: "text-indigo-600",
      section: "academic",
    },
    {
      id: "class-assessments",
      name: "Class Tests",
      icon: FileText,
      color: "text-cyan-600",
      section: "academic",
    },
    {
      id: "task-management",
      name: "Tasks",
      icon: CheckSquare,
      color: "text-pink-600",
      section: "academic",
    },
    {
      id: "activity",
      name: "Performance",
      icon: BarChart3,
      color: "text-green-600",
      section: "academic",
    },
    {
      id: "attendance",
      name: "Attendance",
      icon: Calendar,
      color: "text-purple-600",
      section: "academic",
    },

    // Career Section
    {
      id: "resume",
      name: "Resume Manager",
      icon: FileText,
      color: "text-orange-600",
      section: "career",
    },
    {
      id: "job-board",
      name: "Job Board",
      icon: Briefcase,
      color: "text-amber-600",
      section: "career",
    },
    {
      id: "alumni-directory",
      name: "Alumni Network",
      icon: GraduationCap,
      color: "text-violet-600",
      section: "career",
    },

    // Personal Section
    {
      id: "profile",
      name: "My Profile",
      icon: User,
      color: "text-blue-600",
      section: "personal",
    },
    {
      id: "events",
      name: "Events",
      icon: Calendar,
      color: "text-teal-600",
      section: "personal",
    },
    {
      id: "user-chat",
      name: "Messages",
      icon: Users,
      color: "text-rose-600",
      section: "personal",
    },
    {
      id: "password",
      name: "Security",
      icon: Settings,
      color: "text-red-600",
      section: "personal",
    },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardContent
            stats={stats}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        );
      case "profile":
        return <StudentProfile />;
      case "activity":
        return (
          <ActivityHeatmap
            showTitle={true}
            userId={user?.id}
            userName={user?.name}
          />
        );
      case "attendance":
        return <StudentAttendanceView />;
      case "resume":
        return <ResumeManager />;
      case "password":
        return <PasswordChange />;
      case "ai-assessment":
        return <AIAssessment />;
      case "class-assessments":
        return <ClassAssessments />;
      case "task-management":
        return <TaskManagement />;
      case "events":
        return <EventsView />;
      case "job-board":
        return (
          <div className="min-h-full bg-gray-50 -m-6 p-6">
            <div className="max-w-7xl mx-auto job-board-wrapper">
              <JobBoardEnhanced />
            </div>
          </div>
        );
      case "alumni-directory":
        return (
          <div className="min-h-full bg-gray-50 -m-6 p-6">
            <div className="max-w-7xl mx-auto alumni-directory-wrapper">
              <AlumniDirectory />
            </div>
          </div>
        );
      case "ai-chat":
        return <AIChat />;
      case "user-chat":
        return <UserChat />;
      default:
        return (
          <DashboardContent
            stats={stats}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-gray-800">
                Career Coaches
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Main Section */}
          <div className="px-4 mb-4">
            {menuItems
              .filter((item) => item.section === "main")
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 mb-1 ${
                      isActive
                        ? "bg-purple-50 text-purple-600 border-r-4 border-purple-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-purple-600" : "text-gray-500"
                      }`}
                    />
                    {sidebarOpen && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Academic Section */}
          <div className="px-4 mb-4">
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Academic
              </h3>
            )}
            {menuItems
              .filter((item) => item.section === "academic")
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 ${
                      isActive
                        ? "bg-purple-50 text-purple-600 border-r-4 border-purple-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-purple-600" : "text-gray-500"
                      }`}
                    />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Career Section */}
          <div className="px-4 mb-4">
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Career
              </h3>
            )}
            {menuItems
              .filter((item) => item.section === "career")
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 ${
                      isActive
                        ? "bg-purple-50 text-purple-600 border-r-4 border-purple-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-purple-600" : "text-gray-500"
                      }`}
                    />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Personal Section */}
          <div className="px-4 mb-4">
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Personal
              </h3>
            )}
            {menuItems
              .filter((item) => item.section === "personal")
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 ${
                      isActive
                        ? "bg-purple-50 text-purple-600 border-r-4 border-purple-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-purple-600" : "text-gray-500"
                      }`}
                    />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </button>
                );
              })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-gray-600"></div>
                  <div className="w-full h-0.5 bg-gray-600"></div>
                  <div className="w-full h-0.5 bg-gray-600"></div>
                </div>
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything"
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative notification-container">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-600 hover:text-purple-600 transition-colors" />
                  {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    </div>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notificationCount === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        <div className="p-2">
                          {stats.activeTasks > 0 && (
                            <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                              <div className="flex items-start space-x-3">
                                <CheckSquare className="h-5 w-5 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    You have {stats.activeTasks} pending task
                                    {stats.activeTasks > 1 ? "s" : ""}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Click to view your tasks
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {stats.classTests > 0 && (
                            <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                              <div className="flex items-start space-x-3">
                                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    New class assessments available
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Check your class tests
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || "Student"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 min-h-full">{renderActiveComponent()}</div>
        </main>
      </div>

      {/* Floating AI Chat Button */}
      <div
        className="fixed bottom-6 right-6 z-[9999]"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
        }}
      >
        <div className="relative group">
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </button>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI Assistant
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  AI Assistant
                </h3>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIChat />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC<{
  stats: DashboardStats;
  loading: boolean;
  setActiveTab: (tab: string) => void;
}> = ({ stats, loading, setActiveTab }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">
          Welcome back, {user?.name || "Student"}! 👋
        </h1>
        <p className="text-purple-100">
          Ready to continue your learning journey? Check out your progress and
          upcoming tasks below.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* AI Assessments Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.aiAssessments
              )}
            </h3>
            <p className="text-sm text-gray-600">AI Assessments Taken</p>
          </div>
        </div>

        {/* Class Tests Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.classTests
              )}
            </h3>
            <p className="text-sm text-gray-600">Class Tests</p>
          </div>
        </div>

        {/* Active Tasks Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.activeTasks
              )}
            </h3>
            <p className="text-sm text-gray-600">Pending Tasks</p>
          </div>
        </div>

        {/* Alumni Connections Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.alumniConnections
              )}
            </h3>
            <p className="text-sm text-gray-600">Alumni Connections</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab("ai-assessment")}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <Brain className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">
                Take AI Assessment
              </span>
            </button>
            <button
              onClick={() => setActiveTab("task-management")}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <CheckSquare className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">
                View Tasks
              </span>
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <FileText className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">
                Update Resume
              </span>
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group"
            >
              <Calendar className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">
                View Events
              </span>
            </button>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Activity Summary
            </h3>
            <button
              onClick={() => setActiveTab("activity")}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Your activity data will appear here
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Start taking assessments and completing tasks to see your
                  progress
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Activities
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("class-assessments")}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                View All Assessments →
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                No Recent Activities
              </h4>
              <p className="text-gray-500 mb-6">
                You haven't completed any activities yet. Start by taking an
                assessment or completing a task.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setActiveTab("ai-assessment")}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Take AI Assessment
                </button>
                <button
                  onClick={() => setActiveTab("task-management")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Tasks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
