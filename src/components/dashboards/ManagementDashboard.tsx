import { Activity, BarChart3, Brain, Briefcase, Calendar, Eye, Lock, MessageCircle, Send, Settings, UserCheck, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();

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
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl overflow-hidden">
          <nav className="flex space-x-0 overflow-x-auto">
            {eventTabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setEventTab(tab.id)}
                  className={`whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center space-x-2 transition-all duration-300 flex-shrink-0 ${
                    eventTab === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  } ${index === 0 ? 'rounded-tl-xl' : ''} ${index === eventTabs.length - 1 ? 'rounded-tr-xl' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:block">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Event Management Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl p-6">
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
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-blue-200">
                Monitor student performance, verify alumni, and oversee the entire assessment system.
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
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
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

export default ManagementDashboard;