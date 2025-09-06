import { Activity, BarChart3, Calendar, FileText, Lock, MessageCircle, Users } from 'lucide-react';
import React, { useState } from 'react';
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
        <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Professor!</h2>
          <p className="text-green-100">
            Create assessments, monitor student performance, and engage with your students.
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
                      ? 'border-green-500 text-green-600'
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
      </div>
    </Layout>
  );
};

export default ProfessorDashboard;