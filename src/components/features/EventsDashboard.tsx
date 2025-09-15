import { Calendar, Clock, MapPin, User, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { eventsAPI } from "../../services/api";

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
  attendees: string[];
  isVirtual: boolean;
  meetingLink?: string;
}

const EventsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getApprovedEvents();

      // Transform and limit to next 3 upcoming events
      const eventsData = Array.isArray(response) ? response : [];
      const transformedEvents = eventsData
        .map((event: any) => ({
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
          attendees: event.attendees || [],
          isVirtual: event.isVirtual || false,
          meetingLink: event.meetingLink || event.eventLink,
        }))
        .filter((event: Event) => new Date(event.startDateTime) > new Date()) // Only upcoming events
        .sort(
          (a: Event, b: Event) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime()
        ) // Sort by date
        .slice(0, 3); // Limit to 3 events

      setEvents(transformedEvents);
    } catch (error: any) {
      console.error("Error loading events:", error);
      if (error.response?.status !== 404) {
        showToast("Failed to load events", "error");
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
        return "bg-blue-500 text-white";
      case "seminar":
        return "bg-green-500 text-white";
      case "networking":
        return "bg-purple-500 text-white";
      case "career":
        return "bg-orange-500 text-white";
      case "social":
        return "bg-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-1/3 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-800 mb-2">
          No Upcoming Events
        </h4>
        <p className="text-gray-500 mb-6">
          No events are currently scheduled. Check back later for updates!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-purple-300"
        >
          <div className="flex items-start space-x-4">
            {/* Event Icon */}
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="h-6 w-6 text-white" />
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                  {event.title}
                </h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getEventTypeColor(
                    event.type
                  )}`}
                >
                  {event.type}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {event.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-3 w-3 text-purple-500" />
                  <span>
                    {event.time}
                    {event.endTime && ` - ${event.endTime}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-3 w-3 text-green-500" />
                  <span className="truncate">{event.location}</span>
                  {event.isVirtual && (
                    <span className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">
                      Virtual
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-3 w-3 text-orange-500" />
                  <span className="truncate">{event.organizerName}</span>
                </div>
              </div>

              {/* Attendance Info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Users className="h-3 w-3" />
                  <span>{event.attendees.length} attending</span>
                </div>

                <button
                  onClick={() => handleAttendance(event.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    event.attendees.includes(user?.id || "")
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                >
                  {event.attendees.includes(user?.id || "")
                    ? "Attending"
                    : "Join Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsDashboard;
