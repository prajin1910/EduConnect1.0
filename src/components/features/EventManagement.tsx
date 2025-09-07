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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Alumni Event Requests</h1>
                <p className="text-gray-600 text-sm">
                  Review and approve event requests from alumni
                </p>
              </div>
            </div>
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-sm">{pendingRequests.length} Pending</span>
              </div>
            </div>
          </div>
        </div>

      {/* Requests List */}
      {pendingRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">All alumni event requests have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const { date, time } = formatDateTime(request.startDateTime);
            
            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-slate-900">{request.title}</h3>
                          <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 rounded-xl text-sm font-semibold border border-orange-200">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-slate-600 text-lg">{request.organizerName} • {request.department}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                      <p className="text-slate-700 leading-relaxed">{request.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold text-sm">Organizer</span>
                        </div>
                        <div>
                          <p className="font-bold text-blue-900">{request.organizerName}</p>
                          <p className="text-xs text-blue-700">{request.department}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                        <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-semibold text-sm">Date & Time</span>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900">{date}</p>
                          <p className="text-xs text-emerald-700">
                            {time}
                            {request.endDateTime && ` - ${formatDateTime(request.endDateTime).time}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-2 text-purple-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span className="font-semibold text-sm">Location</span>
                        </div>
                        <p className="font-bold text-purple-900">{request.location || 'Location TBD'}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                        <div className="flex items-center space-x-2 text-orange-600 mb-2">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold text-sm">Capacity</span>
                        </div>
                        <p className="font-bold text-orange-900">
                          {request.maxAttendees ? `Max ${request.maxAttendees}` : 'No limit'}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                      Submitted: {new Date(request.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 ml-6">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 flex items-center space-x-2 font-semibold"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    
                    <button
                      onClick={() => window.open(`/alumni/profile/${request.organizerEmail}`, '_blank')}
                      className="px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2 font-semibold"
                    >
                      <User className="h-4 w-4" />
                      <span>View Profile</span>
                    </button>
                    
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={actionLoading === request.id}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{actionLoading === request.id ? 'Approving...' : 'Approve'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleRejectClick(request)}
                      disabled={actionLoading === request.id}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
    </div>
  );
};

export default EventManagement;