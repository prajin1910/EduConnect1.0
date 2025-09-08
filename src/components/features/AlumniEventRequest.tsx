import { Calendar, Clock, DollarSign, FileText, MapPin, Send, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface AlumniEventRequestProps {}

const AlumniEventRequest: React.FC<AlumniEventRequestProps> = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    eventDateTime: '',
    eventEndDateTime: '',
    venue: '',
    expectedAttendees: '',
    budget: '',
    specialRequirements: '',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const eventTypes = [
    'Workshop',
    'Seminar',
    'Networking',
    'Reunion',
    'Career Fair',
    'Industry Talk',
    'Panel Discussion',
    'Alumni Meet',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      showToast('Please enter an event title', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Please enter an event description', 'error');
      return;
    }
    if (!formData.eventType) {
      showToast('Please select an event type', 'error');
      return;
    }
    if (!formData.eventDateTime) {
      showToast('Please select event start date and time', 'error');
      return;
    }
    if (!formData.eventEndDateTime) {
      showToast('Please select event end date and time', 'error');
      return;
    }
    if (new Date(formData.eventEndDateTime) <= new Date(formData.eventDateTime)) {
      showToast('Event end time must be after start time', 'error');
      return;
    }
    if (!formData.venue.trim()) {
      showToast('Please enter a venue', 'error');
      return;
    }
    if (!formData.expectedAttendees || parseInt(formData.expectedAttendees) <= 0) {
      showToast('Please enter a valid number of expected attendees', 'error');
      return;
    }

    setLoading(true);
    try {
      // Submit event request using the correct API endpoint
      const requestData = {
        title: formData.title,
        description: formData.description,
        location: formData.venue,
        startDateTime: formData.eventDateTime,
        endDateTime: formData.eventEndDateTime,
        maxAttendees: parseInt(formData.expectedAttendees),
        specialRequirements: formData.specialRequirements,
        targetAudience: 'All Students',
        eventType: formData.eventType,
        contactEmail: '', // Will be set by backend
        contactPhone: '' // Will be set by backend
      };
      
      console.log('Submitting event request:', requestData);
      const response = await api.post('/api/alumni-events/request', requestData);
      console.log('Event request response:', response);
      
      showToast('Event request submitted successfully! Management will review your request.', 'success');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        eventType: '',
        eventDateTime: '',
        eventEndDateTime: '',
        venue: '',
        expectedAttendees: '',
        budget: '',
        specialRequirements: '',
      });
    } catch (error: any) {
      console.error('Failed to submit event request:', error);
      const errorMessage = error.response?.data?.error || error.response?.data || error.message || 'Failed to submit event request';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Request Event from Management</h1>
            <p className="text-gray-600">
              Submit a request to organize an event that will benefit students and the academic community
            </p>
          </div>
        </div>

        {/* Request Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title for your event"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select event type</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the event, its objectives, and how it will benefit the community"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Event Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="eventDateTime"
                  value={formData.eventDateTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Event End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="eventEndDateTime"
                  value={formData.eventEndDateTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Venue and Attendees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="e.g., Main Auditorium, Conference Hall"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
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
                  placeholder="e.g., 50"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Estimated Budget (Optional)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="Enter estimated budget in USD"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements (Optional)
              </label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special equipment, catering, or other requirements"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">What happens after you submit?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Management will review your event request within 2-3 business days
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
              You'll receive a notification once your request is approved or requires modifications
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Approved events will be visible to students and professors in their portals
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></span>
              You'll be contacted for any additional coordination required
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlumniEventRequest;
