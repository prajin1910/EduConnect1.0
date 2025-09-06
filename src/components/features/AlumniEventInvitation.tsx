import { Calendar, Clock, Eye, MapPin, Send, UserCheck, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { managementAPI } from '../../services/api';

interface Alumni {
  id: string;
  name: string;
  email: string;
  graduationYear: string;
  department: string;
  company: string;
}

interface AlumniEventInvitationProps {}

const AlumniEventInvitation: React.FC<AlumniEventInvitationProps> = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDescription: '',
    eventType: '',
    proposedDate: '',
    proposedTime: '',
    proposedEndTime: '',
    venue: '',
    expectedAttendees: '',
    budget: '',
    specialRequirements: '',
    managementNote: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    loadAvailableAlumni();
  }, []);

  const loadAvailableAlumni = async () => {
    try {
      setLoading(true);
      console.log('Loading available alumni...');
      const response = await managementAPI.getApprovedAlumni();
      console.log('Available alumni response:', response);
      
      // Transform the data to match our interface
      const alumniData = Array.isArray(response) ? response : [];
      console.log('Raw alumni data from API:', alumniData);
      
      const transformedAlumni = alumniData.map((alum: any) => ({
        id: alum.id,
        name: alum.name,
        email: alum.email,
        graduationYear: alum.graduationYear || 'Unknown',
        department: alum.department || 'Unknown',
        company: alum.currentCompany || alum.placedCompany || 'Not specified'
      }));
      
      console.log('Transformed alumni data:', transformedAlumni);
      setAlumni(transformedAlumni);
    } catch (error: any) {
      console.error('Failed to load alumni:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to load alumni list';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlumni = (alumni: Alumni) => {
    setSelectedAlumni(alumni);
    setShowInviteForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumni) return;

    setSubmitting(true);
    try {
      // Prepare the request data with proper field mapping
      const requestData = {
        eventTitle: formData.eventTitle,
        eventDescription: formData.eventDescription,
        eventType: formData.eventType,
        proposedDate: formData.proposedDate,
        proposedTime: formData.proposedTime,
        proposedEndTime: formData.proposedEndTime,
        venue: formData.venue,
        expectedAttendees: parseInt(formData.expectedAttendees) || 50,
        budget: formData.budget ? parseInt(formData.budget) : null,
        specialRequirements: formData.specialRequirements,
        managementNote: formData.managementNote
      };
      
      console.log('Sending invitation to alumni:', selectedAlumni.id, 'with data:', requestData);
      console.log('Selected alumni object:', selectedAlumni);
      const response = await managementAPI.requestEventFromAlumni(selectedAlumni.id, requestData);
      console.log('Invitation response:', response);
      
      showToast(
        `Event invitation sent to ${selectedAlumni.name} successfully!`, 
        'success'
      );
      
      // Reset form
      setFormData({
        eventTitle: '',
        eventDescription: '',
        eventType: '',
        proposedDate: '',
        proposedTime: '',
        proposedEndTime: '',
        venue: '',
        expectedAttendees: '',
        budget: '',
        specialRequirements: '',
        managementNote: ''
      });
      setShowInviteForm(false);
      setSelectedAlumni(null);
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to send event invitation';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
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
          <h2 className="text-2xl font-bold text-gray-900">Invite Alumni for Events</h2>
          <p className="text-gray-600">Select an alumni and invite them to organize an event</p>
        </div>
      </div>

      {!showInviteForm ? (
        // Alumni Selection Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm border p-8 text-center">
              <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Alumni Available</h3>
              <p className="text-gray-600">No verified alumni found to invite for events.</p>
            </div>
          ) : (
            alumni.map((alumniMember) => (
              <div
                key={alumniMember.id}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectAlumni(alumniMember)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{alumniMember.name}</h3>
                      <p className="text-sm text-gray-600">{alumniMember.company}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><strong>Department:</strong> {alumniMember.department}</p>
                  <p><strong>Graduation Year:</strong> {alumniMember.graduationYear}</p>
                  <p><strong>Email:</strong> {alumniMember.email}</p>
                </div>

                <button
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Invitation</span>
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        // Event Invitation Form
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Send Event Invitation to {selectedAlumni?.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedAlumni?.email} • {selectedAlumni?.company}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  setSelectedAlumni(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <Eye className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitInvitation} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select event type</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Networking">Networking Event</option>
                  <option value="Career Talk">Career Talk</option>
                  <option value="Technical Session">Technical Session</option>
                  <option value="Reunion">Alumni Reunion</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <textarea
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Describe the event purpose, agenda, and what you'd like the alumni to organize"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Proposed Date *
                </label>
                <input
                  type="date"
                  name="proposedDate"
                  value={formData.proposedDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Start Time *
                </label>
                <input
                  type="time"
                  name="proposedTime"
                  value={formData.proposedTime}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  End Time *
                </label>
                <input
                  type="time"
                  name="proposedEndTime"
                  value={formData.proposedEndTime}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Venue *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Event venue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Expected Attendees *
                </label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={formData.expectedAttendees}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Number of expected attendees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (Optional)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Event budget"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements (Optional)
              </label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Any special equipment, setup, or requirements for the event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Management Note
              </label>
              <textarea
                name="managementNote"
                value={formData.managementNote}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Personal message to the alumni explaining why you chose them for this event"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false);
                  setSelectedAlumni(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Invitation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AlumniEventInvitation;
