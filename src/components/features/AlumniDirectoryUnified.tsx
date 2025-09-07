import axios from 'axios';
import { Award, Building, Calendar, Github, Linkedin, Mail, MapPin, Phone, Search, Star, User, UserCheck, Users, X } from 'lucide-react';
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
  // Alumni profile specific fields
  currentJob?: string;
  company?: string;
  experience?: string;
  availableForMentorship?: boolean;
}

const AlumniDirectoryUnified: React.FC = () => {
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
      console.log('AlumniDirectoryUnified: Loading alumni directory...');
      const token = localStorage.getItem('token');
      
      let response;
      try {
        // For alumni users, use the specific endpoint that excludes their own profile
        if (user?.role === 'ALUMNI') {
          console.log('AlumniDirectoryUnified: Loading for alumni user, excluding current user');
          const alumniData = await alumniDirectoryAPI.getAllVerifiedAlumniForAlumni();
          response = { data: alumniData };
        } else {
          console.log('AlumniDirectoryUnified: Loading for non-alumni user');
          // For other users, use the general endpoint
          const alumniData = await alumniDirectoryAPI.getAllVerifiedAlumni();
          response = { data: alumniData };
        }
      } catch (error) {
        console.warn('AlumniDirectoryUnified: Primary API failed, trying fallback');
        // Fallback to the old API
        response = await axios.get('http://localhost:8080/api/users/alumni', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // For alumni users, manually filter out current user from fallback response
        if (user?.role === 'ALUMNI' && Array.isArray(response.data)) {
          response.data = response.data.filter((alum: any) => {
            if (user?.id && alum.id === user.id) return false;
            if (user?.email && alum.email === user.email) return false;
            return true;
          });
        }
      }
      
      // Transform the response data with enhanced profile information
      const alumniData = Array.isArray(response.data) ? response.data : [];
      console.log('AlumniDirectoryUnified: Raw alumni data count:', alumniData.length);
      
      // Fetch complete profile data for each alumni from alumni_profiles collection
      const enhancedAlumni = await Promise.all(
        alumniData.map(async (alum: any) => {
          try {
            // Try to get enhanced profile data from alumni_profiles collection
            const profileResponse = await axios.get(`http://localhost:8080/api/alumni-profiles/complete-profile/${alum.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const profileData = profileResponse.data;
            
            console.log('AlumniDirectoryUnified: Enhanced profile for', alum.name, '- ID:', alum.id);
            
            return {
              id: alum.id,
              name: alum.name || profileData.name || 'Anonymous',
              email: alum.email || profileData.email || '',
              department: alum.department || profileData.department || 'Unknown',
              phoneNumber: alum.phoneNumber || profileData.phoneNumber || '',
              graduationYear: alum.graduationYear || profileData.graduationYear || 'Unknown',
              batch: alum.batch || profileData.batch || 'Unknown',
              placedCompany: alum.placedCompany || alum.currentCompany || profileData.placedCompany || 'Not specified',
              currentPosition: alum.currentPosition || profileData.currentPosition || profileData.currentJob || '',
              currentCompany: alum.currentCompany || alum.placedCompany || profileData.currentCompany || profileData.company || 'Not specified',
              location: profileData.location || alum.location || 'Not specified', // Prioritize location from alumni_profiles
              bio: alum.bio || profileData.bio || profileData.aboutMe || '',
              skills: alum.skills || profileData.skills || profileData.technicalSkills || [],
              workExperience: alum.workExperience || profileData.workExperience || (profileData.experience ? parseInt(profileData.experience) : 0),
              achievements: alum.achievements || profileData.achievements || [],
              linkedinUrl: alum.linkedinUrl || profileData.linkedinUrl || '',
              githubUrl: alum.githubUrl || profileData.githubUrl || '',
              portfolioUrl: alum.portfolioUrl || profileData.portfolioUrl || '',
              personalWebsite: profileData.personalWebsite || '',
              aboutMe: profileData.aboutMe || alum.bio || '',
              industry: alum.industry || profileData.industry || '',
              specialization: alum.specialization || profileData.specialization || '',
              certifications: alum.certifications || profileData.certifications || [],
              projects: alum.projects || profileData.projects || [],
              technicalSkills: profileData.technicalSkills || [],
              softSkills: profileData.softSkills || [],
              languages: profileData.languages || [],
              isAvailableForMentorship: alum.isAvailableForMentorship || profileData.isAvailableForMentorship || profileData.availableForMentorship || false,
              mentorshipAvailable: alum.mentorshipAvailable || profileData.mentorshipAvailable || profileData.isAvailableForMentorship || false,
              profilePicture: alum.profilePicture || profileData.profilePicture || '',
              // Legacy fields for backward compatibility
              currentJob: profileData.currentJob || alum.currentPosition || '',
              company: profileData.company || alum.currentCompany || '',
              experience: profileData.experience || (alum.workExperience ? alum.workExperience.toString() : ''),
              availableForMentorship: profileData.availableForMentorship || alum.isAvailableForMentorship || false
            };
          } catch (profileError) {
            console.warn(`Failed to load enhanced profile for ${alum.id}:`, profileError);
            // Return basic alumni data if enhanced profile fails
            console.log('AlumniDirectoryUnified: Using basic profile for', alum.name, '- ID:', alum.id);
            
            return {
              id: alum.id,
              name: alum.name || 'Anonymous',
              email: alum.email || '',
              department: alum.department || 'Unknown',
              phoneNumber: alum.phoneNumber || '',
              graduationYear: alum.graduationYear || 'Unknown',
              batch: alum.batch || 'Unknown',
              placedCompany: alum.placedCompany || alum.currentCompany || 'Not specified',
              currentPosition: alum.currentPosition || '',
              currentCompany: alum.currentCompany || alum.placedCompany || 'Not specified',
              location: alum.location || 'Location not specified', // Use proper fallback for location
              bio: alum.bio || '',
              skills: alum.skills || [],
              workExperience: alum.workExperience || 0,
              achievements: alum.achievements || [],
              linkedinUrl: alum.linkedinUrl || '',
              githubUrl: alum.githubUrl || '',
              portfolioUrl: alum.portfolioUrl || '',
              personalWebsite: '',
              aboutMe: alum.bio || '',
              industry: alum.industry || '',
              specialization: alum.specialization || '',
              certifications: [],
              projects: [],
              technicalSkills: [],
              softSkills: [],
              languages: [],
              isAvailableForMentorship: alum.isAvailableForMentorship || false,
              mentorshipAvailable: alum.mentorshipAvailable || false,
              profilePicture: alum.profilePicture || '',
              currentJob: alum.currentPosition || '',
              company: alum.currentCompany || '',
              experience: alum.workExperience ? alum.workExperience.toString() : '',
              availableForMentorship: alum.isAvailableForMentorship || false
            };
          }
        })
      );
      
      setAlumni(enhancedAlumni);
      console.log('AlumniDirectoryUnified: Enhanced alumni directory loaded successfully:', enhancedAlumni.length, 'alumni');
    } catch (error: any) {
      console.error('Error loading alumni directory:', error);
      // Don't show error toast if it's just no alumni available
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

    // Filter by search term
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

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(alum => alum.department === selectedDepartment);
    }

    // Filter by graduation year
    if (selectedYear) {
      filtered = filtered.filter(alum => alum.graduationYear === selectedYear);
    }

    setFilteredAlumni(filtered);
  };

  const handleViewProfile = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni);
    setShowDetailModal(true);
  };

  const handleConnectionUpdate = () => {
    // Refresh the alumni list to update connection statuses
    loadAlumniDirectory();
  };

  const getDepartments = () => {
    const departments = new Set(alumni.map(alum => alum.department).filter(Boolean));
    return Array.from(departments).sort();
  };

  const getGraduationYears = () => {
    const years = new Set(alumni.map(alum => alum.graduationYear).filter(Boolean));
    return Array.from(years).sort().reverse();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-2">
        {/* Ultra Compact Header */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-md flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Alumni Directory</h1>
              <p className="text-gray-600 text-xs">
                {alumni.length} verified alumni
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1 text-emerald-600">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span>{alumni.filter(a => a.isAvailableForMentorship || a.mentorshipAvailable || a.availableForMentorship).length} Mentors</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>{new Set(alumni.map(a => a.department)).size} Departments</span>
            </div>
            <div className="flex items-center space-x-1 text-purple-600">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>{new Set(alumni.map(a => a.currentCompany)).size} Companies</span>
            </div>
          </div>
        </div>

      {/* Ultra Compact Search and Filters */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 mb-3">
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Find Alumni</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search alumni..."
                className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              <option value="">All</option>
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              <option value="">All</option>
              {getGraduationYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ultra Compact Results */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-gray-600 text-xs">
            <span className="text-gray-900 font-medium">{filteredAlumni.length}</span> of <span className="text-gray-900 font-medium">{alumni.length}</span> alumni
          </div>
          {(searchTerm || selectedDepartment || selectedYear) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
                setSelectedYear('');
              }}
              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Ultra Compact Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAlumni.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No Alumni Found</h3>
              <p className="text-gray-600 text-xs">Try adjusting your search.</p>
            </div>
          </div>
        ) : (
          filteredAlumni.map((alum) => (
            <div key={alum.id} className="group">
              <div className="bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Mini Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 text-white">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                      {alum.profilePicture ? (
                        <img 
                          src={alum.profilePicture} 
                          alt={alum.name} 
                          className="w-full h-full rounded-md object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-xs leading-tight">{alum.name}</h3>
                      <p className="text-white/90 text-xs truncate">
                        {alum.currentPosition || alum.currentJob || 'Alumni'}
                      </p>
                    </div>
                    
                    {(alum.isAvailableForMentorship || alum.mentorshipAvailable || alum.availableForMentorship) && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <UserCheck className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Information */}
                <div className="p-4 space-y-3">
                  {/* Key Information */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <div className="flex items-center space-x-1 text-blue-600 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium text-xs">Graduation</span>
                      </div>
                      <div className="text-blue-900 font-semibold text-sm">{alum.graduationYear || 'N/A'}</div>
                    </div>
                    
                    <div className="bg-green-50 p-2 rounded-lg">
                      <div className="flex items-center space-x-1 text-green-600 mb-1">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium text-xs">Location</span>
                      </div>
                      <div className="text-green-900 font-semibold text-sm truncate">{alum.location || 'Not specified'}</div>
                    </div>
                  </div>

                  {/* Department & Experience */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <div className="flex items-center space-x-1 text-purple-600 mb-1">
                        <Building className="h-3 w-3" />
                        <span className="font-medium text-xs">Department</span>
                      </div>
                      <div className="text-purple-900 font-semibold text-sm truncate">{alum.department}</div>
                    </div>
                    
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <div className="flex items-center space-x-1 text-orange-600 mb-1">
                        <Award className="h-3 w-3" />
                        <span className="font-medium text-xs">Experience</span>
                      </div>
                      <div className="text-orange-900 font-bold text-sm">{alum.workExperience ? `${alum.workExperience}+ years` : 'Not specified'}</div>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {alum.skills && alum.skills.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                      <div className="text-slate-700 text-sm font-semibold mb-2">Top Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {alum.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-white text-slate-700 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
                            {skill}
                          </span>
                        ))}
                        {alum.skills.length > 3 && (
                          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium">
                            +{alum.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mentorship Status - Enhanced */}
                  <div className={`rounded-xl p-4 border transition-all duration-300 ${
                    (alum.isAvailableForMentorship || alum.mentorshipAvailable || alum.availableForMentorship) 
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-emerald-100 shadow-lg' 
                      : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {(alum.isAvailableForMentorship || alum.mentorshipAvailable || alum.availableForMentorship) ? (
                          <>
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                              <UserCheck className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-emerald-900">Mentoring Available</span>
                              <p className="text-xs text-emerald-700">Ready to guide and support</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-slate-300 rounded-lg flex items-center justify-center">
                              <User className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-700">Not Available</span>
                              <p className="text-xs text-slate-600">Currently unavailable</p>
                            </div>
                          </>
                        )}
                      </div>
                      {(alum.isAvailableForMentorship || alum.mentorshipAvailable || alum.availableForMentorship) && (
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => handleViewProfile(alum)}
                      className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 px-4 rounded-xl hover:from-slate-800 hover:to-slate-900 transition-all duration-300 font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <User className="h-4 w-4" />
                      <span>View Profile</span>
                    </button>
                    
                    {/* Contact Button */}
                    <button
                      onClick={() => window.open(`mailto:${alum.email}`, '_blank')}
                      className="px-4 py-3 border-2 border-slate-300 text-slate-600 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Connection Manager for mentoring - Only show if available */}
                  {(alum.isAvailableForMentorship || alum.mentorshipAvailable || alum.availableForMentorship) && (
                    <div className="pt-2">
                      <ConnectionManager
                        targetUserId={alum.id}
                        targetUserName={alum.name}
                        onConnectionUpdate={handleConnectionUpdate}
                        buttonText="Request Mentoring"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Detail Modal with Complete Profile Information */}
      {showDetailModal && selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedAlumni.name}</h3>
                  <div className="flex items-center space-x-4 text-gray-600 mt-1">
                    <span className="text-lg">{selectedAlumni.currentPosition || selectedAlumni.currentJob || 'Alumni'}</span>
                    {(selectedAlumni.isAvailableForMentorship || selectedAlumni.mentorshipAvailable || selectedAlumni.availableForMentorship) && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Available for Mentorship
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="text-center">
                    <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {selectedAlumni.profilePicture ? (
                        <img src={selectedAlumni.profilePicture} alt={selectedAlumni.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-16 w-16 text-orange-600" />
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{selectedAlumni.email}</span>
                      </div>

                      {selectedAlumni.phoneNumber && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{selectedAlumni.phoneNumber}</span>
                        </div>
                      )}

                      {selectedAlumni.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{selectedAlumni.location}</span>
                        </div>
                      )}

                      {/* Social Links */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex space-x-3">
                          {selectedAlumni.linkedinUrl && (
                            <a
                              href={selectedAlumni.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Linkedin className="h-5 w-5" />
                            </a>
                          )}
                          {selectedAlumni.githubUrl && (
                            <a
                              href={selectedAlumni.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 hover:text-gray-900"
                            >
                              <Github className="h-5 w-5" />
                            </a>
                          )}
                          {selectedAlumni.portfolioUrl && (
                            <a
                              href={selectedAlumni.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <User className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Academic Background</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Department:</span>
                        <span className="font-medium text-blue-900">{selectedAlumni.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Graduation Year:</span>
                        <span className="font-medium text-blue-900">{selectedAlumni.graduationYear || 'Unknown'}</span>
                      </div>
                      {selectedAlumni.batch && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Batch:</span>
                          <span className="font-medium text-blue-900">{selectedAlumni.batch}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Professional Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Professional Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Professional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current Position:</span>
                        <p className="font-medium text-gray-900">{selectedAlumni.currentPosition || selectedAlumni.currentJob || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Company:</span>
                        <p className="font-medium text-gray-900">{selectedAlumni.currentCompany || selectedAlumni.company || selectedAlumni.placedCompany || 'Not specified'}</p>
                      </div>
                      {selectedAlumni.industry && (
                        <div>
                          <span className="text-gray-600">Industry:</span>
                          <p className="font-medium text-gray-900">{selectedAlumni.industry}</p>
                        </div>
                      )}
                      {selectedAlumni.workExperience && selectedAlumni.workExperience > 0 && (
                        <div>
                          <span className="text-gray-600">Experience:</span>
                          <p className="font-medium text-gray-900">{selectedAlumni.workExperience} years</p>
                        </div>
                      )}
                      {selectedAlumni.specialization && (
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Specialization:</span>
                          <p className="font-medium text-gray-900">{selectedAlumni.specialization}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* About Me */}
                  {(selectedAlumni.bio || selectedAlumni.aboutMe) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">About</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedAlumni.bio || selectedAlumni.aboutMe}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {((selectedAlumni.skills && selectedAlumni.skills.length > 0) || (selectedAlumni.technicalSkills && selectedAlumni.technicalSkills.length > 0)) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
                      <div className="space-y-3">
                        {selectedAlumni.technicalSkills && selectedAlumni.technicalSkills.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Technical Skills</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedAlumni.technicalSkills.map((skill, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">General Skills</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedAlumni.skills.map((skill, index) => (
                                <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedAlumni.softSkills && selectedAlumni.softSkills.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Soft Skills</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedAlumni.softSkills.map((skill, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {selectedAlumni.achievements && selectedAlumni.achievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        <span>Achievements</span>
                      </h4>
                      <div className="space-y-2">
                        {selectedAlumni.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                            <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-800 text-sm">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedAlumni.certifications && selectedAlumni.certifications.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedAlumni.certifications.map((cert, index) => (
                          <div key={index} className="bg-green-50 p-2 rounded text-sm text-green-800">
                            {cert}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {selectedAlumni.projects && selectedAlumni.projects.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Notable Projects</h4>
                      <div className="space-y-2">
                        {selectedAlumni.projects.map((project, index) => (
                          <div key={index} className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-purple-800 text-sm">{project}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {selectedAlumni.languages && selectedAlumni.languages.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlumni.languages.map((language, index) => (
                          <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6 pt-4 border-t px-6 pb-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                
                <button
                  onClick={() => window.open(`mailto:${selectedAlumni.email}`, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
                
                {/* Connect Button in Modal - Only show if mentorship is available */}
                {(selectedAlumni.isAvailableForMentorship || selectedAlumni.mentorshipAvailable || selectedAlumni.availableForMentorship) && (
                  <ConnectionManager
                    targetUserId={selectedAlumni.id}
                    targetUserName={selectedAlumni.name}
                    onConnectionUpdate={handleConnectionUpdate}
                    buttonText="Request Mentoring"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AlumniDirectoryUnified;