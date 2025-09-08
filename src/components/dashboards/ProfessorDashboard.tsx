import {
  Activity,
  BarChart3,
  Calendar,
  FileText,
  MessageCircle,
  Users,
  Home,
  BookOpen,
  Settings,
  Plus,
  Bell,
  LogOut,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { assessmentAPI } from "../../services/api";
import AssessmentInsights from "../features/AssessmentInsights";
import AttendanceManagement from "../features/AttendanceManagement";
import CreateAssessment from "../features/CreateAssessment";
import EventsView from "../features/EventsView";
import MyAssessments from "../features/MyAssessments";
import PasswordChange from "../features/PasswordChange";
import StudentHeatmap from "../features/StudentHeatmap";
import UserChat from "../features/UserChat";

const ProfessorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [dashboardStats, setDashboardStats] = useState({
    totalAssessments: 0,
    totalStudents: 0,
    recentGrade: "A+",
    completionRate: 0,
    averageScore: 0,
    activeAssessments: 0,
    upcomingAssessments: 0,
  });
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<
    Array<{
      id: number;
      title: string;
      description: string;
      type: string;
    }>
  >([]);
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // Fetch real data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    fetchRecentAssessments();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real assessments data
      const assessments = await assessmentAPI.getProfessorAssessments();
      const now = new Date();

      const activeAssessments = assessments.filter((assessment: any) => {
        const startTime = new Date(assessment.startTime);
        const endTime = new Date(assessment.endTime);
        return now >= startTime && now <= endTime;
      });

      const upcomingAssessments = assessments.filter((assessment: any) => {
        const startTime = new Date(assessment.startTime);
        return now < startTime;
      });

      // Calculate real stats
      const totalStudents = [
        ...new Set(assessments.flatMap((a: any) => a.assignedTo || [])),
      ].length;
      const avgScore =
        assessments.length > 0
          ? assessments.reduce(
              (acc: number, assessment: any) =>
                acc + (assessment.averageScore || 0),
              0
            ) / assessments.length
          : 0;

      setDashboardStats({
        totalAssessments: assessments.length,
        totalStudents: totalStudents,
        recentGrade: "A+",
        completionRate:
          assessments.length > 0
            ? Math.round(
                (assessments.filter((a: any) => a.status === "completed")
                  .length /
                  assessments.length) *
                  100
              )
            : 0,
        averageScore: Math.round(avgScore),
        activeAssessments: activeAssessments.length,
        upcomingAssessments: upcomingAssessments.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // If API fails, show 0s instead of fake data
      setDashboardStats({
        totalAssessments: 0,
        totalStudents: 0,
        recentGrade: "N/A",
        completionRate: 0,
        averageScore: 0,
        activeAssessments: 0,
        upcomingAssessments: 0,
      });
    }
  };

  const fetchRecentAssessments = async () => {
    try {
      const assessments = await assessmentAPI.getProfessorAssessments();
      // Get the 3 most recent assessments
      const recent = assessments
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3);
      setRecentAssessments(recent);
    } catch (error) {
      console.error("Error fetching recent assessments:", error);
      setRecentAssessments([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Fetch real notifications from assessments that need attention
      const assessments = await assessmentAPI.getProfessorAssessments();
      const now = new Date();

      const realNotifications = [];

      // Add notifications for assessments ending soon
      assessments.forEach((assessment: any, index: number) => {
        const endTime = new Date(assessment.endTime);
        const timeDiff = endTime.getTime() - now.getTime();
        const hoursLeft = Math.ceil(timeDiff / (1000 * 3600));

        if (hoursLeft > 0 && hoursLeft <= 24) {
          realNotifications.push({
            id: index + 1,
            title: `Assessment "${assessment.title}" ending soon`,
            description: `${hoursLeft} hours remaining`,
            type: "urgent",
          });
        }
      });

      // Add notification for assessments waiting for review
      const completedAssessments = assessments.filter((a: any) => {
        const endTime = new Date(a.endTime);
        return now > endTime;
      });

      if (completedAssessments.length > 0) {
        realNotifications.push({
          id: realNotifications.length + 1,
          title: `${completedAssessments.length} assessments need review`,
          description: "Review student submissions",
          type: "review",
        });
      }

      setNotifications(realNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out successfully", "success");
    } catch (error) {
      showToast("Error logging out", "error");
    }
  };

  const handleNotificationClick = () => {
    if (notifications.length === 0) {
      showToast("No new notifications at this time", "info");
    } else {
      const message =
        notifications.length === 1
          ? "You have 1 notification requiring attention"
          : `You have ${notifications.length} notifications requiring attention`;
      showToast(message, "info");
    }
  };

  const sidebarItems = [
    { id: "home", name: "Home", icon: Home },
    { id: "assessments", name: "My Assessments", icon: FileText },
    { id: "create-assessment", name: "Create Assessment", icon: Plus },
    { id: "attendance", name: "Attendance", icon: Users },
    { id: "insights", name: "Insights", icon: BarChart3 },
    { id: "student-activity", name: "Student Activity", icon: Activity },
    { id: "events", name: "Events", icon: Calendar },
    { id: "chat", name: "Chat", icon: MessageCircle },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  const renderActiveComponent = () => {
    const componentMap = {
      home: renderHomeContent(),
      assessments: <MyAssessments />,
      "create-assessment": <CreateAssessment />,
      attendance: <AttendanceManagement />,
      insights: <AssessmentInsights />,
      "student-activity": <StudentHeatmap />,
      events: <EventsView />,
      chat: <UserChat />,
      settings: <PasswordChange />,
    };

    const component =
      componentMap[activeTab as keyof typeof componentMap] ||
      renderHomeContent();

    // For home, return as is since it has its own layout
    if (activeTab === "home") {
      return component;
    }

    // Wrap other components with consistent styling
    return (
      <div className="h-full">
        {/* Component Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center">
              {(() => {
                const item = sidebarItems.find((item) => item.id === activeTab);
                const Icon = item?.icon || Home;
                return <Icon className="w-5 h-5 text-white" />;
              })()}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {sidebarItems.find((item) => item.id === activeTab)?.name ||
                "Dashboard"}
            </h2>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"></div>
        </div>

        {/* Component Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">{component}</div>
        </div>
      </div>
    );
  };

  const renderHomeContent = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Welcome Back Card */}
            <div className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-3xl p-6 text-white relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-2">
                  Welcome back, {user?.name?.split(" ")[0] || "Professor"}!
                </h3>
                <p className="text-sm text-teal-50 mb-4">
                  Ready to manage your classes today?
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab("create-assessment")}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Quick Create</span>
                  </button>
                </div>
              </div>
              <div className="absolute right-4 top-4 group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 bg-orange-300 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
            </div>

            {/* Assessment Status Card */}
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl p-6 text-white relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-2">
                  Assessment Overview
                </h3>
                <p className="text-sm text-blue-50 mb-4">
                  Current status at a glance
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Now</span>
                    <span className="text-lg font-bold bg-white/20 px-3 py-1 rounded-lg">
                      {dashboardStats.activeAssessments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Coming Up</span>
                    <span className="text-lg font-bold bg-white/20 px-3 py-1 rounded-lg">
                      {dashboardStats.upcomingAssessments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Students</span>
                    <span className="text-lg font-bold bg-white/20 px-3 py-1 rounded-lg">
                      {dashboardStats.totalStudents}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab("assessments")}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 group hover:border-blue-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    My Assessments
                  </h4>
                  <p className="text-sm text-gray-500">
                    {dashboardStats.totalAssessments === 0
                      ? "No assessments yet"
                      : `${dashboardStats.totalAssessments} total assessments`}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">
                        {dashboardStats.activeAssessments} Active
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-600">
                        {dashboardStats.upcomingAssessments} Upcoming
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("attendance")}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 group hover:border-cyan-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                    Attendance
                  </h4>
                  <p className="text-sm text-gray-500">
                    {dashboardStats.totalStudents === 0
                      ? "No students enrolled"
                      : `${dashboardStats.totalStudents} students enrolled`}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-600">
                      Track & manage attendance
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("create-assessment")}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 group hover:border-green-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    Create Assessment
                  </h4>
                  <p className="text-sm text-gray-500">
                    Quick assessment creation
                  </p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-600">
                      Build new tests & quizzes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Assessments & Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Assessments */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Assessments
                </h3>
                <button
                  onClick={() => setActiveTab("assessments")}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentAssessments.length > 0 ? (
                  recentAssessments.map((assessment, index) => {
                    const status = (() => {
                      const now = new Date();
                      const startTime = new Date(assessment.startTime);
                      const endTime = new Date(assessment.endTime);
                      if (now < startTime)
                        return {
                          text: "Upcoming",
                          color: "text-yellow-600 bg-yellow-100",
                        };
                      if (now > endTime)
                        return {
                          text: "Completed",
                          color: "text-green-600 bg-green-100",
                        };
                      return {
                        text: "Active",
                        color: "text-blue-600 bg-blue-100",
                      };
                    })();

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm">
                            {assessment.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              assessment.startTime
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No assessments yet</p>
                    <button
                      onClick={() => setActiveTab("create-assessment")}
                      className="text-xs text-teal-600 hover:text-teal-700 mt-1"
                    >
                      Create your first assessment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Class Performance
                </h3>
                <button
                  onClick={() => setActiveTab("insights")}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  View Details
                </button>
              </div>
              <div className="space-y-4">
                {dashboardStats.totalAssessments > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Completion Rate
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {dashboardStats.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${dashboardStats.completionRate}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Average Score
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {dashboardStats.averageScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${dashboardStats.averageScore}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">
                          {dashboardStats.activeAssessments}
                        </div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">
                          {dashboardStats.upcomingAssessments}
                        </div>
                        <div className="text-xs text-gray-500">Upcoming</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No performance data yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Create assessments to see performance metrics
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user?.name?.charAt(0) || "P"}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800">
                {user?.name || "Professor"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {user?.email || "Computer Science Dept."}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Grade:</span>
                  <span className="font-medium">
                    {dashboardStats.recentGrade}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Students:</span>
                  <span className="font-medium">
                    {dashboardStats.totalStudents}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assessments:</span>
                  <span className="font-medium">
                    {dashboardStats.totalAssessments}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {dashboardStats.activeAssessments}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Upcoming
                  </span>
                </div>
                <span className="text-sm font-bold text-yellow-600">
                  {dashboardStats.upcomingAssessments}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Enrolled
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {dashboardStats.totalStudents}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Recent Activity</h4>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="space-y-3">
              {recentAssessments.length > 0 ? (
                recentAssessments.slice(0, 3).map((assessment, index) => {
                  const isActive = (() => {
                    const now = new Date();
                    const startTime = new Date(assessment.startTime);
                    const endTime = new Date(assessment.endTime);
                    return now >= startTime && now <= endTime;
                  })();

                  return (
                    <div key={index} className="flex items-start space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          isActive ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">
                          {assessment.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isActive
                            ? "Currently active"
                            : `Created ${new Date(
                                assessment.createdAt
                              ).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <Activity className="w-6 h-6 mx-auto mb-2 text-blue-300" />
                  <p className="text-xs text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setActiveTab("create-assessment")}
            className="w-full bg-teal-500 text-white rounded-2xl p-4 font-medium hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-teal-400 to-teal-600 text-white flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-teal-500" />
            </div>
            <span className="font-bold text-xl">EduBoard</span>
          </div>
          <p className="text-teal-100 text-sm mt-2">Professor Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-white/20 text-white shadow-lg scale-105"
                        : "text-teal-100 hover:bg-white/10 hover:text-white hover:scale-105"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform ${
                        isActive ? "scale-110" : "group-hover:scale-110"
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-semibold">
                {user?.name?.charAt(0) || "P"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "Professor"}
              </p>
              <p className="text-xs text-teal-100 truncate">
                {user?.email || "professor@university.edu"}
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-teal-100 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 group hover:scale-105"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hello, {user?.name?.split(" ")[0] || "Professor"}!
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0) || "P"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
