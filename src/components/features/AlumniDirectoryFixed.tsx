import axios from 'axios';
import { Award, Briefcase, Building, Calendar, Github, Linkedin, Mail, MapPin, Phone, Search, Star, User, UserCheck, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { alumniDirectoryAPI } from '../../services/api';
import ConnectionManager from './ConnectionManager';

interface AlumniProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  phoneNumber?: string;
  graduationYear?: string;
  batch?: string;
  placedCompany?: string;
  currentPosition?: string;
  currentCompany?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  workExperience?: number;
  achievements?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  personalWebsite?: string;
  aboutMe?: string;
  industry?: string;
  specialization?: string;
  certifications?: string[];
  projects?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  languages?: string[];
  isAvailableForMentorship?: boolean;
  profilePicture?: string;
  mentorshipAvailable?: boolean;
  currentJob?: string;
  company?: string;
  experience?: string;
  availableForMentorship?: boolean;
}

const AlumniDirectoryFixed: React.FC = React.memo(() => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadAlumniDirectory();
  }, []);

  useEffect(() => {
    filterAlumni();
  }, [searchTerm, selectedDepartment, selectedYear, alumni]);

  const loadAlumniDirectory = async () => {
    try {
      console.log('AlumniDirectoryFixed: Loading alumni directory...');
      const token = localStorage.getItem('token');
      
      let response;
      try {
        if (user?.role === 'ALUMNI') {
          console.log('AlumniDirectoryFixed: Loading for alumni user, excluding current user');
          const alumniData = await alumniDirectoryAPI.getAllVerifiedAlumniForAlumni();
          response = { data: alumniData };
        } else {
          console.log('AlumniDirectoryFixed: Loading for non-alumni user');
          const alumniData = await alumniDirectoryAPI.getAllVerifiedAlumni();
          response = { data: alumniData };
        }
      } catch (error) {
        console.warn('AlumniDirectoryFixed: Primary API failed, trying fallback');
        response = await axios.get('https://backend-7y12.onrender.com/api/users/alumni', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (user?.role === 'ALUMNI' && Array.isArray(response.data)) {
          response.data = response.data.filter((alum: any) => {
            if (user?.id && alum.id === user.id) return false;
            if (user?.email && alum.email === user.email) return false;
            return true;
          });
        }
      }

      const alumniData = Array.isArray(response.data) ? response.data : [];
      console.log('AlumniDirectoryFixed: Raw alumni data:', alumniData.length);

      const enhancedAlumni = alumniData.map((alum: any) => ({
        ...alum,
        currentCompany: alum.currentCompany || alum.placedCompany || alum.company || 'Not specified',
        currentPosition: alum.currentPosition || alum.currentJob || 'Not specified',
        location: alum.location || 'Not specified',
        bio: alum.bio || alum.aboutMe || '',
        skills: Array.isArray(alum.skills) ? alum.skills : 
               Array.isArray(alum.technicalSkills) ? alum.technicalSkills : [],
        isAvailableForMentorship: alum.isAvailableForMentorship || alum.mentorshipAvailable || alum.availableForMentorship || false
      }));
      
      setAlumni(enhancedAlumni);
      console.log('AlumniDirectoryFixed: Enhanced alumni directory loaded successfully:', enhancedAlumni.length, 'alumni');
    } catch (error: any) {
      console.error('Error loading alumni directory:', error);
      if (error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to load alumni directory';
        showToast(errorMessage, 'error');
      }
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAlumni = () => {
    let filtered = [...alumni];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(alum => 
        alum.name.toLowerCase().includes(term) ||
        alum.email.toLowerCase().includes(term) ||
        alum.department?.toLowerCase().includes(term) ||
        alum.currentCompany?.toLowerCase().includes(term) ||
        alum.placedCompany?.toLowerCase().includes(term) ||
        alum.currentPosition?.toLowerCase().includes(term)
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(alum => alum.department === selectedDepartment);
    }

    if (selectedYear) {
      filtered = filtered.filter(alum => alum.graduationYear === selectedYear);
    }

    setFilteredAlumni(filtered);
  };

  const handleViewProfile = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni);
    setShowDetailModal(true);
  };

  const getDepartments = () => {
    const departments = [...new Set(alumni.map(alum => alum.department))].filter(Boolean);
    return departments.sort();
  };

  const getGraduationYears = () => {
    const years = [...new Set(alumni.map(alum => alum.graduationYear))].filter(Boolean);
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Alumni Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{alumni.filter(a => a.isAvailableForMentorship || a.mentorshipAvailable || a.availableForMentorship).length}</p>
            <p className="text-xs text-green-600">Available Mentors</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Building className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{new Set(alumni.map(a => a.department)).size}</p>
            <p className="text-xs text-blue-600">Departments</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{new Set(alumni.map(a => a.currentCompany)).size}</p>
            <p className="text-xs text-purple-600">Companies</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{new Set(alumni.map(a => a.location)).size}</p>
            <p className="text-xs text-orange-600">Locations</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Alumni</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Search Alumni</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, company, position..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {getGraduationYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-gray-600 text-sm">
              Showing <span className="text-gray-900 font-medium">{filteredAlumni.length}</span> of <span className="text-gray-900 font-medium">{alumni.length}</span> alumni
            </div>
            {(searchTerm || selectedDepartment || selectedYear) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('');
                  setSelectedYear('');
                }}
                className="text-sm text-violet-600 hover:text-violet-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumni) => (
            <div key={alumni.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{alumni.name}</h3>
                    <p className="text-sm text-gray-600">{alumni.currentPosition}</p>
                  </div>
                </div>
                {alumni.isAvailableForMentorship && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Mentor
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{alumni.currentCompany}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{alumni.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{alumni.department} • Class of {alumni.graduationYear}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleViewProfile(alumni)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                >
                  View Profile
                </button>
                <div className="flex space-x-2">
                  {alumni.linkedinUrl && (
                    <a
                      href={alumni.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {alumni.githubUrl && (
                    <a
                      href={alumni.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlumni.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {showDetailModal && selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAlumni.name}</h2>
                    <p className="text-gray-600">{selectedAlumni.currentPosition}</p>
                    <p className="text-gray-500">{selectedAlumni.currentCompany}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{selectedAlumni.email}</span>
                      </div>
                      {selectedAlumni.phoneNumber && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{selectedAlumni.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">{selectedAlumni.department}</p>
                      <p className="text-sm text-gray-600">Class of {selectedAlumni.graduationYear}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Professional</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{selectedAlumni.currentPosition}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{selectedAlumni.currentCompany}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedAlumni.location}</span>
                      </div>
                    </div>
                  </div>

                  {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlumni.skills.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedAlumni.bio && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedAlumni.bio}</p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex space-x-3">
                  {selectedAlumni.linkedinUrl && (
                    <a
                      href={selectedAlumni.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {selectedAlumni.githubUrl && (
                    <a
                      href={selectedAlumni.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>

                <ConnectionManager
                  targetUserId={selectedAlumni.id}
                  targetUserName={selectedAlumni.name}
                  targetUserRole="ALUMNI"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AlumniDirectoryFixed;
