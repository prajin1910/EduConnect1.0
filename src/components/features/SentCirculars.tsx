import {
    Archive,
    BarChart3,
    Clock,
    Eye,
    Search,
    Send,
    Users,
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
  recipients: string[];
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  readBy: string[];
}

const SentCirculars: React.FC = () => {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadSentCirculars();
  }, []);

  const loadSentCirculars = async () => {
    try {
      setLoading(true);
      const data = await circularAPI.getMySentCirculars();
      setCirculars(data);
    } catch (error: any) {
      console.error('Error loading sent circulars:', error);
      showToast('Failed to load sent circulars', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveCircular = async (circularId: string) => {
    try {
      await circularAPI.archiveCircular(circularId);
      showToast('Circular archived successfully', 'success');
      
      // Update local state
      setCirculars(prev => prev.map(c => 
        c.id === circularId 
          ? { ...c, status: 'ARCHIVED' as const }
          : c
      ));
    } catch (error: any) {
      console.error('Error archiving circular:', error);
      showToast('Failed to archive circular', 'error');
    }
  };

  const filteredCirculars = circulars
    .filter(circular => {
      // Filter by archived status
      if (!showArchived && circular.status === 'ARCHIVED') return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          circular.title.toLowerCase().includes(searchLower) ||
          circular.body.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  const getRecipientTypesText = (recipientTypes: string[]) => {
    if (recipientTypes.includes('ALL')) {
      return 'Everyone';
    }
    return recipientTypes.map(type => 
      type.charAt(0) + type.slice(1).toLowerCase()
    ).join(', ');
  };

  const getReadStats = (circular: Circular) => {
    const totalRecipients = circular.recipients.length;
    const readCount = circular.readBy.length;
    return {
      readCount,
      totalRecipients,
      readPercentage: totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0
    };
  };

  if (selectedCircular) {
    const stats = getReadStats(selectedCircular);
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Sent Circular</h2>
                  <p className="text-blue-100 text-sm">
                    {stats.readCount} of {stats.totalRecipients} recipients read
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
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Sent {formatDate(selectedCircular.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>To: {getRecipientTypesText(selectedCircular.recipientTypes)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    selectedCircular.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedCircular.status.toLowerCase()}
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedCircular.title}
              </h1>
              
              {/* Read Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Read Status</span>
                  <span className="text-sm text-gray-600">
                    {stats.readCount}/{stats.totalRecipients} ({stats.readPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.readPercentage}%` }}
                  ></div>
                </div>
              </div>
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
                <span>← Back to Sent Circulars</span>
              </button>
              
              {selectedCircular.status === 'ACTIVE' && (
                <button
                  onClick={() => handleArchiveCircular(selectedCircular.id)}
                  className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </button>
              )}
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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sent Circulars</h1>
              <p className="text-gray-600">
                {circulars.length} circular{circulars.length !== 1 ? 's' : ''} sent
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {circulars.filter(c => c.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {circulars.filter(c => c.status === 'ARCHIVED').length}
              </div>
              <div className="text-sm text-gray-600">Archived</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sent circulars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Show Archived Toggle */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showArchived
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading sent circulars...</span>
            </div>
          </div>
        ) : filteredCirculars.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {searchTerm || showArchived
                ? 'No circulars match your filters'
                : 'No circulars sent yet'
              }
            </p>
            {(searchTerm || showArchived) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setShowArchived(false);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredCirculars.map((circular) => {
            const stats = getReadStats(circular);
            const isArchived = circular.status === 'ARCHIVED';
            
            return (
              <div
                key={circular.id}
                className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${
                  isArchived 
                    ? 'border-gray-300 opacity-75' 
                    : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(circular.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{getRecipientTypesText(circular.recipientTypes)}</span>
                        </div>
                        {isArchived && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            Archived
                          </span>
                        )}
                      </div>
                      
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isArchived ? 'text-gray-600' : 'text-gray-800'
                      }`}>
                        {circular.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {circular.body.substring(0, 150)}
                        {circular.body.length > 150 ? '...' : ''}
                      </p>
                      
                      {/* Read Statistics */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {stats.readCount}/{stats.totalRecipients} read ({stats.readPercentage}%)
                          </span>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${stats.readPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!isArchived && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveCircular(circular.id);
                          }}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Archive circular"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedCircular(circular)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
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

export default SentCirculars;
