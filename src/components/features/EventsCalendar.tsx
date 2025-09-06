import { Calendar, Check, Clock, Edit, MapPin, Plus, Trash2, User, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { eventsAPI } from '../../services/api';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'networking' | 'workshop' | 'seminar' | 'social' | 'career';
  organizer: string;
  organizerName: string;
  maxAttendees?: number;
  attendees: string[];
  rsvpDeadline?: string;
  isVirtual: boolean;
  meetingLink?: string;
}

const EventsCalendar: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'networking' as Event['type'],
    maxAttendees: '',
    rsvpDeadline: '',
    isVirtual: false,
    meetingLink: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getApprovedEvents();
      console.log('Events calendar response:', response);
      
      // Transform the data to match our interface
      const eventsData = Array.isArray(response) ? response : [];
      const transformedEvents = eventsData.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.startDateTime ? event.startDateTime.split('T')[0] : new Date().toISOString().split('T')[0],
        time: event.startDateTime ? event.startDateTime.split('T')[1]?.substring(0, 5) || '09:00' : '09:00',
        location: event.location || 'Location TBD',
        type: event.targetAudience || 'general',
        organizer: event.organizerId,
        organizerName: event.organizerName || 'Alumni',
        maxAttendees: event.maxAttendees || 50,
        attendees: event.attendees || [],
        rsvpDeadline: event.startDateTime ? event.startDateTime.split('T')[0] : new Date().toISOString().split('T')[0],
        isVirtual: event.location?.toLowerCase().includes('virtual') || false,
        meetingLink: event.specialRequirements?.includes('http') ? event.specialRequirements : undefined
      }));
      
      setEvents(transformedEvents);
    } catch (error: any) {
      console.error('Error loading events:', error);
      showToast(error.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        organizer: user?.id || '',
        organizerName: user?.name || '',
        attendees: []
      };

      setEvents([newEvent, ...events]);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'networking',
        maxAttendees: '',
        rsvpDeadline: '',
        isVirtual: false,
        meetingLink: ''
      });
      setShowCreateForm(false);
      showToast('Event created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create event', 'error');
    }
  };

  const handleRSVP = (eventId: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const isAttending = event.attendees.includes(user?.id || '');
        const updatedAttendees = isAttending
          ? event.attendees.filter(id => id !== user?.id)
          : [...event.attendees, user?.id || ''];
        
        return { ...event, attendees: updatedAttendees };
      }
      return event;
    }));
    
    showToast('RSVP updated successfully!', 'success');
  };

  const canEditEvent = (event: Event) => {
    return user?.id === event.organizer || user?.role === 'MANAGEMENT';
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'networking': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'seminar': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'career': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isEventPast = (date: string, time: string) => {
    const eventDateTime = new Date(`${date}T${time}`);
    return eventDateTime < new Date();
  };

  const isRSVPOpen = (event: Event) => {
    if (event.rsvpDeadline) {
      return new Date(event.rsvpDeadline) > new Date();
    }
    return !isEventPast(event.date, event.time);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold">Events Calendar</h2>
        </div>
        {(user?.role === 'ALUMNI' || user?.role === 'MANAGEMENT') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Alumni Networking Night"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="networking">Networking</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="social">Social</option>
                  <option value="career">Career</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees (Optional)</label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVirtual"
                checked={formData.isVirtual}
                onChange={(e) => setFormData(prev => ({ ...prev, isVirtual: e.target.checked }))}
                className="text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="isVirtual" className="text-sm font-medium text-gray-700">Virtual Event</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.isVirtual ? 'Meeting Link' : 'Location'}
              </label>
              <input
                type={formData.isVirtual ? 'url' : 'text'}
                required
                value={formData.isVirtual ? formData.meetingLink : formData.location}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [formData.isVirtual ? 'meetingLink' : 'location']: e.target.value 
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder={formData.isVirtual ? 'https://meet.google.com/...' : 'Event venue address'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the event, agenda, and what attendees can expect..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Deadline (Optional)</label>
              <input
                type="date"
                value={formData.rsvpDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, rsvpDeadline: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Event
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Scheduled</h3>
          <p className="text-gray-600">Be the first to create an event for the community!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((event) => {
              const isPast = isEventPast(event.date, event.time);
              const canRSVP = isRSVPOpen(event);
              const isAttending = event.attendees.includes(user?.id || '');
              const isFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;
              
              return (
                <div key={event.id} className={`bg-white rounded-xl shadow-sm border p-6 ${isPast ? 'opacity-75' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                        {isPast && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Past Event
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.isVirtual ? 'Virtual Event' : event.location}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{event.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Organized by {event.organizerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {event.attendees.length} attending
                            {event.maxAttendees && ` / ${event.maxAttendees} max`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {canEditEvent(event) && (
                      <div className="flex space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {event.rsvpDeadline && (
                        <span>RSVP by {new Date(event.rsvpDeadline).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      {event.isVirtual && event.meetingLink && isAttending && (
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Join Meeting
                        </a>
                      )}
                      
                      {!isPast && canRSVP && !isFull && (
                        <button
                          onClick={() => handleRSVP(event.id)}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2 ${
                            isAttending
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-orange-600 text-white hover:bg-orange-700'
                          }`}
                        >
                          {isAttending ? (
                            <>
                              <X className="h-4 w-4" />
                              <span>Cancel RSVP</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              <span>RSVP</span>
                            </>
                          )}
                        </button>
                      )}
                      
                      {isFull && !isAttending && (
                        <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                          Event Full
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;