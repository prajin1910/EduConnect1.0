import { Activity, Brain, Download, Eye, FileText, Search, Star, User } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { assessmentAPI, managementAPI, resumeManagementAPI } from '../../services/api';
import ActivityHeatmap from './ActivityHeatmap';
import StudentAttendanceDetails from './StudentAttendanceDetails';

interface Student {
  id: string;
  name: string;
  email: string;
  className: string;
  department: string;
}

interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  isActive: boolean;
  atsAnalysis?: {
    overallScore: number;
    detailedSummary?: string;
    analyzedAt: string;
  };
}

const StudentHeatmap: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [studentResumes, setStudentResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const loadStudentResumes = async (studentEmail: string) => {
    setLoadingResumes(true);
    try {
      const allResumes = await resumeManagementAPI.getAllStudentResumes();
      const studentResumes = allResumes.filter((resume: Resume) => resume.userId === studentEmail);
      setStudentResumes(studentResumes);
    } catch (error: any) {
      console.error('Error loading student resumes:', error);
      showToast('Failed to load student resumes', 'error');
      setStudentResumes([]);
    } finally {
      setLoadingResumes(false);
    }
  };

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchEmail('');
    loadStudentResumes(student.email);
    console.log('StudentHeatmap: Selected student:', student.name, 'ID:', student.id);
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getATSScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const viewResumeDetails = (resume: Resume) => {
    setSelectedResume(resume);
    setShowResumeModal(true);
  };

  const downloadResume = async (_resume: Resume) => {
    try {
      // This would need to be implemented in the API
      showToast('Download functionality coming soon', 'info');
    } catch (error: any) {
      showToast('Failed to download resume', 'error');
    }
  };

  const searchStudents = async () => {
    if (!searchEmail.trim()) {
      showToast('Please enter a student email', 'warning');
      return;
    }

    setSearchLoading(true);
    try {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchStudents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Activity className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold">Student Activity & Attendance Analysis</h2>
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

      {/* Selected Student Analysis */}
      {selectedStudent ? (
        <div className="space-y-6">
          {/* Student Info Header */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
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
          </div>

          {/* Activity Heatmap */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>
            <ActivityHeatmap 
              userId={selectedStudent.id} 
              userName={selectedStudent.name}
              showTitle={false}
            />
          </div>

          {/* Attendance Details */}
          <StudentAttendanceDetails studentId={selectedStudent.id} />
          
          {/* Resume Analysis Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Resume Analysis</span>
              </h3>
              {loadingResumes && (
                <div className="text-sm text-gray-500">Loading resumes...</div>
              )}
            </div>
            
            {studentResumes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Resumes Found</h4>
                <p className="text-gray-600">This student hasn't uploaded any resumes yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentResumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`border rounded-lg p-4 transition-all ${
                      resume.isActive 
                        ? 'border-green-200 bg-green-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-purple-600" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{resume.fileName}</p>
                            {resume.isActive && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</span>
                            <span>{Math.round(resume.fileSize / 1024)} KB</span>
                            <span>{resume.fileType.split('/')[1].toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {resume.atsAnalysis && (
                          <div className="flex items-center space-x-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getATSScoreBg(resume.atsAnalysis.overallScore)} ${getATSScoreColor(resume.atsAnalysis.overallScore)}`}>
                              ATS: {resume.atsAnalysis.overallScore}%
                            </span>
                          </div>
                        )}
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => viewResumeDetails(resume)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Resume Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadResume(resume)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Download Resume"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
          <p className="text-gray-600">
            Search for a student to view their activity heatmap and attendance details.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>The analysis includes:</p>
            <div className="mt-2 grid grid-cols-2 gap-2 max-w-md mx-auto">
              <div className="flex items-center space-x-1">
                <span>📊</span>
                <span>Activity Heatmap</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📅</span>
                <span>Attendance Records</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📈</span>
                <span>Attendance Percentage</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📝</span>
                <span>Resume Analysis</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Resume Details Modal */}
      {showResumeModal && selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold">Resume Details</h3>
                  <p className="text-sm text-gray-600">{selectedResume.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowResumeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Resume Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Resume Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">File Name:</span>
                    <p className="text-gray-600">{selectedResume.fileName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Upload Date:</span>
                    <p className="text-gray-600">{new Date(selectedResume.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">File Size:</span>
                    <p className="text-gray-600">{Math.round(selectedResume.fileSize / 1024)} KB</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className="text-gray-600">
                      {selectedResume.isActive ? (
                        <span className="text-green-600 font-medium">Active Resume</span>
                      ) : (
                        <span className="text-gray-500">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* ATS Analysis Results */}
              {selectedResume.atsAnalysis ? (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span>ATS Analysis Results</span>
                  </h4>
                  
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className={`text-4xl font-bold mb-2 ${getATSScoreColor(selectedResume.atsAnalysis.overallScore)}`}>
                      {selectedResume.atsAnalysis.overallScore}%
                    </div>
                    <p className="text-gray-600">Overall ATS Score</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Analyzed on {new Date(selectedResume.atsAnalysis.analyzedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Detailed Summary */}
                  {selectedResume.atsAnalysis.detailedSummary && (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-4">AI Analysis Summary</h4>
                      <div className="text-gray-700 leading-relaxed space-y-3">
                        {selectedResume.atsAnalysis.detailedSummary.split('\n').map((paragraph, index) => (
                          paragraph.trim() && (
                            <p key={index} className="text-sm">
                              {paragraph.trim()}
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No ATS Analysis Available</h4>
                  <p className="text-gray-600">This resume hasn't been analyzed yet.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-center">
              <button
                onClick={() => setShowResumeModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHeatmap;