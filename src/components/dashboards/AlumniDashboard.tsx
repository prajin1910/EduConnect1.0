import {
  Award,
  Briefcase,
  Calendar,
  GraduationCap,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
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
        return <AlumniProfileNew />;
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
      <div className="space-y-8">
        {/* Enhanced Welcome Section */}
        <div className="card content-padding animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="heading-secondary mb-3">Welcome back, {user?.name}!</h2>
                <p className="text-body max-w-2xl">
                  Manage your professional network, share career opportunities, and mentor the next generation of technology professionals.
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadStats(true)}
                disabled={statsLoading}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{statsLoading ? 'Refreshing' : 'Refresh'}</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <div className="status-success"></div>
                <span>Active Alumni</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <nav className="flex overflow-x-auto mobile-scroll">
            <div className="flex space-x-2 p-2 min-w-max">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-glow'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="hidden sm:block">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Enhanced Quick Stats */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-interactive content-padding group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {statsLoading ? (
                      <div className="loading-spinner w-8 h-8"></div>
                    ) : (
                      stats.networkConnections
                    )}
                  </p>
                  <p className="text-sm text-white/60">Connections</p>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">Professional Network</h3>
              <p className="text-xs text-white/60 mt-2">Building professional relationships</p>
            </div>
            
            <div className="card-interactive content-padding group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white group-hover:text-green-300 transition-colors">
                    {statsLoading ? (
                      <div className="loading-spinner w-8 h-8"></div>
                    ) : (
                      stats.eventsCount
                    )}
                  </p>
                  <p className="text-sm text-white/60">Events</p>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">Event Participation</h3>
              <p className="text-xs text-white/60 mt-2">Community engagement</p>
            </div>
            
            <div className="card-interactive content-padding group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {statsLoading ? (
                      <div className="loading-spinner w-8 h-8"></div>
                    ) : (
                      stats.jobsPosted
                    )}
                  </p>
                  <p className="text-sm text-white/60">Jobs Posted</p>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">Career Opportunities</h3>
              <p className="text-xs text-white/60 mt-2">Helping others succeed</p>
            </div>

            {/* Achievement Summary */}
            <div className="col-span-full">
              <div className="card content-padding">
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="h-6 w-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Impact Summary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="glass-soft rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-amber-300 mb-1">
                      {stats.networkConnections + stats.jobsPosted + stats.eventsCount}
                    </div>
                    <div className="text-sm text-white/70">Total Contributions</div>
                  </div>
                  <div className="glass-soft rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-green-300 mb-1">
                      {stats.networkConnections > 10 ? 'Active' : 'Growing'}
                    </div>
                    <div className="text-sm text-white/70">Network Status</div>
                  </div>
                  <div className="glass-soft rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-blue-300 mb-1">
                      {stats.jobsPosted > 5 ? 'Mentor' : 'Supporter'}
                    </div>
                    <div className="text-sm text-white/70">Community Role</div>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">Unable to load some statistics. Please try refreshing.</p>
                  </div>
                )}
              </div>
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

export default AlumniDashboard;
