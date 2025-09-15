import {
    Bell,
    ChevronDown,
    Clock,
    Eye,
    Filter,
    Mail,
    MailOpen,
    Search,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { circularAPI } from '../../services/api';

interface Circular {
  id: string;
  title: string;
  body: string;
  senderId: string;
  senderName: string;
  senderRole: 'MANAGEMENT' | 'PROFESSOR' | 'STUDENT';
  recipientTypes: string[];
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  readBy: string[];
}

const CircularView: React.FC = () => {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [senderFilter, setSenderFilter] = useState<'all' | 'MANAGEMENT' | 'PROFESSOR'>('all');
  
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadCirculars();
  }, []);

  const loadCirculars = async () => {
    try {
      setLoading(true);
      const data = await circularAPI.getMyReceivedCirculars();
      setCirculars(data);
    } catch (error: any) {
      console.error('Error loading circulars:', error);
      showToast('Failed to load circulars', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCircularClick = async (circular: Circular) => {
    setSelectedCircular(circular);
    
    // Mark as read if not already read
    if (!circular.readBy.includes(user?.id || '')) {
      try {
        await circularAPI.markAsRead(circular.id);
        
        // Update local state
        setCirculars(prev => prev.map(c => 
          c.id === circular.id 
            ? { ...c, readBy: [...c.readBy, user?.id || ''] }
            : c
        ));
      } catch (error) {
        console.error('Error marking circular as read:', error);
      }
    }
  };

  const filteredCirculars = circulars
    .filter(circular => {
      // Filter by read status
      const isRead = circular.readBy.includes(user?.id || '');
      if (filter === 'read' && !isRead) return false;
      if (filter === 'unread' && isRead) return false;
      
      // Filter by sender role
      if (senderFilter !== 'all' && circular.senderRole !== senderFilter) return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          circular.title.toLowerCase().includes(searchLower) ||
          circular.body.toLowerCase().includes(searchLower) ||
          circular.senderName.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = circulars.filter(c => !c.readBy.includes(user?.id || '')).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSenderRoleIcon = (role: string) => {
    switch (role) {
      case 'MANAGEMENT':
        return '👔';
      case 'PROFESSOR':
        return '👨‍🏫';
      case 'STUDENT':
        return '👨‍🎓';
      default:
        return '👤';
    }
  };

  const getSenderRoleColor = (role: string) => {
    switch (role) {
      case 'MANAGEMENT':
        return 'text-purple-600 bg-purple-100';
      case 'PROFESSOR':
        return 'text-green-600 bg-green-100';
      case 'STUDENT':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (selectedCircular) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MailOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Circular Details</h2>
                  <p className="text-purple-100 text-sm">
                    From {selectedCircular.senderName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCircular(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Circular Header */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    getSenderRoleColor(selectedCircular.senderRole)
                  }`}>
                    {getSenderRoleIcon(selectedCircular.senderRole)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedCircular.senderName}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedCircular.senderRole.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(selectedCircular.createdAt)}</span>
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedCircular.title}
              </h1>
            </div>

            {/* Circular Body */}
            <div className="prose max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedCircular.body}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedCircular(null)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span>← Back to Circulars</span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MailOpen className="w-4 h-4" />
                <span>Marked as read</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Circulars</h1>
              <p className="text-gray-600">
                {unreadCount > 0 
                  ? `${unreadCount} unread circular${unreadCount > 1 ? 's' : ''}`
                  : 'All circulars read'
                }
              </p>
            </div>
          </div>
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg">
              <Bell className="w-4 h-4" />
              <span className="font-medium">{unreadCount} New</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search circulars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Sender</p>
                    <div className="space-y-1">
                      {['all', 'MANAGEMENT', 'PROFESSOR'].map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setSenderFilter(role as any);
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            senderFilter === role
                              ? 'bg-purple-100 text-purple-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {role === 'all' ? 'All Senders' : role.charAt(0) + role.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading circulars...</span>
            </div>
          </div>
        ) : filteredCirculars.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {searchTerm || filter !== 'all' || senderFilter !== 'all' 
                ? 'No circulars match your filters'
                : 'No circulars received yet'
              }
            </p>
            {(searchTerm || filter !== 'all' || senderFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setSenderFilter('all');
                }}
                className="text-purple-600 hover:text-purple-700 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredCirculars.map((circular) => {
            const isUnread = !circular.readBy.includes(user?.id || '');
            
            return (
              <div
                key={circular.id}
                onClick={() => handleCircularClick(circular)}
                className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${
                  isUnread 
                    ? 'border-purple-200 bg-purple-50/30' 
                    : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          getSenderRoleColor(circular.senderRole)
                        }`}>
                          {getSenderRoleIcon(circular.senderRole)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{circular.senderName}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {circular.senderRole.toLowerCase()}
                          </p>
                        </div>
                        {isUnread && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isUnread ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {circular.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {circular.body.substring(0, 150)}
                        {circular.body.length > 150 ? '...' : ''}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(circular.createdAt)}</span>
                        </div>
                        {isUnread ? (
                          <div className="flex items-center space-x-1 text-purple-600">
                            <Mail className="w-3 h-3" />
                            <span>Unread</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <MailOpen className="w-3 h-3" />
                            <span>Read</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CircularView;
