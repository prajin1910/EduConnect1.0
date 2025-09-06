import { Activity, Search, User } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { assessmentAPI, managementAPI } from '../../services/api';
import ActivityHeatmap from './ActivityHeatmap';

interface Student {
  id: string;
  name: string;
  email: string;
  className: string;
  department: string;
}

const StudentHeatmapEnhanced: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchStudents = async () => {
    if (!searchEmail.trim()) {
      showToast('Please enter a student email', 'warning');
      return;
    }

    setSearchLoading(true);
    try {
      // Use the management API search for management users, assessment API for professors
      let response;
      if (user?.role === 'MANAGEMENT') {
        response = await managementAPI.searchStudents(searchEmail);
      } else {
        response = await assessmentAPI.searchStudents(searchEmail);
      }
      
      setSearchResults(Array.isArray(response) ? response : []);
      
      if (response.length === 0) {
        showToast('No students found with that email', 'info');
      }
    } catch (error: any) {
      console.error('Error searching students:', error);
      showToast('Failed to search students', 'error');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchEmail('');
    console.log('StudentHeatmapEnhanced: Selected student:', student.name, 'ID:', student.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchStudents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Activity className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold">Student Activity Analysis</h2>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-4">Search Student</h3>
        <div className="flex space-x-3">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter student email (e.g., 23cs1554@stjosephstechnology.ac.in)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={searchStudents}
            disabled={searchLoading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>{searchLoading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-gray-900">Search Results</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((student) => (
                <button
                  key={student.id}
                  onClick={() => selectStudent(student)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                      <div className="text-xs text-gray-500">
                        {student.className} • {student.department}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Student Heatmap */}
      {selectedStudent ? (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h3>
                <p className="text-gray-600">{selectedStudent.email}</p>
                <p className="text-sm text-gray-500">
                  {selectedStudent.className} • {selectedStudent.department}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedStudent(null)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              ✕
            </button>
          </div>

          <ActivityHeatmap 
            userId={selectedStudent.id} 
            userName={selectedStudent.name}
            showTitle={false}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
          <p className="text-gray-600">
            Search for a student to view their activity heatmap and engagement patterns.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>The heatmap shows daily activity including:</p>
            <div className="mt-2 grid grid-cols-2 gap-2 max-w-md mx-auto">
              <div className="flex items-center space-x-1">
                <span>📝</span>
                <span>AI & Class Assessments</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💬</span>
                <span>Chat Activities</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>✅</span>
                <span>Task Management</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📅</span>
                <span>Event Participation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHeatmapEnhanced;