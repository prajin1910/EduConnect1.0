import { Activity, BarChart3, Calendar, FileText, Lock, MessageCircle, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../common/Layout';
import AssessmentInsights from '../features/AssessmentInsights';
import AttendanceManagement from '../features/AttendanceManagement';
import CreateAssessment from '../features/CreateAssessment';
import EventsView from '../features/EventsView';
import MyAssessments from '../features/MyAssessments';
import PasswordChange from '../features/PasswordChange';
import StudentHeatmap from '../features/StudentHeatmap';
import UserChat from '../features/UserChat';

const ProfessorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assessments');
  const { user } = useAuth();

  const tabs = [
    { id: 'assessments', name: 'My Assessments', icon: FileText },
    { id: 'create-assessment', name: 'Create Assessment', icon: FileText },
    { id: 'attendance', name: 'Attendance Management', icon: Users },
    { id: 'assessment-insights', name: 'Assessment Insights', icon: BarChart3 },
    { id: 'student-activity', name: 'Student Activity', icon: Activity },
    { id: 'password', name: 'Change Password', icon: Lock },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'chat', name: 'Chat with Students', icon: MessageCircle },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'assessments':
        return <MyAssessments />;
      case 'create-assessment':
        return <CreateAssessment />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'assessment-insights':
        return <AssessmentInsights />;
      case 'student-activity':
        return <StudentHeatmap />;
      case 'password':
        return <PasswordChange />;
      case 'events':
        return <EventsView />;
      case 'chat':
        return <UserChat />;
      default:
        return <MyAssessments />;
    }
  };

  return (
    <Layout title="Professor Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-blue-200">
                Create assessments, monitor student performance, and engage with your students.
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
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
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

        {/* Active Component */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-6">
          {renderActiveComponent()}
        </div>
      </div>
    </Layout>
  );
};

export default ProfessorDashboard;