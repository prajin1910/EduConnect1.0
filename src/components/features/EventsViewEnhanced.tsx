import { Building, Calendar, Check, Clock, Globe, Mail, MapPin, Phone, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { eventsAPI } from '../../services/api';
import UserProfileModal from './UserProfileModal';

interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime?: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  type: string;
  organizer: string;
  organizerName: string;
  organizerEmail?: string;
  organizerDesignation?: string;
  organizerCompany?: string;
  organizerDepartment?: string;
  department?: string;
  maxAttendees?: number;
  attendees: string[];
  rsvpDeadline?: string;
  isVirtual: boolean;
  meetingLink?: string;
  specialRequirements?: string;
  eventCategory?: string;
  tags?: string[];
  registrationRequired?: boolean;
  eventCost?: string;
  contactEmail?: string;
  contactPhone?: string;
  eventImage?: string;
  eventWebsite?: string;
}

const EventsViewEnhanced: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('EventsViewEnhanced: Loading approved events...');
      const response = await eventsAPI.getApprovedEvents();
      console.log('EventsViewEnhanced: Events loaded:', response.length);
      
      // Transform the data to match our interface
      const eventsData = Array.isArray(response) ? response : [];
      const transformedEvents = eventsData.map((event: any) => ({
        id: event.id,
        title: event.title || 'Untitled Event',
        description: event.description || 'No description available',
        startDateTime: event.startDateTime || event.eventDate || new Date().toISOString(),
        endDateTime: event.endDateTime || event.eventEndDate,
        date: event.startDateTime ? new Date(event.startDateTime).toLocaleDateString() : 'Not specified',
        time: event.startDateTime ? new Date(event.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not specified',
        endTime: event.endDateTime ? new Date(event.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : undefined,
        location: event.location || event.venue || 'Location not specified',
        type: event.type || event.eventType || 'General',
        organizer: event.organizer || event.organizerId,
        organizerName: event.organizerName || event.alumniName || 'Unknown Organizer',
        organizerEmail: event.organizerEmail || event.contactEmail,
        organizerDesignation: event.organizerDesignation || event.designation,
        organizerCompany: event.organizerCompany || event.company,
        organizerDepartment: event.organizerDepartment || event.department,
        department: event.department,
        maxAttendees: event.maxAttendees || event.expectedAttendees || 100,
        attendees: event.attendees || [],
        rsvpDeadline: event.rsvpDeadline,
        isVirtual: event.isVirtual || false,
        meetingLink: event.meetingLink || event.eventLink,
        specialRequirements: event.specialRequirements || event.requirements,
        eventCategory: event.eventCategory || event.category,
        tags: event.tags || [],
        registrationRequired: event.registrationRequired || false,
        eventCost: event.eventCost || event.cost,
        contactEmail: event.contactEmail,
        contactPhone: event.contactPhone,
        eventImage: event.eventImage,
        eventWebsite: event.eventWebsite
      }));
      
      setEvents(transformedEvents);
      console.log('EventsViewEnhanced: Events transformed successfully');
    } catch (error: any) {
      console.error('Error loading events:', error);
      // Don't show error toast if it's just no events available
      if (error.response?.status !== 404 && !error.message?.includes('Failed to load events')) {
        showToast('Failed to load events. Please try again.', 'error');
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (eventId: string) => {
    try {
      const event = events.find((e: Event) => e.id === eventId);
      if (!event) return;

      const isAttending = event.attendees.includes(user?.id || '');
      
      await eventsAPI.updateAttendance(eventId, !isAttending);
      await loadEvents();
      
      showToast(isAttending ? 'Attendance cancelled successfully!' : 'Attendance confirmed successfully!', 'success');
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      showToast('Failed to update attendance', 'error');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'seminar': return 'bg-green-100 text-green-800';
      case 'networking': return 'bg-purple-100 text-purple-800';
      case 'career': return 'bg-orange-100 text-orange-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAttendanceOpen = (event: Event) => {
    if (!event.rsvpDeadline) return true;
    return new Date() < new Date(event.rsvpDeadline);
  };

  const isEventUpcoming = (event: Event) => {
    const eventStart = new Date(event.startDateTime);
    return eventStart > new Date();
  };

  const isEventInProgress = (event: Event) => {
    const now = new Date();
    const eventStart = new Date(event.startDateTime);
    const eventEnd = event.endDateTime ? new Date(event.endDateTime) : new Date(eventStart.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
    return now >= eventStart && now <= eventEnd;
  };

  const isEventCompleted = (event: Event) => {
    const eventEnd = event.endDateTime ? new Date(event.endDateTime) : new Date(new Date(event.startDateTime).getTime() + 2 * 60 * 60 * 1000);
    return new Date() > eventEnd;
  };

  const getEventStatus = (event: Event) => {
    if (isEventCompleted(event)) {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
    } else if (isEventInProgress(event)) {
      return { label: 'In Progress', color: 'bg-green-100 text-green-800' };
    } else if (isEventUpcoming(event)) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    }
    return { label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' };
  };

  const handleViewEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
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
        <Calendar className="h-6 w-6 text-orange-600" />
        <h2 className="text-xl font-semibold">Events</h2>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
          <p className="text-gray-600">Check back later for upcoming events!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              {/* Event Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer line-clamp-2"
                        onClick={() => handleViewEventDetails(event)}
                      >
                        {event.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatus(event).color}`}>
                        {getEventStatus(event).label}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">{event.description}</p>
                    
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}{event.endTime && ` - ${event.endTime}`}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                        {event.isVirtual && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Virtual</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span 
                          className="hover:text-blue-600 cursor-pointer"
                          onClick={() => setSelectedProfileUserId(event.organizer)}
                        >
                          Organized by {event.organizerName}
                        </span>
                        {event.organizerDesignation && (
                          <span className="text-gray-500">• {event.organizerDesignation}</span>
                        )}
                      </div>

                      {event.organizerCompany && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>{event.organizerCompany}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees.length}/{event.maxAttendees || 'Unlimited'} attendees</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {event.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {event.tags.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              +{event.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Event Cost */}
                    {event.eventCost && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-green-600">Cost: {event.eventCost}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleViewEventDetails(event)}
                    className="flex-1 border border-orange-600 text-orange-600 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  
                  {isAttendanceOpen(event) && isEventUpcoming(event) && (
                    <button
                      onClick={() => handleAttendance(event.id)}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                        event.attendees.includes(user?.id || '')
                          ? 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-600'
                          : 'bg-orange-600 text-white hover:bg-orange-700 border-2 border-orange-600'
                      }`}
                    >
                      {event.attendees.includes(user?.id || '') ? (
                        <span className="flex items-center justify-center space-x-1">
                          <Check className="h-4 w-4" />
                          <span>Attending</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Join Event</span>
                        </span>
                      )}
                    </button>
                  )}
                  
                  {(isEventCompleted(event) || !isEventUpcoming(event)) && !isAttendanceOpen(event) && (
                    <div className="flex-1 text-center py-2 px-4 bg-gray-100 rounded-lg text-gray-600 text-sm">
                      {isEventCompleted(event) ? 'Event Completed' : 'Registration Closed'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(selectedEvent.type)}`}>
                      {selectedEvent.type}
                    </span>
                    {selectedEvent.eventCategory && (
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {selectedEvent.eventCategory}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Event Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedEvent.description}</p>
                  </div>

                  {/* Special Requirements */}
                  {selectedEvent.specialRequirements && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Special Requirements</h3>
                      <p className="text-gray-700">{selectedEvent.specialRequirements}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Event Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Event Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span>{selectedEvent.date}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span>{selectedEvent.time}{selectedEvent.endTime && ` - ${selectedEvent.endTime}`}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span>{selectedEvent.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span>{selectedEvent.attendees.length}/{selectedEvent.maxAttendees || 'Unlimited'}</span>
                      </div>

                      {selectedEvent.eventCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-medium text-green-600">{selectedEvent.eventCost}</span>
                        </div>
                      )}

                      {selectedEvent.rsvpDeadline && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">RSVP Deadline:</span>
                          <span className="font-medium">{new Date(selectedEvent.rsvpDeadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Organizer Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Event Organizer</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{selectedEvent.organizerName}</span>
                      </div>
                      
                      {selectedEvent.organizerDesignation && (
                        <div className="text-gray-600">
                          {selectedEvent.organizerDesignation}
                        </div>
                      )}
                      
                      {selectedEvent.organizerCompany && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-600" />
                          <span>{selectedEvent.organizerCompany}</span>
                        </div>
                      )}
                      
                      {selectedEvent.organizerEmail && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-600" />
                          <a 
                            href={`mailto:${selectedEvent.organizerEmail}`} 
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {selectedEvent.organizerEmail}
                          </a>
                        </div>
                      )}
                      
                      {selectedEvent.contactPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-600" />
                          <span>{selectedEvent.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Virtual Event Link */}
                  {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Virtual Event</h3>
                      <a
                        href={selectedEvent.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Join Meeting</span>
                      </a>
                    </div>
                  )}

                  {/* Website Link */}
                  {selectedEvent.eventWebsite && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Event Website</h3>
                      <a
                        href={selectedEvent.eventWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Visit Website</span>
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {isAttendanceOpen(selectedEvent) && isEventUpcoming(selectedEvent) && (
                      <button
                        onClick={() => {
                          handleAttendance(selectedEvent.id);
                          setShowEventDetails(false);
                        }}
                        className={`w-full py-3 px-4 rounded-lg transition-colors font-medium ${
                          selectedEvent.attendees.includes(user?.id || '')
                            ? 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-600'
                            : 'bg-orange-600 text-white hover:bg-orange-700 border-2 border-orange-600'
                        }`}
                      >
                        {selectedEvent.attendees.includes(user?.id || '') ? (
                          <span className="flex items-center justify-center space-x-2">
                            <Check className="h-5 w-5" />
                            <span>You're Attending - Click to Cancel</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Join This Event</span>
                          </span>
                        )}
                      </button>
                    )}
                    
                    {(isEventCompleted(selectedEvent) || !isEventUpcoming(selectedEvent)) && (
                      <div className="w-full text-center py-3 px-4 bg-gray-100 rounded-lg text-gray-600">
                        {isEventCompleted(selectedEvent) ? 'Event Completed' : isEventInProgress(selectedEvent) ? 'Event In Progress' : 'Registration Closed'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfileUserId && (
        <UserProfileModal
          userId={selectedProfileUserId}
          onClose={() => setSelectedProfileUserId(null)}
        />
      )}
    </div>
  );
};

export default EventsViewEnhanced;
