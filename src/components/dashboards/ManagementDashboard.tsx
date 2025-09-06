import { Activity, BarChart3, Brain, Briefcase, Calendar, Eye, Lock, MessageCircle, Send, UserCheck, Users } from 'lucide-react';
import React, { useState } from 'react';
import Layout from '../common/Layout';
import AIStudentAnalysis from '../features/AIStudentAnalysis';
import AlumniDirectory from '../features/AlumniDirectory';
import AlumniEventInvitation from '../features/AlumniEventInvitation';
import AlumniVerification from '../features/AlumniVerification';
import DashboardStats from '../features/DashboardStats';
import EventManagement from '../features/EventManagement';
import JobBoard from '../features/JobBoard';
import ManagementEventRequestTracker from '../features/ManagementEventRequestTracker';
import ManagementEventsView from '../features/ManagementEventsView';
import PasswordChange from '../features/PasswordChange';
import StudentHeatmap from '../features/StudentHeatmap';
import UserChat from '../features/UserChat';

const ManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard-stats');
  const [eventTab, setEventTab] = useState('view-events'); // For event management sub-tabs

  const tabs = [
    { id: 'dashboard-stats', name: 'Dashboard Overview', icon: BarChart3 },
    { id: 'student-heatmap', name: 'Student Activity', icon: Activity },
    { id: 'ai-analysis', name: 'AI Student Analysis', icon: Brain },
    { id: 'alumni-verification', name: 'Alumni Verification', icon: UserCheck },
    { id: 'event-management', name: 'Event Management', icon: Calendar },
    { id: 'password', name: 'Change Password', icon: Lock },
    { id: 'alumni-network', name: 'Alumni Network', icon: Users },
    { id: 'job-portal', name: 'Job Portal', icon: Briefcase },
    { id: 'chat', name: 'Communication', icon: MessageCircle },
  ];

  const eventTabs = [
    { id: 'view-events', name: 'View All Events', icon: Eye },
    { id: 'alumni-requests', name: 'Alumni Requests', icon: Calendar },
    { id: 'invite-alumni', name: 'Invite Alumni', icon: Send },
    { id: 'request-status', name: 'Request Status', icon: Eye },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard-stats':
        return <DashboardStats />;
      case 'student-heatmap':
        return <StudentHeatmap />;
      case 'ai-analysis':
        return <AIStudentAnalysis />;
      case 'alumni-verification':
        return <AlumniVerification />;
      case 'event-management':
        return renderEventManagement();
      case 'password':
        return <PasswordChange />;
      case 'alumni-network':
        return <AlumniDirectory />;
      case 'job-portal':
        return <JobBoard />;
      case 'chat':
        return <UserChat />;
      default:
        return <DashboardStats />;
    }
  };

  const renderEventManagement = () => {
    return (
      <div className="space-y-6">
        {/* Event Management Sub-Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {eventTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setEventTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    eventTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Event Management Content */}
        <div>
          {eventTab === 'view-events' && <ManagementEventsView />}
          {eventTab === 'alumni-requests' && <EventManagement />}
          {eventTab === 'invite-alumni' && <AlumniEventInvitation />}
          {eventTab === 'request-status' && <ManagementEventRequestTracker />}
        </div>
      </div>
    );
  };

  return (
    <Layout title="Management Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Management Portal</h2>
          <p className="text-purple-100">
            Monitor student performance, verify alumni, and oversee the entire assessment system.
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
                      ? 'border-purple-500 text-purple-600'
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

export default ManagementDashboard;