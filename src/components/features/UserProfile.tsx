import {
    Award,
    BookOpen,
    Briefcase,
    Calendar,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Star,
    TrendingUp,
    User,
    UserPlus,
    Users,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { alumniAPI, professorAPI, studentAPI } from '../../services/api';
import ActivityHeatmap from './ActivityHeatmap';
import ConnectionManager from './ConnectionManager';

interface UserProfileProps {
  userId: string;
  userType: 'STUDENT' | 'PROFESSOR' | 'ALUMNI';
  onClose: () => void;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  
  // Student specific
  studentId?: string;
  course?: string;
  year?: string;
  cgpa?: number;
  semester?: string;
  department?: string;
  assessmentScores?: AssessmentScore[];
  overallPerformance?: string;
  
  // Professor specific
  employeeId?: string;
  designation?: string;
  experience?: number;
  subjectsTeaching?: string[];
  researchInterests?: string[];
  publications?: number;
  studentsSupervised?: number;
  
  // Alumni specific
  graduationYear?: number;
  currentCompany?: string;
  currentPosition?: string;
  workExperience?: number;
  achievements?: string[];
  mentorshipAvailable?: boolean;
  
  // Common fields
  bio?: string;
  skills?: string[];
  location?: string;
  joinDate?: string;
  lastActive?: string;
}

interface AssessmentScore {
  assessmentName: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
  grade: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, userType, onClose }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { showToast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, [userId, userType]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (userType) {
        case 'STUDENT':
          response = await studentAPI.getProfile(userId);
          break;
        case 'PROFESSOR':
          response = await professorAPI.getProfile(userId);
          break;
        case 'ALUMNI':
          response = await alumniAPI.getProfile(userId);
          break;
        default:
          throw new Error('Invalid user type');
      }
      
      console.log('User profile response:', response);
      const profileData = response.data || response;
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to load profile information';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      if (userType === 'ALUMNI') {
        console.log('Sending connection request to alumni:', userId);
        await alumniAPI.sendConnectionRequest(userId, 'I would like to connect with you.');
        showToast('Connection request sent successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to send connection request:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to send connection request';
      showToast(errorMessage, 'error');
    }
  };

  const handleMessage = async () => {
    try {
      // Implement messaging functionality
      showToast('Messaging feature coming soon!', 'info');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      showToast('Failed to start conversation', 'error');
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-red-600">Failed to load profile</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-blue-100">
                {userType === 'STUDENT' && `${profile.course || 'Student'} - Year ${profile.year || 'N/A'}`}
                {userType === 'PROFESSOR' && (profile.designation || 'Professor')}
                {userType === 'ALUMNI' && (
                  profile.currentPosition && profile.currentCompany 
                    ? `${profile.currentPosition} at ${profile.currentCompany}`
                    : profile.currentPosition || profile.currentCompany || 'Alumni'
                )}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center space-x-1 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {userType === 'ALUMNI' && (
                <ConnectionManager
                  targetUserId={userId}
                  targetUserName={profile.name}
                />
              )}
              <button
                onClick={handleMessage}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            {userType === 'STUDENT' && (
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'performance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Academic Performance
              </button>
            )}
            {userType === 'PROFESSOR' && (
              <button
                onClick={() => setActiveTab('research')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'research'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Research & Teaching
              </button>
            )}
            {userType === 'ALUMNI' && (
              <button
                onClick={() => setActiveTab('career')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'career'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Career & Achievements
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    {userType === 'STUDENT' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Student ID:</span>
                          <span className="font-medium">{profile.studentId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{profile.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Semester:</span>
                          <span className="font-medium">{profile.semester}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">CGPA:</span>
                          <span className={`font-medium ${getPerformanceColor((profile.cgpa || 0) * 10)}`}>
                            {profile.cgpa}/10.0
                          </span>
                        </div>
                      </>
                    )}
                    {userType === 'PROFESSOR' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employee ID:</span>
                          <span className="font-medium">{profile.employeeId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{profile.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{profile.experience} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Publications:</span>
                          <span className="font-medium">{profile.publications}</span>
                        </div>
                      </>
                    )}
                    {userType === 'ALUMNI' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Graduation Year:</span>
                          <span className="font-medium">{profile.graduationYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{profile.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{profile.workExperience} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mentorship:</span>
                          <span className={`font-medium ${profile.mentorshipAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                            {profile.mentorshipAvailable ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Joined {new Date(profile.joinDate || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}

              {/* Activity Heatmap for Students */}
              {userType === 'STUDENT' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Activity Overview</h3>
                  <ActivityHeatmap userId={userId} userName={profile.name} showTitle={false} />
                </div>
              )}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && userType === 'STUDENT' && (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Current CGPA</p>
                      <p className="text-2xl font-bold text-green-800">{profile.cgpa}/10.0</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Performance</p>
                      <p className="text-2xl font-bold text-blue-800">{profile.overallPerformance || 'Good'}</p>
                    </div>
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Assessments</p>
                      <p className="text-2xl font-bold text-purple-800">{profile.assessmentScores?.length || 0}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Assessment Scores */}
              {profile.assessmentScores && profile.assessmentScores.length > 0 && (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="font-semibold text-gray-900">Assessment History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assessment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profile.assessmentScores.map((assessment, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assessment.assessmentName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assessment.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <span className={getPerformanceColor(assessment.percentage)}>
                                  {assessment.score}/{assessment.maxScore}
                                </span>
                                <span className="ml-2 text-gray-500">({assessment.percentage}%)</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(assessment.grade)}`}>
                                {assessment.grade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(assessment.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'research' && userType === 'PROFESSOR' && (
            <div className="space-y-6">
              {/* Research Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Publications</p>
                      <p className="text-2xl font-bold text-blue-800">{profile.publications}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Students Supervised</p>
                      <p className="text-2xl font-bold text-green-800">{profile.studentsSupervised}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Experience</p>
                      <p className="text-2xl font-bold text-purple-800">{profile.experience} years</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Teaching Subjects */}
              {profile.subjectsTeaching && profile.subjectsTeaching.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Subjects Teaching</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {profile.subjectsTeaching.map((subject, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-800">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Interests */}
              {profile.researchInterests && profile.researchInterests.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Research Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.researchInterests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'career' && userType === 'ALUMNI' && (
            <div className="space-y-6">
              {/* Career Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Current Position</p>
                      <p className="text-lg font-bold text-blue-800">{profile.currentPosition}</p>
                      <p className="text-sm text-blue-600">{profile.currentCompany}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Work Experience</p>
                      <p className="text-2xl font-bold text-green-800">{profile.workExperience} years</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {profile.achievements && profile.achievements.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Achievements</h3>
                  <div className="space-y-2">
                    {profile.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-gray-800">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentorship Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Mentorship</h3>
                <div className={`p-4 rounded-lg ${profile.mentorshipAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className="flex items-center space-x-2">
                    <Users className={`h-5 w-5 ${profile.mentorshipAvailable ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className={`font-medium ${profile.mentorshipAvailable ? 'text-green-800' : 'text-gray-600'}`}>
                      {profile.mentorshipAvailable ? 'Available for Mentorship' : 'Not Currently Mentoring'}
                    </span>
                  </div>
                  {profile.mentorshipAvailable && (
                    <p className="text-sm text-green-700 mt-2">
                      This alumnus is available to mentor students and share career guidance.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;