import {
  Building,
  Calendar,
  Check,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { eventsAPI } from "../../services/api";
import UserProfileModal from "./UserProfileModal";

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
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<
    string | null
  >(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log("EventsViewEnhanced: Loading approved events...");
      const response = await eventsAPI.getApprovedEvents();
      console.log("EventsViewEnhanced: Events loaded:", response.length);

      // Transform the data to match our interface
      const eventsData = Array.isArray(response) ? response : [];
      const transformedEvents = eventsData.map((event: any) => ({
        id: event.id,
        title: event.title || "Untitled Event",
        description: event.description || "No description available",
        startDateTime:
          event.startDateTime || event.eventDate || new Date().toISOString(),
        endDateTime: event.endDateTime || event.eventEndDate,
        date: event.startDateTime
          ? new Date(event.startDateTime).toLocaleDateString()
          : "Not specified",
        time: event.startDateTime
          ? new Date(event.startDateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Not specified",
        endTime: event.endDateTime
          ? new Date(event.endDateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
        location: event.location || event.venue || "Location not specified",
        type: event.type || event.eventType || "General",
        organizer: event.organizer || event.organizerId,
        organizerName:
          event.organizerName || event.alumniName || "Unknown Organizer",
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
        eventWebsite: event.eventWebsite,
      }));

      setEvents(transformedEvents);
      console.log("EventsViewEnhanced: Events transformed successfully");
    } catch (error: any) {
      console.error("Error loading events:", error);
      // Don't show error toast if it's just no events available
      if (
        error.response?.status !== 404 &&
        !error.message?.includes("Failed to load events")
      ) {
        showToast("Failed to load events. Please try again.", "error");
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

      const isAttending = event.attendees.includes(user?.id || "");

      await eventsAPI.updateAttendance(eventId, !isAttending);
      await loadEvents();

      showToast(
        isAttending
          ? "Attendance cancelled successfully!"
          : "Attendance confirmed successfully!",
        "success"
      );
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      showToast("Failed to update attendance", "error");
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "workshop":
        return "bg-blue-100 text-blue-800";
      case "seminar":
        return "bg-green-100 text-green-800";
      case "networking":
        return "bg-purple-100 text-purple-800";
      case "career":
        return "bg-orange-100 text-orange-800";
      case "social":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    const eventEnd = event.endDateTime
      ? new Date(event.endDateTime)
      : new Date(eventStart.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
    return now >= eventStart && now <= eventEnd;
  };

  const isEventCompleted = (event: Event) => {
    const eventEnd = event.endDateTime
      ? new Date(event.endDateTime)
      : new Date(new Date(event.startDateTime).getTime() + 2 * 60 * 60 * 1000);
    return new Date() > eventEnd;
  };

  const getEventStatus = (event: Event) => {
    if (isEventCompleted(event)) {
      return { label: "Completed", color: "bg-gray-100 text-gray-800" };
    } else if (isEventInProgress(event)) {
      return { label: "In Progress", color: "bg-green-100 text-green-800" };
    } else if (isEventUpcoming(event)) {
      return { label: "Upcoming", color: "bg-blue-100 text-blue-800" };
    }
    return { label: "Scheduled", color: "bg-yellow-100 text-yellow-800" };
  };

  const handleViewEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Events</h2>
              <p className="text-purple-600 font-medium">
                Loading upcoming events...
              </p>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0"></div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4 font-medium">
            Loading events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Events</h2>
              <p className="text-purple-600 font-medium">
                Discover and join upcoming events
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {events.length}
            </div>
            <div className="text-sm text-gray-600">Available Events</div>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-12 w-12 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-600 mb-3">
            No Events Available
          </h3>
          <p className="text-gray-500 text-lg">
            No events are currently scheduled. Check back later for updates!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Enhanced Event Header */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3
                        className="text-xl font-bold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors duration-300"
                        onClick={() => handleViewEventDetails(event)}
                      >
                        {event.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <span
                        className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                          event.type.toLowerCase() === "workshop"
                            ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                            : event.type.toLowerCase() === "seminar"
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                            : event.type.toLowerCase() === "networking"
                            ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                            : event.type.toLowerCase() === "career"
                            ? "bg-gradient-to-r from-orange-400 to-red-500 text-white"
                            : event.type.toLowerCase() === "social"
                            ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                        }`}
                      >
                        {event.type}
                      </span>

                      <span
                        className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                          isEventCompleted(event)
                            ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                            : isEventInProgress(event)
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                            : isEventUpcoming(event)
                            ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                            : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                        }`}
                      >
                        {getEventStatus(event).label}
                      </span>
                    </div>

                    <p className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-3">
                      {event.description}
                    </p>

                    <div className="grid grid-cols-1 gap-4 text-base">
                      <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-2xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {event.date}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-2xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {event.time}
                          {event.endTime && ` - ${event.endTime}`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-2xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">
                            {event.location}
                          </span>
                          {event.isVirtual && (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-2xl text-sm font-bold shadow-lg">
                              Virtual
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 bg-orange-50 p-3 rounded-2xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span
                          className="font-semibold text-gray-800 hover:text-purple-600 cursor-pointer transition-colors duration-300"
                          onClick={() =>
                            setSelectedProfileUserId(event.organizer)
                          }
                        >
                          {event.organizerName}
                        </span>
                        {event.organizerDesignation && (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-xl text-sm font-semibold">
                            {event.organizerDesignation}
                          </span>
                        )}
                      </div>

                      {event.organizerCompany && (
                        <div className="flex items-center space-x-3 bg-indigo-50 p-3 rounded-2xl">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center">
                            <Building className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-800">
                            {event.organizerCompany}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 bg-yellow-50 p-3 rounded-2xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {event.attendees.length}/
                          {event.maxAttendees || "Unlimited"} attendees
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="mt-6">
                        <div className="flex flex-wrap gap-2">
                          {event.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-3 py-2 rounded-2xl text-sm font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                          {event.tags.length > 3 && (
                            <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 py-2 rounded-2xl text-sm font-semibold">
                              +{event.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Event Cost */}
                    {event.eventCost && (
                      <div className="mt-4 bg-green-50 p-4 rounded-2xl border border-green-200">
                        <span className="text-lg font-bold text-green-700">
                          Cost: {event.eventCost}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleViewEventDetails(event)}
                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>View Details</span>
                  </button>

                  {isAttendanceOpen(event) && isEventUpcoming(event) && (
                    <button
                      onClick={() => handleAttendance(event.id)}
                      className={`flex-1 py-4 px-6 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                        event.attendees.includes(user?.id || "")
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                          : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                      }`}
                    >
                      {event.attendees.includes(user?.id || "") ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span>Attending</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-5 w-5" />
                          <span>Join Event</span>
                        </>
                      )}
                    </button>
                  )}

                  {(isEventCompleted(event) || !isEventUpcoming(event)) &&
                    !isAttendanceOpen(event) && (
                      <div className="flex-1 text-center py-4 px-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl text-gray-600 font-semibold shadow-lg">
                        {isEventCompleted(event)
                          ? "Event Completed"
                          : "Registration Closed"}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedEvent.title}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                        selectedEvent.type.toLowerCase() === "workshop"
                          ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                          : selectedEvent.type.toLowerCase() === "seminar"
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                          : selectedEvent.type.toLowerCase() === "networking"
                          ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                          : selectedEvent.type.toLowerCase() === "career"
                          ? "bg-gradient-to-r from-orange-400 to-red-500 text-white"
                          : selectedEvent.type.toLowerCase() === "social"
                          ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white"
                          : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                      }`}
                    >
                      {selectedEvent.type}
                    </span>
                    {selectedEvent.eventCategory && (
                      <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-4 py-2 rounded-2xl text-sm font-bold">
                        {selectedEvent.eventCategory}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-2xl transition-all duration-300"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Enhanced Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Event Description */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        About This Event
                      </h3>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* Special Requirements */}
                  {selectedEvent.specialRequirements && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Special Requirements
                        </h3>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {selectedEvent.specialRequirements}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Globe className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Tags
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {selectedEvent.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-4 py-2 rounded-2xl text-sm font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Sidebar */}
                <div className="space-y-6">
                  {/* Event Details */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                      Event Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {selectedEvent.date}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {selectedEvent.time}
                          {selectedEvent.endTime &&
                            ` - ${selectedEvent.endTime}`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {selectedEvent.location}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {selectedEvent.attendees.length}/
                          {selectedEvent.maxAttendees || "Unlimited"}
                        </span>
                      </div>

                      {selectedEvent.eventCost && (
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">
                              Cost:
                            </span>
                            <span className="font-bold text-green-700 text-lg">
                              {selectedEvent.eventCost}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedEvent.rsvpDeadline && (
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">
                              RSVP Deadline:
                            </span>
                            <span className="font-bold text-orange-700">
                              {new Date(
                                selectedEvent.rsvpDeadline
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Organizer Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                      Event Organizer
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-800">
                          {selectedEvent.organizerName}
                        </span>
                      </div>

                      {selectedEvent.organizerDesignation && (
                        <div className="bg-blue-100 p-3 rounded-2xl">
                          <span className="text-blue-800 font-semibold">
                            {selectedEvent.organizerDesignation}
                          </span>
                        </div>
                      )}

                      {selectedEvent.organizerCompany && (
                        <div className="bg-indigo-100 p-3 rounded-2xl">
                          <span className="text-indigo-800 font-semibold">
                            {selectedEvent.organizerCompany}
                          </span>
                        </div>
                      )}

                      {selectedEvent.organizerEmail && (
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl shadow-sm">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <a
                            href={`mailto:${selectedEvent.organizerEmail}`}
                            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {selectedEvent.organizerEmail}
                          </a>
                        </div>
                      )}

                      {selectedEvent.contactPhone && (
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl shadow-sm">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                            <Phone className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-800">
                            {selectedEvent.contactPhone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Virtual Event Link */}
                  {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Virtual Meeting
                      </h3>
                      <a
                        href={selectedEvent.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl inline-flex items-center space-x-3"
                      >
                        <Globe className="h-5 w-5" />
                        <span>Join Meeting</span>
                      </a>
                    </div>
                  )}

                  {/* Enhanced Website Link */}
                  {selectedEvent.eventWebsite && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Event Website
                      </h3>
                      <a
                        href={selectedEvent.eventWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl inline-flex items-center space-x-3"
                      >
                        <Globe className="h-5 w-5" />
                        <span>Visit Website</span>
                      </a>
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="space-y-4">
                    {isAttendanceOpen(selectedEvent) &&
                      isEventUpcoming(selectedEvent) && (
                        <button
                          onClick={() => {
                            handleAttendance(selectedEvent.id);
                            setShowEventDetails(false);
                          }}
                          className={`w-full py-4 px-6 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 ${
                            selectedEvent.attendees.includes(user?.id || "")
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                              : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                          }`}
                        >
                          {selectedEvent.attendees.includes(user?.id || "") ? (
                            <>
                              <Check className="h-6 w-6" />
                              <span>You're Attending - Click to Cancel</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-6 w-6" />
                              <span>Join This Event</span>
                            </>
                          )}
                        </button>
                      )}

                    {(isEventCompleted(selectedEvent) ||
                      !isEventUpcoming(selectedEvent)) && (
                      <div className="w-full text-center py-4 px-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl text-gray-600 font-bold shadow-lg">
                        {isEventCompleted(selectedEvent)
                          ? "Event Completed"
                          : isEventInProgress(selectedEvent)
                          ? "Event In Progress"
                          : "Registration Closed"}
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
