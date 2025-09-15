import axios from 'axios';
import { Calendar, CheckCircle, Eye, MapPin, User, Users, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

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
  status: string;
}

const ManagementEventApproval: React.FC = () => {
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
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend-7y12.onrender.com/api/management/events/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setPendingRequests(response.data);
    } catch (error: any) {
      console.error('Error loading pending requests:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to load pending requests';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://backend-7y12.onrender.com/api/management/events/${eventId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showToast('Event approved successfully!', 'success');
        loadPendingRequests(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error approving event:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to approve event';
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
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://backend-7y12.onrender.com/api/management/events/${eventId}/reject`, {
        reason: rejectionReason
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        showToast('Event rejected successfully!', 'success');
        setShowRejectModal(false);
        setRejectionReason('');
        loadPendingRequests(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error rejecting event:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to reject event';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Alumni Event Requests
        </h1>
        <p className="text-gray-600">
          Review and approve/reject alumni event requests ({pendingRequests.length} pending)
        </p>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-500">All event requests have been processed.</p>
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {request.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">{request.organizerName}</p>
                        <p className="text-xs">{request.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <div>
                        <p>{new Date(request.startDateTime).toLocaleDateString()}</p>
                        <p className="text-xs">{new Date(request.startDateTime).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{request.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{request.maxAttendees ? `Max ${request.maxAttendees}` : 'No limit'}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {request.description}
                  </p>

                  <div className="text-xs text-gray-500">
                    Submitted: {new Date(request.submittedAt).toLocaleString()}
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={actionLoading === request.id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {actionLoading === request.id ? 'Approving...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleRejectClick(request)}
                    disabled={actionLoading === request.id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                  <h4 className="font-medium text-gray-900">{selectedRequest.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Organizer</label>
                    <p className="text-sm text-gray-900">{selectedRequest.organizerName}</p>
                    <p className="text-xs text-gray-500">{selectedRequest.organizerEmail}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <p className="text-sm text-gray-900">{selectedRequest.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">{selectedRequest.location}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max Attendees</label>
                    <p className="text-sm text-gray-900">{selectedRequest.maxAttendees || 'No limit'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date & Time</label>
                    <p className="text-sm text-gray-900">{new Date(selectedRequest.startDateTime).toLocaleString()}</p>
                  </div>
                  
                  {selectedRequest.endDateTime && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">End Date & Time</label>
                      <p className="text-sm text-gray-900">{new Date(selectedRequest.endDateTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {selectedRequest.targetAudience && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Target Audience</label>
                    <p className="text-sm text-gray-900">{selectedRequest.targetAudience}</p>
                  </div>
                )}

                {selectedRequest.specialRequirements && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Special Requirements</label>
                    <p className="text-sm text-gray-900">{selectedRequest.specialRequirements}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={!rejectionReason.trim() || actionLoading === selectedRequest.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
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

export default ManagementEventApproval;
