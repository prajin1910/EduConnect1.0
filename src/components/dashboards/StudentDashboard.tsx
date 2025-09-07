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
    { id: 'profile', name: 'My Profile', icon: User },
    { id: 'activity', name: 'My Activity', icon: Activity },
    { id: 'attendance', name: 'My Attendance', icon: Calendar },
    { id: 'resume', name: 'Resume Manager', icon: FileText },
    { id: 'password', name: 'Change Password', icon: Lock },
    { id: 'ai-assessment', name: 'Practice with AI', icon: Brain },
    { id: 'class-assessments', name: 'Class Assessments', icon: FileText },
    { id: 'task-management', name: 'Task Management', icon: CheckSquare },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'job-board', name: 'Job Board', icon: Briefcase },
    { id: 'alumni-directory', name: 'Alumni Network', icon: GraduationCap },
    { id: 'ai-chat', name: 'AI Chatbot', icon: MessageCircle },
    { id: 'user-chat', name: 'Messages', icon: Users },
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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-blue-200">
                Ready to enhance your learning with AI-powered assessments, connect with alumni, and achieve your career goals.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
          <nav className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-4 font-medium text-sm flex items-center space-x-2 transition-all duration-300 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  } ${index === 0 ? 'rounded-tl-2xl' : ''} ${index === tabs.length - 1 ? 'rounded-tr-2xl' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:block">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Stats */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl p-6 text-center hover:bg-white/15 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-white">AI Assessments</h3>
              <p className="text-2xl font-bold text-blue-400">
                {loading ? '...' : stats.aiAssessments}
              </p>
              <p className="text-sm text-blue-200">Completed</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl p-6 text-center hover:bg-white/15 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-white">Class Tests</h3>
              <p className="text-2xl font-bold text-green-400">
                {loading ? '...' : stats.classTests}
              </p>
              <p className="text-sm text-blue-200">This Semester</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl p-6 text-center hover:bg-white/15 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-white">Tasks</h3>
              <p className="text-2xl font-bold text-purple-400">
                {loading ? '...' : stats.activeTasks}
              </p>
              <p className="text-sm text-blue-200">Active Goals</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl p-6 text-center hover:bg-white/15 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-white">Connections</h3>
              <p className="text-2xl font-bold text-orange-400">
                {loading ? '...' : stats.alumniConnections}
              </p>
              <p className="text-sm text-blue-200">Connected</p>
            </div>
          </div>
        )}

        {/* Active Component */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-6">
          {renderActiveComponent()}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;