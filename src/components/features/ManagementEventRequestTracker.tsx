import { AlertCircle, Calendar, CheckCircle, Clock, Eye, User, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { managementAPI } from '../../services/api';

interface ManagementEventRequest {
  id: string;
  managementId: string;
  managementName: string;
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  eventTitle: string;
  eventDescription: string;
  proposedDate: string;
  proposedTime: string;
  venue: string;
  expectedAttendees: number;
  eventType: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestedAt: string;
  budget?: number;
  specialRequirements?: string;
  managementNote?: string;
  respondedAt?: string;
  alumniResponse?: string;
  rejectionReason?: string;
}

const ManagementEventRequestTracker: React.FC = () => {
  const [requests, setRequests] = useState<ManagementEventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ManagementEventRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

  const { showToast } = useToast();

  useEffect(() => {
    loadManagementEventRequests();
  }, []);

  const loadManagementEventRequests = async () => {
    try {
      setLoading(true);
      const response = await managementAPI.getAllManagementEventRequests();
      console.log('ManagementEventRequestTracker: Raw response:', response);
      
      // Transform Event objects to ManagementEventRequest format
      const transformedRequests = (response || []).map((event: any) => ({
        id: event.id,
        managementId: event.requestedBy || event.approvedBy || 'unknown',
        managementName: event.requestedByName || 'Management',
        alumniId: event.organizerId,
        alumniName: event.organizerName || 'Unknown Alumni',
        alumniEmail: event.organizerEmail || '',
        eventTitle: event.title || 'Untitled Event',
        eventDescription: event.description || 'No description available',
        proposedDate: event.startDateTime ? new Date(event.startDateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        proposedTime: event.startDateTime ? new Date(event.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '00:00',
        venue: event.location || 'Not specified',
        expectedAttendees: event.maxAttendees || 0,
        eventType: event.type === 'MANAGEMENT_REQUESTED' ? 'Management Requested' : 'Alumni Initiated',
        status: event.status === 'APPROVED' ? 'ACCEPTED' : event.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        requestedAt: event.submittedAt || new Date().toISOString(),
        budget: 0, // Not available in Event model
        specialRequirements: event.specialRequirements || '',
        managementNote: '', // Not available in Event model
        respondedAt: event.approvedAt || event.rejectedAt || undefined,
        alumniResponse: event.status === 'APPROVED' ? 'Event accepted and approved' : undefined,
        rejectionReason: event.rejectionReason || undefined
      }));
      
      console.log('ManagementEventRequestTracker: Transformed requests:', transformedRequests);
      setRequests(transformedRequests);
    } catch (error) {
      console.error('Failed to load management event requests:', error);
      showToast('Failed to load event requests', 'error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: ManagementEventRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const filteredRequests = requests.filter(request => {
    return filterStatus === 'ALL' || request.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
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
          <h2 className="text-2xl font-bold text-gray-900">Event Request Status</h2>
          <p className="text-gray-600">Track your event invitations sent to alumni</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'ACCEPTED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Event Invitations</h3>
          <p className="text-gray-600 mt-1">Your sent invitations and their responses</p>
        </div>
        
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No event requests found</p>
            <p className="text-gray-400">
              {requests.length === 0 
                ? "No event invitations have been sent yet"
                : "Try adjusting your filter criteria"
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {request.eventTitle}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Invited: {request.alumniName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{request.proposedDate ? new Date(request.proposedDate).toLocaleDateString() : 'Invalid Date'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{request.proposedTime || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 mb-2">{request.eventDescription}</p>
                    
                    <div className="text-sm text-gray-500">
                      Sent: {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'Unknown'}
                      {request.respondedAt && (
                        <span> • Responded: {new Date(request.respondedAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    {request.status === 'ACCEPTED' && request.alumniResponse && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Alumni Response:</strong> {request.alumniResponse}
                        </p>
                      </div>
                    )}

                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <div className="mt-2 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Event Request Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">{selectedRequest.eventTitle}</h4>
                <div className="flex gap-2 mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    {selectedRequest.eventType}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Alumni Information</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {selectedRequest.alumniName}</p>
                    <p><strong>Email:</strong> {selectedRequest.alumniEmail}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Event Details</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Date:</strong> {selectedRequest.proposedDate ? new Date(selectedRequest.proposedDate).toLocaleDateString() : 'Invalid Date'}</p>
                    <p><strong>Time:</strong> {selectedRequest.proposedTime || 'Not specified'}</p>
                    <p><strong>Venue:</strong> {selectedRequest.venue || 'Not specified'}</p>
                    <p><strong>Expected Attendees:</strong> {selectedRequest.expectedAttendees || 0}</p>
                    {selectedRequest.budget && selectedRequest.budget > 0 && (
                      <p><strong>Budget:</strong> ${selectedRequest.budget}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedRequest.eventDescription}</p>
              </div>

              {selectedRequest.specialRequirements && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Special Requirements</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedRequest.specialRequirements}</p>
                </div>
              )}

              {selectedRequest.managementNote && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Management Note</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedRequest.managementNote}</p>
                </div>
              )}

              {selectedRequest.status === 'ACCEPTED' && selectedRequest.alumniResponse && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">Alumni Response</h5>
                  <p className="text-sm text-green-800">{selectedRequest.alumniResponse}</p>
                  <p className="text-xs text-green-600 mt-2">
                    Accepted on {new Date(selectedRequest.respondedAt!).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedRequest.status === 'REJECTED' && selectedRequest.rejectionReason && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h5 className="font-medium text-red-900 mb-2">Rejection Reason</h5>
                  <p className="text-sm text-red-800">{selectedRequest.rejectionReason}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Rejected on {new Date(selectedRequest.respondedAt!).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-400">
                <p>Request sent on {selectedRequest.requestedAt ? new Date(selectedRequest.requestedAt).toLocaleString() : 'Unknown date'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementEventRequestTracker;
