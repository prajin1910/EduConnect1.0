import { Calendar, Check, Clock, MapPin, MessageSquare, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { alumniAPI } from '../../services/api';

interface ManagementEventRequest {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime?: string;
  location: string;
  targetAudience: string;
  maxAttendees?: number;
  specialRequirements?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  requestedBy: string;
  requestedByName: string;
}

const AlumniManagementRequests: React.FC = () => {
  const [requests, setRequests] = useState<ManagementEventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');
  const { showToast } = useToast();

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await alumniAPI.getPendingManagementRequests();
      console.log('Management requests response:', response);
      setRequests(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('Error loading management requests:', error);
      showToast('Failed to load management requests', 'error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (requestId: string, action: 'accept' | 'reject') => {
    setSelectedRequest(requestId);
    setActionType(action);
    setShowResponseModal(true);
    setResponseMessage('');
    setRejectReason('');
  };

  const submitResponse = async () => {
    if (!selectedRequest) return;

    try {
      if (actionType === 'accept') {
        if (!responseMessage.trim()) {
          showToast('Please provide a response message', 'error');
          return;
        }
        await alumniAPI.acceptManagementEventRequest(selectedRequest, responseMessage);
        showToast('Event request accepted successfully!', 'success');
      } else {
        if (!rejectReason.trim()) {
          showToast('Please provide a reason for rejection', 'error');
          return;
        }
        await alumniAPI.rejectManagementEventRequest(selectedRequest, rejectReason);
        showToast('Event request rejected successfully!', 'success');
      }

      // Refresh the list
      loadPendingRequests();
      setShowResponseModal(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error responding to request:', error);
      showToast('Failed to respond to request', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-6 w-6 text-orange-600" />
        <h2 className="text-xl font-semibold">Management Event Requests</h2>
      </div>

      {requests.length === 0 ? (
                <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">No Pending Requests</h3>
          <p className="text-gray-600">No alumni event requests are currently pending approval.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(request.startDateTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(request.startDateTime)}
                        {request.endDateTime && ` - ${formatTime(request.endDateTime)}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Requested by:</span>
                      <span>{request.requestedByName}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{request.description}</p>
                  
                  {request.specialRequirements && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <h4 className="font-medium text-blue-900 mb-1">Special Requirements:</h4>
                      <p className="text-blue-700 text-sm">{request.specialRequirements}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Requested on: {formatDate(request.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleAction(request.id, 'accept')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Accept</span>
                </button>
                
                <button
                  onClick={() => handleAction(request.id, 'reject')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {actionType === 'accept' ? 'Accept Event Request' : 'Reject Event Request'}
                </h3>
                
                {actionType === 'accept' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Message
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter your response message..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={submitResponse}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                    actionType === 'accept' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'accept' ? 'Accept Request' : 'Reject Request'}
                </button>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniManagementRequests;
