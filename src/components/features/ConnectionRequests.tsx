import { Check, MessageCircle, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { connectionAPI } from '../../services/api';

interface ConnectionRequest {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestedAt: string;
  senderName?: string;
  senderEmail?: string;
  senderRole?: string;
  senderDepartment?: string;
}

const ConnectionRequests: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      console.log('ConnectionRequests: Loading pending requests...');
      const response = await connectionAPI.getPendingRequests();
      console.log('ConnectionRequests: Pending requests response:', response);
      setPendingRequests(response);
    } catch (error: any) {
      console.error('Error loading pending requests:', error);
      showToast('Failed to load connection requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId: string) => {
    setActionLoading(connectionId);
    try {
      console.log('ConnectionRequests: Accepting connection request:', connectionId);
      await connectionAPI.acceptConnectionRequest(connectionId);
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
      showToast('Connection request accepted!', 'success');
      
      // Trigger a custom event to notify other components to refresh their data
      window.dispatchEvent(new CustomEvent('connectionUpdated'));
    } catch (error: any) {
      console.error('ConnectionRequests: Error accepting request:', error);
      showToast('Failed to accept connection request', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (connectionId: string) => {
    setActionLoading(connectionId);
    try {
      console.log('ConnectionRequests: Rejecting connection request:', connectionId);
      await connectionAPI.rejectConnectionRequest(connectionId);
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
      showToast('Connection request rejected', 'info');
      
      // Trigger a custom event to notify other components to refresh their data
      window.dispatchEvent(new CustomEvent('connectionUpdated'));
    } catch (error: any) {
      console.error('ConnectionRequests: Error rejecting request:', error);
      showToast('Failed to reject connection request', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connection Requests</h3>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
          {pendingRequests.length} pending
        </span>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No pending connection requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div key={request.id} className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{request.senderName || 'Unknown User'}</h4>
                      {request.senderRole && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {request.senderRole}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.senderEmail || 'No email available'}</p>
                    {request.message && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{request.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleAccept(request.id)}
                    disabled={actionLoading === request.id}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={actionLoading === request.id}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionRequests;