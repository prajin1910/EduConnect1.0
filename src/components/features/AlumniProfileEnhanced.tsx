import { Award, Briefcase, Github, Globe, Linkedin, Save, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { alumniAPI } from '../../services/api';

interface AlumniProfileData {
  // Basic Info
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  profilePicture?: string;
  
  // Alumni Specific
  graduationYear: number;
  department: string;
  course: string;
  currentCompany: string;
  currentPosition: string;
  workExperience: number;
  
  // Enhanced Profile Fields
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  personalWebsite: string;
  aboutMe: string;
  industry: string;
  workLocation: string;
  jobTitle: string;
  specialization: string;
  previousCompanies: string;
  educationDetails: string;
  
  // Skills & Attributes
  skills: string[];
  technicalSkills: string[];
  softSkills: string[];
  languages: string[];
  certifications: string[];
  projects: string[];
  achievements: string[];
  
  // Availability
  mentorshipAvailable: boolean;
  isAvailableForJobRequests: boolean;
  salaryRange: number;
}

const AlumniProfileEnhanced: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [profileData, setProfileData] = useState<AlumniProfileData>({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    graduationYear: new Date().getFullYear(),
    department: '',
    course: '',
    currentCompany: '',
    currentPosition: '',
    workExperience: 0,
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    personalWebsite: '',
    aboutMe: '',
    industry: '',
    workLocation: '',
    jobTitle: '',
    specialization: '',
    previousCompanies: '',
    educationDetails: '',
    skills: [],
    technicalSkills: [],
    softSkills: [],
    languages: [],
    certifications: [],
    projects: [],
    achievements: [],
    mentorshipAvailable: false,
    isAvailableForJobRequests: false,
    salaryRange: 0
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await alumniAPI.getMyProfile();
      
      // Map the response to our interface
      setProfileData({
        name: response.name || '',
        email: response.email || '',
        phoneNumber: response.phoneNumber || '',
        location: response.location || '',
        profilePicture: response.profilePicture || '',
        graduationYear: response.graduationYear || new Date().getFullYear(),
        department: response.department || '',
        course: response.course || '',
        currentCompany: response.currentCompany || '',
        currentPosition: response.currentPosition || '',
        workExperience: response.workExperience || 0,
        linkedinUrl: response.linkedinUrl || '',
        githubUrl: response.githubUrl || '',
        portfolioUrl: response.portfolioUrl || '',
        personalWebsite: response.personalWebsite || '',
        aboutMe: response.aboutMe || '',
        industry: response.industry || '',
        workLocation: response.workLocation || '',
        jobTitle: response.jobTitle || '',
        specialization: response.specialization || '',
        previousCompanies: response.previousCompanies || '',
        educationDetails: response.educationDetails || '',
        skills: response.skills || [],
        technicalSkills: response.technicalSkills || [],
        softSkills: response.softSkills || [],
        languages: response.languages || [],
        certifications: response.certifications || [],
        projects: response.projects || [],
        achievements: response.achievements || [],
        mentorshipAvailable: response.mentorshipAvailable || false,
        isAvailableForJobRequests: response.isAvailableForJobRequests || false,
        salaryRange: response.salaryRange || 0
      });
    } catch (error: any) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await alumniAPI.updateMyProfile(profileData);
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayFieldChange = (field: keyof AlumniProfileData, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setProfileData(prev => ({ ...prev, [field]: items }));
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'skills', label: 'Skills & Certifications', icon: Award },
    { id: 'social', label: 'Social & Links', icon: Globe },
    { id: 'preferences', label: 'Preferences', icon: Users }
  ];

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
        <h2 className="text-2xl font-bold text-gray-900">Enhanced Alumni Profile</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Basic Information */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                  <input
                    type="number"
                    value={profileData.graduationYear}
                    onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <input
                    type="text"
                    value={profileData.course}
                    onChange={(e) => setProfileData(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
                <textarea
                  rows={4}
                  value={profileData.aboutMe}
                  onChange={(e) => setProfileData(prev => ({ ...prev, aboutMe: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Tell us about yourself, your journey, and your interests..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education Details</label>
                <textarea
                  rows={3}
                  value={profileData.educationDetails}
                  onChange={(e) => setProfileData(prev => ({ ...prev, educationDetails: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Additional education details, degrees, specializations..."
                />
              </div>
            </div>
          )}

          {/* Professional Information */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Company</label>
                  <input
                    type="text"
                    value={profileData.currentCompany}
                    onChange={(e) => setProfileData(prev => ({ ...prev, currentCompany: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Position</label>
                  <input
                    type="text"
                    value={profileData.currentPosition}
                    onChange={(e) => setProfileData(prev => ({ ...prev, currentPosition: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={profileData.jobTitle}
                    onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <input
                    type="text"
                    value={profileData.industry}
                    onChange={(e) => setProfileData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Location</label>
                  <input
                    type="text"
                    value={profileData.workLocation}
                    onChange={(e) => setProfileData(prev => ({ ...prev, workLocation: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    value={profileData.workExperience}
                    onChange={(e) => setProfileData(prev => ({ ...prev, workExperience: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <input
                    type="text"
                    value={profileData.specialization}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Your area of expertise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range (LPA)</label>
                  <input
                    type="number"
                    value={profileData.salaryRange}
                    onChange={(e) => setProfileData(prev => ({ ...prev, salaryRange: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Current salary range"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Companies</label>
                <textarea
                  rows={3}
                  value={profileData.previousCompanies}
                  onChange={(e) => setProfileData(prev => ({ ...prev, previousCompanies: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="List your previous work experience..."
                />
              </div>
            </div>
          )}

          {/* Skills & Certifications */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Skills & Certifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">General Skills</label>
                  <textarea
                    rows={3}
                    value={profileData.skills.join(', ')}
                    onChange={(e) => handleArrayFieldChange('skills', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Separate skills with commas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                  <textarea
                    rows={3}
                    value={profileData.technicalSkills.join(', ')}
                    onChange={(e) => handleArrayFieldChange('technicalSkills', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Python, React, AWS, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</label>
                  <textarea
                    rows={3}
                    value={profileData.softSkills.join(', ')}
                    onChange={(e) => handleArrayFieldChange('softSkills', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Leadership, Communication, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  <textarea
                    rows={3}
                    value={profileData.languages.join(', ')}
                    onChange={(e) => handleArrayFieldChange('languages', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., English, Hindi, Spanish, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                <textarea
                  rows={4}
                  value={profileData.certifications.join(', ')}
                  onChange={(e) => handleArrayFieldChange('certifications', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="List your professional certifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notable Projects</label>
                <textarea
                  rows={4}
                  value={profileData.projects.join(', ')}
                  onChange={(e) => handleArrayFieldChange('projects', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your key projects..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                <textarea
                  rows={4}
                  value={profileData.achievements.join(', ')}
                  onChange={(e) => handleArrayFieldChange('achievements', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="List your professional achievements..."
                />
              </div>
            </div>
          )}

          {/* Social & Links */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Social Media & Professional Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profileData.linkedinUrl}
                      onChange={(e) => setProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Github className="h-5 w-5 text-gray-800" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={profileData.githubUrl}
                      onChange={(e) => setProfileData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                    <input
                      type="url"
                      value={profileData.portfolioUrl}
                      onChange={(e) => setProfileData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personal Website</label>
                    <input
                      type="url"
                      value={profileData.personalWebsite}
                      onChange={(e) => setProfileData(prev => ({ ...prev, personalWebsite: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Availability & Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="mentorship"
                    checked={profileData.mentorshipAvailable}
                    onChange={(e) => setProfileData(prev => ({ ...prev, mentorshipAvailable: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mentorship" className="text-sm font-medium text-gray-700">
                    Available for Mentorship
                  </label>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Allow students and junior alumni to request mentorship from you
                </p>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="jobRequests"
                    checked={profileData.isAvailableForJobRequests}
                    onChange={(e) => setProfileData(prev => ({ ...prev, isAvailableForJobRequests: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="jobRequests" className="text-sm font-medium text-gray-700">
                    Available for Job Referrals
                  </label>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Allow students to contact you for job referrals and opportunities
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">Profile Visibility</h4>
                <p className="text-sm text-orange-700">
                  Your profile will be visible in the Alumni Directory to all verified users. 
                  The information you provide here will help students and fellow alumni connect with you more effectively.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileEnhanced;
