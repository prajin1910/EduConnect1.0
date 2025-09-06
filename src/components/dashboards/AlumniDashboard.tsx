import {
  Award,
  Briefcase,
  Calendar,
  Globe,
  GraduationCap,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  TrendingUp,
  User,
  UserCheck,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { alumniAPI } from '../../services/api';
import Layout from '../common/Layout';
import AlumniDirectoryNew from '../features/AlumniDirectoryNew';
import AlumniEventRequest from '../features/AlumniEventRequest';
import AlumniManagementRequests from '../features/AlumniManagementRequests';
import AlumniProfileNew from '../features/AlumniProfileNew';
import ConnectionRequests from '../features/ConnectionRequests';
import EventsView from '../features/EventsView';
import JobBoardEnhanced from '../features/JobBoardEnhanced';
import PasswordChange from '../features/PasswordChange';
import UserChat from '../features/UserChat';

interface AlumniStats {
  networkConnections: number;
  eventsCount: number;
  jobsPosted: number;
}

const AlumniDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState<AlumniStats>({
    networkConnections: 0,
    eventsCount: 0,
    jobsPosted: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadStats();
    
    // Listen for connection updates to refresh stats
    const handleConnectionUpdate = () => {
      loadStats(true);
    };
    
    // Listen for job updates to refresh stats
    const handleJobUpdate = () => {
      loadStats(true);
    };
    
    window.addEventListener('connectionUpdated', handleConnectionUpdate);
    window.addEventListener('jobUpdated', handleJobUpdate);
    
    return () => {
      window.removeEventListener('connectionUpdated', handleConnectionUpdate);
      window.removeEventListener('jobUpdated', handleJobUpdate);
    };
  }, []);

  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setStatsLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await alumniAPI.getAlumniStats();
      setStats(response);
      
      if (isRefresh) {
        showToast('Statistics refreshed successfully', 'success');
      }
    } catch (error: any) {
      console.error('Failed to load alumni stats:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load statistics';
      setError(errorMessage);
      
      if (isRefresh) {
        showToast('Failed to refresh statistics', 'error');
      }
      // Don't show error toast on initial load, just set default values
    } finally {
      if (isRefresh) {
        setStatsLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: User },
    { id: 'directory', name: 'Alumni Directory', icon: Users },
    { id: 'connections', name: 'Connection Requests', icon: UserCheck },
    { id: 'password', name: 'Change Password', icon: Lock },
    { id: 'jobs', name: 'Job Board', icon: Briefcase },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'request-event', name: 'Request Event', icon: Plus },
    { id: 'alumni-managment-requests', name: 'Alumni Management Requests', icon: GraduationCap },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
  ];

  const renderActiveComponent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Alumni Profile</h2>
                <button
                  onClick={() => loadStats(true)}
                  disabled={statsLoading}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                  {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
                </button>
              </div>
              <p className="text-blue-700">Manage your professional information and showcase your achievements to the alumni network.</p>
            </div>
            
            <AlumniProfileNew />
            
            {/* Enhanced Stats Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                  Your Impact Dashboard
                </h2>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Network Connections */}
                <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Network</p>
                      {statsLoading ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-8 h-8 bg-blue-200 rounded animate-pulse"></div>
                          <div className="w-16 h-4 bg-blue-200 rounded animate-pulse"></div>
                        </div>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-blue-900">{stats.networkConnections.toLocaleString()}</p>
                          <p className="text-sm text-blue-600">Connections</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Events Organized */}
                <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Events</p>
                      {statsLoading ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-8 h-8 bg-green-200 rounded animate-pulse"></div>
                          <div className="w-16 h-4 bg-green-200 rounded animate-pulse"></div>
                        </div>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-green-900">{stats.eventsCount.toLocaleString()}</p>
                          <p className="text-sm text-green-600">Organized</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Jobs Posted */}
                <div className="relative bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Briefcase className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Opportunities</p>
                      {statsLoading ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-8 h-8 bg-purple-200 rounded animate-pulse"></div>
                          <div className="w-16 h-4 bg-purple-200 rounded animate-pulse"></div>
                        </div>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-purple-900">{stats.jobsPosted.toLocaleString()}</p>
                          <p className="text-sm text-purple-600">Jobs Posted</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievement Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-100 rounded-xl border border-amber-200">
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-900">Professional Milestone</h3>
                </div>
                <p className="text-amber-800 mt-2">
                  You're actively contributing to the alumni community! 
                  {stats.networkConnections > 10 && " 🌟 Network Builder"}
                  {stats.eventsCount > 3 && " 🎯 Event Organizer"}
                  {stats.jobsPosted > 5 && " 💼 Career Facilitator"}
                </p>
              </div>
            </div>
          </div>
        );
      case 'directory':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Alumni Directory</h2>
              <p className="text-green-700">Connect with fellow alumni, explore their career journeys, and expand your professional network.</p>
            </div>
            <AlumniDirectoryNew />
          </div>
        );
      case 'connections':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Requests</h2>
              <p className="text-blue-700">Manage incoming connection requests and build meaningful professional relationships.</p>
            </div>
            <ConnectionRequests />
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-6 border border-red-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
              <p className="text-red-700">Keep your account secure by regularly updating your password.</p>
            </div>
            <PasswordChange />
          </div>
        );
      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Board</h2>
              <p className="text-purple-700">Discover career opportunities and help fellow alumni by posting job openings.</p>
            </div>
            <JobBoardEnhanced />
          </div>
        );
      case 'events':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-6 border border-amber-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Alumni Events</h2>
              <p className="text-amber-700">Stay updated with upcoming events and connect with alumni in your area.</p>
            </div>
            <EventsView />
          </div>
        );
      case 'request-event':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl p-6 border border-teal-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Organize an Event</h2>
              <p className="text-teal-700">Submit a request to organize an alumni event and bring the community together.</p>
            </div>
            <AlumniEventRequest />
          </div>
        );
      case 'alumni-managment-requests':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-6 border border-indigo-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Management Requests</h2>
              <p className="text-indigo-700">Review and respond to event collaboration requests from the management team.</p>
            </div>
            <AlumniManagementRequests />
          </div>
        );
      case 'chat':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 border border-emerald-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Alumni Chat</h2>
              <p className="text-emerald-700">Connect instantly with fellow alumni and engage in meaningful conversations.</p>
            </div>
            <UserChat />
          </div>
        );
      default:
        return <AlumniProfileNew />;
    }
  };

  return (
    <Layout title="Alumni Dashboard">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Alumni Dashboard</h1>
                  <p className="text-blue-100 text-lg">Welcome back! Manage your professional network and career opportunities</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-blue-200" />
                      <span className="text-sm font-medium">Connected to Alumni Network</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex items-center space-x-3 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-700 bg-blue-50'
                          : 'border-transparent text-gray-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                    >
                      <Icon className={`h-5 w-5 transition-colors ${
                        activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                      }`} />
                      <span className="font-medium">{tab.name}</span>
                      {activeTab === tab.id && (
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Enhanced Content Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8">
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AlumniDashboard;
