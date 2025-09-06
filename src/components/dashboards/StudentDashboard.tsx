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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Student!</h2>
          <p className="text-blue-100">
            Ready to enhance your learning with AI-powered assessments, connect with alumni, and achieve your career goals.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Component */}
        <div className="mt-6">
          {renderActiveComponent()}
        </div>

        {/* Quick Stats */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">AI Assessments</h3>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.aiAssessments}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Class Tests</h3>
              <p className="text-2xl font-bold text-green-600">
                {loading ? '...' : stats.classTests}
              </p>
              <p className="text-sm text-gray-600">This Semester</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Tasks</h3>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? '...' : stats.activeTasks}
              </p>
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1">Connections</h3>
              <p className="text-2xl font-bold text-orange-600">
                {loading ? '...' : stats.alumniConnections}
              </p>
              <p className="text-sm text-gray-600">Connected</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;