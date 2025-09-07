import {
  Award,
  Briefcase,
  Calendar,
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
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();

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
          <p className="mt-4 text-lg font-medium text-white">Loading dashboard...</p>
          <p className="text-sm text-blue-200">Please wait while we fetch your data</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-white">Your Profile</h2>
                <button
                  onClick={() => loadStats(true)}
                  disabled={statsLoading}
                  className="inline-flex items-center px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md text-xs font-medium text-white hover:bg-white/20 transition-all duration-300"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${statsLoading ? 'animate-spin' : ''}`} />
                  {statsLoading ? 'Refreshing' : 'Refresh'}
                </button>
              </div>
              <p className="text-blue-200 text-xs">Manage your professional information.</p>
            </div>
            
            <AlumniProfileNew />
            
            {/* Ultra Compact Stats */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-md p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white flex items-center">
                  <TrendingUp className="h-3 w-3 text-blue-400 mr-1" />
                  Impact
                </h2>
                {error && (
                  <div className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded border border-red-500/30">
                    Error
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Network */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center mx-auto mb-1">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  {statsLoading ? (
                    <div className="w-4 h-4 bg-white/20 rounded animate-pulse mx-auto"></div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-white">{stats.networkConnections}</p>
                      <p className="text-xs text-blue-200">Network</p>
                    </>
                  )}
                </div>
                
                {/* Events */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center mx-auto mb-1">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                  {statsLoading ? (
                    <div className="w-4 h-4 bg-white/20 rounded animate-pulse mx-auto"></div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-white">{stats.eventsCount}</p>
                      <p className="text-xs text-blue-200">Events</p>
                    </>
                  )}
                </div>
                
                {/* Jobs */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-2 text-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center mx-auto mb-1">
                    <Briefcase className="h-3 w-3 text-white" />
                  </div>
                  {statsLoading ? (
                    <div className="w-4 h-4 bg-white/20 rounded animate-pulse mx-auto"></div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-white">{stats.jobsPosted}</p>
                      <p className="text-xs text-blue-200">Jobs</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Mini Achievement */}
              <div className="mt-3 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md">
                <div className="flex items-center space-x-1">
                  <Award className="h-3 w-3 text-amber-400" />
                  <h3 className="text-xs font-semibold text-white">Achievements</h3>
                </div>
                <p className="text-blue-200 text-xs">
                  {stats.networkConnections > 10 && "🌟 "}
                  {stats.eventsCount > 3 && "🎯 "}
                  {stats.jobsPosted > 5 && "💼 "}
                  Active contributor!
                </p>
              </div>
            </div>
          </div>
        );
      case 'directory':
        return <AlumniDirectoryNew />;
      case 'connections':
        return <ConnectionRequests />;
      case 'password':
        return <PasswordChange />;
      case 'jobs':
        return <JobBoardEnhanced />;
      case 'events':
        return <EventsView />;
      case 'request-event':
        return <AlumniEventRequest />;
      case 'alumni-managment-requests':
        return <AlumniManagementRequests />;
      case 'chat':
        return <UserChat />;
      default:
        return <AlumniProfileNew />;
    }
  };

  return (
    <Layout title="Alumni Dashboard">
      <div className="space-y-2 px-1 sm:px-2">
        {/* Compact Welcome Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 text-white shadow-md">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-md flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Welcome, {user?.name}!</h2>
              <p className="text-blue-200 text-xs">
                Manage your network and opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-md overflow-hidden">
          <nav className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-2 font-medium text-xs flex items-center space-x-1 transition-all duration-300 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  } ${index === 0 ? 'rounded-tl-lg' : ''} ${index === tabs.length - 1 ? 'rounded-tr-lg' : ''}`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:block text-xs">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Compact Active Component */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-md p-3">
          {renderActiveComponent()}
        </div>
      </div>
    </Layout>
  );
};

export default AlumniDashboard;
