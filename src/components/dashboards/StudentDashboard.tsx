import { Activity, Brain, Briefcase, Calendar, CheckSquare, FileText, GraduationCap, Lock, MessageCircle, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { assessmentAPI, studentAPI, taskAPI } from '../../services/api';
import Layout from '../common/Layout';
import ActivityHeatmap from '../features/ActivityHeatmap';
import AIAssessment from '../features/AIAssessment';
import AIChat from '../features/AIChat';
import AlumniDirectory from '../features/AlumniDirectory';
import ClassAssessments from '../features/ClassAssessments';
import EventsView from '../features/EventsView';
import JobBoardEnhanced from '../features/JobBoardEnhanced';
import PasswordChange from '../features/PasswordChange';
import ResumeManager from '../features/ResumeManager';
import StudentAttendanceView from '../features/StudentAttendanceView';
import StudentProfile from '../features/StudentProfile';
import TaskManagement from '../features/TaskManagement';
import UserChat from '../features/UserChat';

interface DashboardStats {
  aiAssessments: number;
  classTests: number;
  activeTasks: number;
  alumniConnections: number;
}

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState<DashboardStats>({
    aiAssessments: 0,
    classTests: 0,
    activeTasks: 0,
    alumniConnections: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('StudentDashboard: Loading dashboard stats for user:', user?.name);
      
      // Load student-specific stats from various APIs with better error handling
      try {
        const [assessments, tasks] = await Promise.allSettled([
          assessmentAPI.getStudentAssessments(),
          taskAPI.getUserTasks()
        ]);

        let aiAssessmentCount = 0;
        let classTestCount = 0;
        let activeTaskCount = 0;

        // Count assessments
        if (assessments.status === 'fulfilled' && assessments.value) {
          const assessmentData = assessments.value;
          // Get AI assessment count from user profile instead of counting assessments
          // This will show the actual count of AI assessments taken by the student
          classTestCount = assessmentData.filter((a: any) => a.type === 'CLASS_ASSESSMENT' || a.type === 'CLASS_TEST').length;
        }

        // Count active tasks
        if (tasks.status === 'fulfilled' && tasks.value) {
          activeTaskCount = tasks.value.filter((t: any) => 
            t.status === 'IN_PROGRESS' || t.status === 'PENDING' || t.status === 'TODO'
          ).length;
        }

        // Get AI assessment count and connection count from user profile
        let aiAssessmentCountFromProfile = 0;
        let connectionCountFromProfile = 0;
        try {
          const profileResponse = await studentAPI.getMyProfile();
          console.log('StudentDashboard: Profile response for stats:', profileResponse);
          aiAssessmentCountFromProfile = profileResponse.aiAssessmentCount || 0;
          connectionCountFromProfile = profileResponse.connectionCount || 0;
          console.log('StudentDashboard: AI assessments:', aiAssessmentCountFromProfile, 'Connections:', connectionCountFromProfile);
        } catch (profileError) {
          console.warn('Failed to load profile stats:', profileError);
        }

        setStats({
          aiAssessments: aiAssessmentCountFromProfile,
          classTests: classTestCount,
          activeTasks: activeTaskCount,
          alumniConnections: connectionCountFromProfile
        });
        
        console.log('StudentDashboard: Stats loaded successfully');
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Keep default values if API calls fail
        setStats({
          aiAssessments: 0,
          classTests: 0,
          activeTasks: 0,
          alumniConnections: 0
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Don't show error toast for stats loading failure
      console.warn('Using default stats due to loading failure');
      // Set default stats on complete failure
      setStats({
        aiAssessments: 0,
        classTests: 0,
        activeTasks: 0,
        alumniConnections: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: User, color: 'from-blue-500 to-blue-600' },
    { id: 'activity', name: 'My Activity', icon: Activity, color: 'from-green-500 to-green-600' },
    { id: 'attendance', name: 'My Attendance', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { id: 'resume', name: 'Resume Manager', icon: FileText, color: 'from-orange-500 to-orange-600' },
    { id: 'password', name: 'Change Password', icon: Lock, color: 'from-red-500 to-red-600' },
    { id: 'ai-assessment', name: 'Practice with AI', icon: Brain, color: 'from-indigo-500 to-indigo-600' },
    { id: 'class-assessments', name: 'Class Assessments', icon: FileText, color: 'from-cyan-500 to-cyan-600' },
    { id: 'task-management', name: 'Task Management', icon: CheckSquare, color: 'from-pink-500 to-pink-600' },
    { id: 'events', name: 'Events', icon: Calendar, color: 'from-teal-500 to-teal-600' },
    { id: 'job-board', name: 'Job Board', icon: Briefcase, color: 'from-amber-500 to-amber-600' },
    { id: 'alumni-directory', name: 'Alumni Network', icon: GraduationCap, color: 'from-violet-500 to-violet-600' },
    { id: 'ai-chat', name: 'AI Chatbot', icon: MessageCircle, color: 'from-emerald-500 to-emerald-600' },
    { id: 'user-chat', name: 'Messages', icon: Users, color: 'from-rose-500 to-rose-600' },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'profile':
        return <StudentProfile />;
      case 'activity':
        return <ActivityHeatmap showTitle={true} userId={user?.id} userName={user?.name} />;
      case 'attendance':
        return <StudentAttendanceView />;
      case 'resume':
        return <ResumeManager />;
      case 'password':
        return <PasswordChange />;
      case 'ai-assessment':
        return <AIAssessment />;
      case 'class-assessments':
        return <ClassAssessments />;
      case 'task-management':
        return <TaskManagement />;
      case 'events':
        return <EventsView />;
      case 'job-board':
        return <JobBoardEnhanced />;
      case 'alumni-directory':
        return <AlumniDirectory />;
      case 'ai-chat':
        return <AIChat />;
      case 'user-chat':
        return <UserChat />;
      default:
        return <StudentProfile />;
    }
  };

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-8">
        {/* Enhanced Welcome Section */}
        <div className="card content-padding animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="heading-secondary mb-3">Welcome back, {user?.name}!</h2>
              <p className="text-body max-w-2xl">
                Ready to enhance your learning journey with AI-powered assessments, connect with industry professionals, 
                and unlock new career opportunities in the technology sector.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <div className="status-success"></div>
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <nav className="flex overflow-x-auto mobile-scroll">
            <div className="flex space-x-1 p-2 min-w-max">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap transform hover:scale-105 min-w-0 ${
                      isActive
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-glow`
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:block truncate">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Enhanced Quick Stats */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-interactive content-padding group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {loading ? (
                      <div className="loading-spinner w-8 h-8"></div>
                    ) : (
                      stats.aiAssessments
                    )}
                  </p>
                  <p className="text-sm text-white/60">Completed</p>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">AI Assessments</h3>
            </div>
            
            <div className="card-interactive content-padding group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white group-hover:text-green-300 transition-colors">
                    {loading ? (
                      <div className="loading-spinner w-8 h-8"></div>
                    ) : (
                      stats.classTests
                    )}
                  </p>
                  <p className="text-sm text-white/60">This Semester</p>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">Class Tests</h3>
            </div>
            
            <div className="card-interactive content-padding group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {loading ? (
                      <div className="loading-spinner w-8 h-8"></div>
                    ) : (
                      stats.activeTasks
                    )}
                  </p>
                  <p className="text-sm text-white/60">Active Goals</p>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">Tasks</h3>
            </div>
            
            <div className="card-interactive content-padding group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white group-hover:text-orange-300 transition-colors">
                    {loading ? (
                      <div className="loading-spinner w-8 h-8"></div>
                    ) : (
                      stats.alumniConnections
                    )}
                  </p>
                  <p className="text-sm text-white/60">Connected</p>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">Connections</h3>
            </div>
          </div>
        )}

        {/* Enhanced Active Component Container */}
        <div className="card content-padding animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="min-h-[400px]">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;