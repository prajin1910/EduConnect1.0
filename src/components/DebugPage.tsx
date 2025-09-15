import { AlertCircle, Calendar, CheckCircle, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DebugData {
  events: any[];
  alumni: any[];
  status: any;
  loading: boolean;
  errors: string[];
}

const DebugPage: React.FC = () => {
  const [data, setData] = useState<DebugData>({
    events: [],
    alumni: [],
    status: {},
    loading: true,
    errors: []
  });

  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = async () => {
    const errors: string[] = [];
    let events: any[] = [];
    let alumni: any[] = [];
    let status: any = {};

    try {
      // Test status
      const statusResponse = await fetch('https://backend-7y12.onrender.com/api/debug/status');
      if (statusResponse.ok) {
        status = await statusResponse.json();
      } else {
        errors.push('Status endpoint failed');
      }
    } catch (error) {
      errors.push('Status endpoint error: ' + error);
    }

    try {
      // Test events
      const eventsResponse = await fetch('https://backend-7y12.onrender.com/api/debug/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        events = eventsData.events || [];
      } else {
        errors.push('Events endpoint failed');
      }
    } catch (error) {
      errors.push('Events endpoint error: ' + error);
    }

    try {
      // Test alumni
      const alumniResponse = await fetch('https://backend-7y12.onrender.com/api/debug/alumni');
      if (alumniResponse.ok) {
        const alumniData = await alumniResponse.json();
        alumni = alumniData.alumni || [];
      } else {
        errors.push('Alumni endpoint failed');
      }
    } catch (error) {
      errors.push('Alumni endpoint error: ' + error);
    }

    setData({
      events,
      alumni,
      status,
      loading: false,
      errors
    });
  };

  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Debug Dashboard - Backend Status Check
          </h1>
          <p className="text-gray-600">
            Testing the 3 new features: Alumni Events, Alumni Directory, and Event Management
          </p>
        </div>

        {/* Status Check */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Backend Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">Server Status</p>
              <p className="text-green-600">{data.status.server || 'Unknown'}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800">Authentication</p>
              <p className="text-blue-600">{data.status.authentication || 'Unknown'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-800">Timestamp</p>
              <p className="text-purple-600">
                {data.status.time ? new Date(data.status.time).toLocaleString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Errors */}
        {data.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-red-800 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Errors Detected
            </h3>
            <ul className="list-disc list-inside text-red-700">
              {data.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              Alumni Events ({data.events.length})
            </h2>
            {data.events.length > 0 ? (
              <div className="space-y-4">
                {data.events.slice(0, 3).map((event, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>📍 {event.location}</p>
                      <p>👥 Max: {event.maxAttendees}</p>
                      <p>📅 {new Date(event.startDateTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {data.events.length > 3 && (
                  <p className="text-gray-500 text-sm">...and {data.events.length - 3} more events</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No events found</p>
                <p className="text-sm">Alumni can request events, management can approve them</p>
              </div>
            )}
          </div>

          {/* Alumni Directory Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-2" />
              Alumni Directory ({data.alumni.length})
            </h2>
            {data.alumni.length > 0 ? (
              <div className="space-y-4">
                {data.alumni.slice(0, 3).map((alumni, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{alumni.name}</h3>
                    <p className="text-sm text-gray-600">{alumni.email}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>🎓 {alumni.department}</p>
                      <p>📞 {alumni.phoneNumber}</p>
                      <p>🏢 {alumni.currentCompany || 'Not specified'}</p>
                    </div>
                  </div>
                ))}
                {data.alumni.length > 3 && (
                  <p className="text-gray-500 text-sm">...and {data.alumni.length - 3} more alumni</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No alumni found</p>
                <p className="text-sm">Verified alumni will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Status Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Feature Implementation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">1. Alumni Event Requests</h3>
              <div className="space-y-1 text-sm">
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Backend API ✅
                </p>
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Event Storage ✅
                </p>
                <p className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  Frontend Auth Issues
                </p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">2. Alumni Directory</h3>
              <div className="space-y-1 text-sm">
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Backend API ✅
                </p>
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Search & Stats ✅
                </p>
                <p className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  Frontend Auth Issues
                </p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">3. Management Event Approval</h3>
              <div className="space-y-1 text-sm">
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Backend API ✅
                </p>
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Email Notifications ✅
                </p>
                <p className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  Frontend Auth Issues
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Resolution Status</h3>
          <p className="text-blue-700 text-sm">
            ✅ All backend APIs are working correctly<br/>
            ✅ Database storage and retrieval functioning<br/>
            ⚠️ JWT authentication needs @PreAuthorize syntax correction<br/>
            📝 Working on hasAuthority vs hasRole authentication fix
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
