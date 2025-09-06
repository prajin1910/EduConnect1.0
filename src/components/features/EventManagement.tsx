import { Calendar, CheckCircle, Eye, MapPin, User, Users, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { managementAPI } from '../../services/api';

interface EventRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime?: string;
  maxAttendees?: number;
  organizerName: string;
  organizerEmail: string;
  department: string;
  specialRequirements?: string;
  targetAudience?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: string;
}

const EventManagement: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<EventRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      console.log('Loading alumni event requests...');
      const response = await managementAPI.getAllAlumniEventRequests();
      console.log('Alumni event requests response:', response);
      
      // Handle both response.data and direct response
      const data = response.data || response || [];
      const requestsData = Array.isArray(data) ? data : [];
      
      // Filter only pending requests
      const pendingOnly = requestsData.filter((req: any) => req.status === 'PENDING');
      
      setPendingRequests(pendingOnly);
      console.log('Loaded pending requests:', pendingOnly);
    } catch (error: any) {
      console.error('Error loading pending requests:', error);
      showToast('Failed to load pending event requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      console.log('Approving event:', eventId);
      const response = await managementAPI.approveAlumniEventRequest(eventId);
      console.log('Approval response:', response);
      
      showToast('Event approved successfully! Alumni has been notified.', 'success');
      
      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== eventId));
      
      // Close modal if this was the selected request
      if (selectedRequest?.id === eventId) {
        setShowDetailModal(false);
        setSelectedRequest(null);
      }
    } catch (error: any) {
      console.error('Error approving event:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to approve event';
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId: string) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    setActionLoading(eventId);
    try {
      console.log('Rejecting event:', eventId, 'with reason:', rejectionReason);
      const response = await managementAPI.rejectAlumniEventRequest(eventId, rejectionReason);
      console.log('Rejection response:', response);
      
      showToast('Event rejected successfully! Alumni has been notified.', 'success');
      
      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== eventId));
      
      // Close modals
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Error rejecting event:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to reject event';
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (request: EventRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleRejectClick = (request: EventRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch (error) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alumni Event Requests</h2>
          <p className="text-gray-600">Review and approve event requests from alumni</p>
        </div>
        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
          {pendingRequests.length} Pending
        </div>
      </div>

      {/* Requests List */}
      {pendingRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">All alumni event requests have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const { date, time } = formatDateTime(request.startDateTime);
            
            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pending Review
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{request.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{request.organizerName}</p>
                          <p className="text-xs">{request.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{date}</p>
                          <p className="text-xs">
                            {time}
                            {request.endDateTime && ` - ${formatDateTime(request.endDateTime).time}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{request.location || 'Location TBD'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">
                          {request.maxAttendees ? `Max ${request.maxAttendees}` : 'No limit'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(request.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    
                    <button
                      onClick={() => window.open(`/alumni/profile/${request.organizerEmail}`, '_blank')}
                      className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>View Profile</span>
                    </button>
                    
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={actionLoading === request.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{actionLoading === request.id ? 'Approving...' : 'Approve'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleRejectClick(request)}
                      disabled={actionLoading === request.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Event Request Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedRequest.title}</h4>
                  <p className="text-gray-700">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Organizer Information</h5>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedRequest.organizerName}</p>
                      <p><strong>Email:</strong> {selectedRequest.organizerEmail}</p>
                      <p><strong>Department:</strong> {selectedRequest.department}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Event Details</h5>
                    <div className="space-y-1 text-sm">
                      <p><strong>Date:</strong> {formatDateTime(selectedRequest.startDateTime).date}</p>
                      <p><strong>Time:</strong> {formatDateTime(selectedRequest.startDateTime).time}</p>
                      <p><strong>Location:</strong> {selectedRequest.location || 'TBD'}</p>
                      <p><strong>Max Attendees:</strong> {selectedRequest.maxAttendees || 'No limit'}</p>
                    </div>
                  </div>
                </div>

                {selectedRequest.targetAudience && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Target Audience</h5>
                    <p className="text-blue-800 text-sm">{selectedRequest.targetAudience}</p>
                  </div>
                )}

                {selectedRequest.specialRequirements && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">Special Requirements</h5>
                    <p className="text-yellow-800 text-sm">{selectedRequest.specialRequirements}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <p>Submitted on {new Date(selectedRequest.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRejectClick(selectedRequest)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject Event
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Event Request</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting "{selectedRequest.title}":
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={!rejectionReason.trim() || actionLoading === selectedRequest.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedRequest.id ? 'Rejecting...' : 'Reject Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;