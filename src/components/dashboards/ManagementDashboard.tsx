import {
    Activity,
    BarChart3,
    Bell,
    Brain,
    Briefcase,
    Calendar,
    ChevronDown,
    Eye,
    GraduationCap,
    Home,
    Lock,
    LogOut,
    Mail,
    Menu,
    MessageCircle,
    Send,
    Settings,
    User,
    UserCheck,
    Users,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { managementAPI } from "../../services/api";
import AIStudentAnalysis from "../features/AIStudentAnalysis";
import AlumniDirectory from "../features/AlumniDirectory";
import AlumniEventInvitation from "../features/AlumniEventInvitation";
import AlumniVerification from "../features/AlumniVerification";
import CircularView from "../features/CircularView";
import DashboardStats from "../features/DashboardStats";
import EventManagement from "../features/EventManagement";
import IssueCircular from "../features/IssueCircular";
import JobBoard from "../features/JobBoard";
import ManagementEventRequestTracker from "../features/ManagementEventRequestTracker";
import ManagementEventsView from "../features/ManagementEventsView";
import PasswordChange from "../features/PasswordChange";
import SentCirculars from "../features/SentCirculars";
import StudentHeatmap from "../features/StudentHeatmap";
import UserChat from "../features/UserChat";

interface ManagementStats {
  totalStudents: number;
  totalProfessors: number;
  totalAlumni: number;
  pendingAlumni: number;
  totalAssessments: number;
  systemHealth: string;
}

const ManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [eventTab, setEventTab] = useState("view-events");
  const [stats, setStats] = useState<ManagementStats>({
    totalStudents: 0,
    totalProfessors: 0,
    totalAlumni: 0,
    pendingAlumni: 0,
    totalAssessments: 0,
    systemHealth: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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
        "ManagementDashboard: Loading dashboard stats for user:",
        user?.name
      );

      const response = await managementAPI.getDashboardStats();
      console.log("ManagementDashboard: Stats response:", response);

      // Calculate system health based on data availability
      const totalUsers =
        (response.totalStudents || 0) +
        (response.totalProfessors || 0) +
        (response.totalAlumni || 0);
      let systemHealth = "99.9%";

      if (totalUsers === 0) {
        systemHealth = "85.0%";
      } else if (response.pendingAlumni > 10) {
        systemHealth = "95.5%";
      } else if (response.totalAssessments === 0) {
        systemHealth = "92.0%";
      }

      setStats({
        totalStudents: response.totalStudents || 0,
        totalProfessors: response.totalProfessors || 0,
        totalAlumni: response.totalAlumni || 0,
        pendingAlumni: response.pendingAlumni || 0,
        totalAssessments: response.totalAssessments || 0,
        systemHealth,
      });

      // Calculate notification count based on pending verifications
      setNotificationCount(response.pendingAlumni || 0);

      console.log("ManagementDashboard: Stats loaded successfully");
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      setStats({
        totalStudents: 0,
        totalProfessors: 0,
        totalAlumni: 0,
        pendingAlumni: 0,
        totalAssessments: 0,
        systemHealth: "0%",
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

    // Management Section
    {
      id: "dashboard-stats",
      name: "System Overview",
      icon: BarChart3,
      color: "text-indigo-600",
      section: "management",
    },
    {
      id: "student-heatmap",
      name: "Student Activity",
      icon: Activity,
      color: "text-cyan-600",
      section: "management",
    },
    {
      id: "ai-analysis",
      name: "AI Analysis",
      icon: Brain,
      color: "text-pink-600",
      section: "management",
    },
    {
      id: "alumni-verification",
      name: "Alumni Verification",
      icon: UserCheck,
      color: "text-green-600",
      section: "management",
    },

    // Events Section
    {
      id: "event-management",
      name: "Event Management",
      icon: Calendar,
      color: "text-purple-600",
      section: "events",
    },

    // Network Section
    {
      id: "alumni-network",
      name: "Alumni Network",
      icon: GraduationCap,
      color: "text-violet-600",
      section: "network",
    },
    {
      id: "job-portal",
      name: "Job Portal",
      icon: Briefcase,
      color: "text-amber-600",
      section: "network",
    },
    {
      id: "chat",
      name: "Communication",
      icon: MessageCircle,
      color: "text-rose-600",
      section: "network",
    },
    {
      id: "issue-circular",
      name: "Issue Circular",
      icon: Send,
      color: "text-purple-600",
      section: "circular",
    },
    {
      id: "view-circulars",
      name: "View Circulars",
      icon: Mail,
      color: "text-blue-600",
      section: "circular",
    },
    {
      id: "sent-circulars",
      name: "Sent Circulars",
      icon: Send,
      color: "text-green-600",
      section: "circular",
    },
  ];

  const eventTabs = [
    { id: "view-events", name: "View All Events", icon: Eye },
    { id: "alumni-requests", name: "Alumni Requests", icon: Calendar },
    { id: "invite-alumni", name: "Invite Alumni", icon: Send },
    { id: "request-status", name: "Request Status", icon: Eye },
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
      case "dashboard-stats":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      System Overview
                    </h1>
                    <p className="text-gray-600">
                      Comprehensive dashboard statistics and analytics
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="dashboard-stats-wrapper p-6">
                  <DashboardStats />
                </div>
              </div>
            </div>
          </div>
        );
      case "student-heatmap":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Student Activity Heatmap
                    </h1>
                    <p className="text-gray-600">
                      Monitor student engagement and activity patterns
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="student-heatmap-wrapper p-6">
                  <StudentHeatmap />
                </div>
              </div>
            </div>
          </div>
        );
      case "ai-analysis":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      AI Student Analysis
                    </h1>
                    <p className="text-gray-600">
                      Advanced insights and performance analytics
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="ai-analysis-wrapper p-6">
                  <AIStudentAnalysis />
                </div>
              </div>
            </div>
          </div>
        );
      case "alumni-verification":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Alumni Verification
                    </h1>
                    <p className="text-gray-600">
                      Review and approve alumni registration requests
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="alumni-verification-wrapper p-6">
                  <AlumniVerification />
                </div>
              </div>
            </div>
          </div>
        );
      case "event-management":
        return renderEventManagement();
      case "password":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Security Settings
                    </h1>
                    <p className="text-gray-600">
                      Update your password and security preferences
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="password-change-wrapper p-6">
                  <PasswordChange />
                </div>
              </div>
            </div>
          </div>
        );
      case "alumni-network":
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
                      Alumni Network Management
                    </h1>
                    <p className="text-gray-600">
                      Manage alumni directory and networking opportunities
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
      case "job-portal":
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
                      Job Portal Management
                    </h1>
                    <p className="text-gray-600">
                      Oversee job postings and career opportunities
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="job-board-wrapper">
                  <JobBoard />
                </div>
              </div>
            </div>
          </div>
        );
      case "chat":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Communication Center
                    </h1>
                    <p className="text-gray-600">
                      Manage communications and announcements
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="user-chat-wrapper p-6">
                  <UserChat />
                </div>
              </div>
            </div>
          </div>
        );
      case "issue-circular":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Issue Circular
                    </h1>
                    <p className="text-gray-600">
                      Send announcements and important information
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="issue-circular-wrapper">
                  <IssueCircular />
                </div>
              </div>
            </div>
          </div>
        );
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
                      View Circulars
                    </h1>
                    <p className="text-gray-600">
                      Read received circulars and announcements
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
      case "sent-circulars":
        return (
          <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Professional Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Sent Circulars
                    </h1>
                    <p className="text-gray-600">
                      View and manage your sent circulars
                    </p>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
              </div>

              {/* Component Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="sent-circulars-wrapper">
                  <SentCirculars />
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

  const renderEventManagement = () => {
    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Professional Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Event Management
                </h1>
                <p className="text-gray-600">
                  Organize and manage all campus events and activities
                </p>
              </div>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </div>

          <div className="space-y-6">
            {/* Event Management Sub-Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <nav className="flex space-x-0 overflow-x-auto">
                {eventTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setEventTab(tab.id)}
                      className={`whitespace-nowrap py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-all duration-300 flex-shrink-0 ${
                        eventTab === tab.id
                          ? "bg-purple-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      } ${index === 0 ? "rounded-tl-xl" : ""} ${
                        index === eventTabs.length - 1 ? "rounded-tr-xl" : ""
                      }`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:block sm:block">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Event Management Content */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-3 sm:p-4 lg:p-6">
                {eventTab === "view-events" && <ManagementEventsView />}
                {eventTab === "alumni-requests" && <EventManagement />}
                {eventTab === "invite-alumni" && <AlumniEventInvitation />}
                {eventTab === "request-status" && (
                  <ManagementEventRequestTracker />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
              <Settings className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">
              Management Hub
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

          {/* Events Section */}
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Events Management
            </h3>
            {menuItems
              .filter((item) => item.section === "events")
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

          {/* Network Section */}
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Network & Communication
            </h3>
            {menuItems
              .filter((item) => item.section === "network")
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

          {/* Circular Section */}
          <div className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Circular Management
            </h3>
            {menuItems
              .filter((item) => item.section === "circular")
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
            <Lock className="h-5 w-5" />
            <span className="font-medium">Security</span>
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
              <Settings className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-gray-800">
                Management Hub
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

          {/* Management Section */}
          <div className="px-4 mb-4">
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Management
              </h3>
            )}
            {menuItems
              .filter((item) => item.section === "management")
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

          {/* Events Section */}
          <div className="px-4 mb-4">
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Events
              </h3>
            )}
            {menuItems
              .filter((item) => item.section === "events")
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

          {/* Network Section */}
          <div className="px-4 mb-4">
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Network
              </h3>
            )}
            {menuItems
              .filter((item) => item.section === "network")
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

          {/* Circular Section */}
          <div className="px-4 mb-4">
            {sidebarOpen && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Circular Management
              </h3>
            )}
            {menuItems
              .filter((item) => item.section === "circular")
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

        {/* Settings & Logout */}
        <div className="p-4 border-t border-gray-200 mt-auto space-y-2">
          <button
            onClick={() => setActiveTab("password")}
            className="w-full flex items-center space-x-3 px-3 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-all duration-200"
          >
            <Lock className="h-5 w-5" />
            {sidebarOpen && <span className="font-medium">Security</span>}
          </button>
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
                  Management Hub
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
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        <div className="p-2">
                          <div
                            className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                            onClick={() => {
                              setActiveTab("alumni-verification");
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {notificationCount} alumni verification
                                  {notificationCount > 1 ? "s" : ""} pending
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  Click to review and approve
                                </p>
                              </div>
                            </div>
                          </div>
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
                    <span className="hidden md:inline">{user?.name || "Administrator"}</span>
                    <span className="md:hidden">Admin</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setActiveTab("password");
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4 text-red-600" />
                        <span>Security Settings</span>
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
              activeTab === "dashboard" ||
              activeTab === "event-management" ||
              activeTab === "dashboard-stats" ||
              activeTab === "student-heatmap" ||
              activeTab === "ai-analysis" ||
              activeTab === "alumni-verification" ||
              activeTab === "alumni-network" ||
              activeTab === "job-portal" ||
              activeTab === "chat" ||
              activeTab === "password"
                ? ""
                : "p-3 sm:p-4 lg:p-6"
            }`}
          >
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC<{
  stats: ManagementStats;
  loading: boolean;
  setActiveTab: (tab: string) => void;
}> = ({ stats, loading, setActiveTab }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-8 p-3 sm:p-4 lg:p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">
          Welcome back, {user?.name || "Administrator"}! 👋
        </h1>
        <p className="text-purple-100 text-sm sm:text-base">
          Monitor student performance, verify alumni, and oversee the entire
          system efficiently.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.totalStudents
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
          </div>
        </div>

        {/* Total Professors Card */}
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
                stats.totalProfessors
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Total Professors</p>
          </div>
        </div>

        {/* Total Alumni Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.totalAlumni
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Verified Alumni</p>
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {loading ? (
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                stats.systemHealth
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">System Health</p>
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
              onClick={() => setActiveTab("alumni-verification")}
              className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                Alumni Verification
              </span>
              {stats.pendingAlumni > 0 && (
                <span className="mt-1 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                  {stats.pendingAlumni} pending
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("student-heatmap")}
              className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                Student Activity
              </span>
            </button>
            <button
              onClick={() => setActiveTab("ai-analysis")}
              className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group"
            >
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                AI Analysis
              </span>
            </button>
            <button
              onClick={() => setActiveTab("event-management")}
              className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                Event Management
              </span>
            </button>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              System Overview
            </h3>
            <button
              onClick={() => setActiveTab("dashboard-stats")}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              View Details →
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Total Users
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.totalStudents +
                      stats.totalProfessors +
                      stats.totalAlumni}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Total Assessments
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.totalAssessments}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Pending Verifications
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    {stats.pendingAlumni}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Management Hub Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Management Hub
              </h3>
              <p className="text-purple-100 text-sm">
                Comprehensive tools for system administration
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Alumni Network Card */}
            <div
              className="group cursor-pointer"
              onClick={() => setActiveTab("alumni-network")}
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
                    <p className="text-sm text-violet-700">
                      Manage connections
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Oversee alumni directory, manage connections, and facilitate
                  networking opportunities.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-violet-600 font-medium">
                    Manage Network →
                  </span>
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-600">
                      🎓
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Portal Card */}
            <div
              className="group cursor-pointer"
              onClick={() => setActiveTab("job-portal")}
            >
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Job Portal</h4>
                    <p className="text-sm text-amber-700">
                      Manage opportunities
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Oversee job postings, internship opportunities, and career
                  placement programs.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-600 font-medium">
                    Manage Portal →
                  </span>
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-600">💼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Card */}
            <div
              className="group cursor-pointer"
              onClick={() => setActiveTab("chat")}
            >
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200 hover:border-rose-300 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Communication
                    </h4>
                    <p className="text-sm text-rose-700">Manage messages</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor communications, manage announcements, and facilitate
                  interactions.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-rose-600 font-medium">
                    Open Chat →
                  </span>
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-rose-600">💬</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;
