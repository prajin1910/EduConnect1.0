import {
    BarChart3,
    Bell,
    Brain,
    Briefcase,
    Calendar,
    CheckSquare,
    ChevronDown,
    FileText,
    GraduationCap,
    Home,
    LogOut,
    Mail,
    Menu,
    MessageCircle,
    Settings,
    User,
    Users,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { assessmentAPI, studentAPI, taskAPI } from "../../services/api";
import ActivityHeatmap from "../features/ActivityHeatmap";
import AIAssessment from "../features/AIAssessment";
import AIChat from "../features/AIChat";
import AlumniDirectory from "../features/AlumniDirectory";
import CircularView from "../features/CircularView";
import ClassAssessments from "../features/ClassAssessments";
import EventsDashboard from "../features/EventsDashboard";
import EventsView from "../features/EventsView";
import JobBoardFixed from "../features/JobBoardFixed";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      if (showUserMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest(".user-menu-container")) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, showUserMenu]);

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
      id: "view-circulars",
      name: "Circulars",
      icon: Mail,
      color: "text-blue-600",
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
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Resume Manager
                    </h1>
                    <p className="text-gray-600">
                      Build and manage your professional resume
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="resume-manager-wrapper p-6">
                  <ResumeManager />
                </div>
              </div>
            </div>
          </div>
        );
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
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Job Board
                    </h1>
                    <p className="text-gray-600">
                      Discover career opportunities and internships
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="job-board-wrapper">
                  <JobBoardFixed />
                </div>
              </div>
            </div>
          </div>
        );
      case "alumni-directory":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Alumni Network
                    </h1>
                    <p className="text-gray-600">
                      Connect with alumni and expand your professional network
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="alumni-directory-wrapper">
                  <AlumniDirectory />
                </div>
              </div>
            </div>
          </div>
        );
      case "ai-chat":
        return <AIChat />;
      case "user-chat":
        return <UserChat />;
      case "view-circulars":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      My Circulars
                    </h1>
                    <p className="text-gray-600">
                      View circulars from professors and management
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="circular-view-wrapper">
                  <CircularView />
                </div>
              </div>
            </div>
          </div>
        );
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
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">
              Career Coaches
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile Navigation */}
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
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
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
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
          </div>

          {/* Academic Section */}
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Academic
            </h3>
            {menuItems
              .filter((item) => item.section === "academic")
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
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
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                );
              })}
          </div>

          {/* Career Section */}
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Career & Alumni
            </h3>
            {menuItems
              .filter((item) => item.section === "career")
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
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
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                );
              })}
          </div>
        </nav>

        {/* Mobile Settings & Logout */}
        <div className="p-4 border-t border-gray-200 mt-auto space-y-2">
          <button
            onClick={() => {
              setActiveTab("password");
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center space-x-3 px-3 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col hidden lg:flex`}
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

          {/* Connections Section */}
          <div className="px-4 mb-4">
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Connections
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
            onClick={() => { logout(); navigate('/'); }}
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
        <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center lg:hidden"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              
              {/* Desktop Sidebar Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors items-center justify-center hidden lg:flex"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <div className="w-full h-0.5 bg-gray-700 rounded"></div>
                  <div className="w-full h-0.5 bg-gray-700 rounded"></div>
                  <div className="w-full h-0.5 bg-gray-700 rounded"></div>
                </div>
              </button>

              {/* Mobile Title */}
              <div className="lg:hidden">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  Career Coaches
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative notification-container">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-purple-600 transition-colors" />
                  {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    </div>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
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

              <div className="flex items-center space-x-2 sm:space-x-3 relative user-menu-container">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <span className="hidden md:inline">{user?.name || "Student"}</span>
                    <span className="md:hidden">Student</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setActiveTab("profile");
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 text-blue-600" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("password");
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4 text-red-600" />
                        <span>Security</span>
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div
            className={`min-h-full ${
              activeTab === "job-board" ||
              activeTab === "alumni-directory" ||
              activeTab === "resume"
                ? ""
                : "p-3 sm:p-4 lg:p-6"
            }`}
          >
            {renderActiveComponent()}
          </div>
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
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-8 p-3 sm:p-4 lg:p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">
          Welcome back, {user?.name || "Student"}! 👋
        </h1>
        <p className="text-purple-100 text-sm sm:text-base">
          Ready to continue your learning journey? Check out your progress and
          upcoming tasks below.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* AI Assessments Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.aiAssessments
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">AI Assessments Taken</p>
          </div>
        </div>

        {/* Class Tests Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.classTests
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Class Tests</p>
          </div>
        </div>

        {/* Active Tasks Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.activeTasks
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Pending Tasks</p>
          </div>
        </div>

        {/* Alumni Connections Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.alumniConnections
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Alumni Connections</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab("ai-assessment")}
              className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                Take AI Assessment
              </span>
            </button>
            <button
              onClick={() => setActiveTab("task-management")}
              className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                View Tasks
              </span>
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
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

      {/* Career Hub Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Career Hub</h3>
              <p className="text-purple-100 text-sm">
                Advance your career with our professional tools
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Job Board Card */}
            <div
              className="group cursor-pointer"
              onClick={() => setActiveTab("job-board")}
            >
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Job Board</h4>
                    <p className="text-sm text-amber-700">Find opportunities</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Discover internships, full-time positions, and freelance
                  opportunities tailored to your skills and interests.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-600 font-medium">
                    Explore Jobs →
                  </span>
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-600">🎯</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alumni Network Card */}
            <div
              className="group cursor-pointer"
              onClick={() => setActiveTab("alumni-directory")}
            >
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200 hover:border-violet-300 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Alumni Network
                    </h4>
                    <p className="text-sm text-violet-700">Connect & grow</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Network with successful alumni, get mentorship, and gain
                  valuable industry insights for your career growth.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-violet-600 font-medium">
                    Connect Now →
                  </span>
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-600">
                      🤝
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Manager Card */}
            <div
              className="group cursor-pointer"
              onClick={() => setActiveTab("resume")}
            >
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Resume Manager
                    </h4>
                    <p className="text-sm text-orange-700">
                      Build your profile
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Create and maintain a professional resume with AI-powered
                  suggestions and industry-standard templates.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-600 font-medium">
                    Update Resume →
                  </span>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">
                      📄
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Upcoming Events
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("events")}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                View All Events →
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <EventsDashboard />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
