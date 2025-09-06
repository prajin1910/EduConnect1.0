import { Building, Edit, Github, Linkedin, Mail, Phone, Save, Upload, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { studentAPI } from '../../services/api';
import ActivityHeatmap from './ActivityHeatmap';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  className: string;
  bio: string;
  skills: string[];
  interests: string[];
  location?: string;
  jobPreferences: {
    preferredRoles: string[];
    preferredLocations: string[];
    expectedSalary: string;
    jobType: string;
  };
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  resumeUrl?: string;
  goals: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    status: 'pending' | 'in-progress' | 'completed';
  }>;
  profilePicture?: string;
}

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('StudentProfile: Loading profile for user:', user?.name);
      // Load actual profile from API
      const profileData = await studentAPI.getMyProfile();
      console.log('StudentProfile: Profile loaded successfully');
      console.log('StudentProfile: Profile data:', profileData);
      
      // Convert API response to component format
      const formattedProfile: StudentProfile = {
        id: profileData.id || user?.id || '',
        name: profileData.name || user?.name || '',
        email: profileData.email || user?.email || '',
        phoneNumber: profileData.phone || profileData.phoneNumber || '',
        department: profileData.department || '',
        className: profileData.className || '',
        bio: profileData.bio || '',
        skills: profileData.skills || [],
        interests: [], // You may want to add interests field to backend
        location: profileData.location || '',
        jobPreferences: {
          preferredRoles: [],
          preferredLocations: [],
          expectedSalary: '',
          jobType: 'Full-time'
        },
        linkedinUrl: profileData.linkedinUrl || '',
        githubUrl: profileData.githubUrl || '',
        portfolioUrl: profileData.portfolioUrl || '',
        goals: []
      };
      
      setProfile(formattedProfile);
      console.log('StudentProfile: Formatted profile set:', formattedProfile);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      // Don't show error toast for profile loading issues, just log them
      console.warn('Using default profile due to loading failure');
      
      // Set a basic profile with user data
      if (user) {
        setProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: '',
          department: '',
          className: '',
          bio: '',
          skills: [],
          interests: [],
          location: '',
          jobPreferences: {
            preferredRoles: [],
            preferredLocations: [],
            expectedSalary: '',
            jobType: 'Full-time'
          },
          linkedinUrl: '',
          githubUrl: '',
          portfolioUrl: '',
          goals: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      // Prepare data for API call - only send fields that exist in backend
      const updateData = {
        bio: profile.bio,
        skills: profile.skills,
        location: profile.location || '',
        phone: profile.phoneNumber,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        portfolioUrl: profile.portfolioUrl
      };
      
      console.log('Updating student profile:', updateData);
      await studentAPI.updateMyProfile(updateData);
      
      // Reload the profile to get updated data
      await loadProfile();
      
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data || error.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: keyof StudentProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const addSkill = (skill: string) => {
    if (!profile || !skill.trim()) return;
    if (!profile.skills.includes(skill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skill.trim()] });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (!profile) return;
    setProfile({ ...profile, skills: profile.skills.filter(skill => skill !== skillToRemove) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Student Profile</h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-white" />
            </div>
            
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                className="text-xl font-bold text-center w-full border-b border-gray-300 focus:border-blue-500 outline-none mb-2"
              />
            ) : (
              <h3 className="text-xl font-bold mb-2">{profile.name}</h3>
            )}
            
            <p className="text-gray-600 mb-1">Student</p>
            <p className="text-gray-500 mb-4">Class {profile.className}</p>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Building className="h-4 w-4" />
                <span>{profile.department}</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h4 className="font-semibold mb-3">About</h4>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => updateProfile('bio', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700">{profile.bio || 'No bio added yet.'}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h4 className="font-semibold mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => updateProfile('phoneNumber', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h4 className="font-semibold mb-3">Social Links</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Linkedin className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => updateProfile('linkedinUrl', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Github className="h-5 w-5 text-gray-800" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">GitHub</label>
                  <input
                    type="url"
                    value={profile.githubUrl}
                    onChange={(e) => updateProfile('githubUrl', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Portfolio</label>
                  <input
                    type="url"
                    value={profile.portfolioUrl}
                    onChange={(e) => updateProfile('portfolioUrl', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h4 className="font-semibold mb-3">Skills</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            
            {isEditing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a skill"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addSkill(input.value);
                    input.value = '';
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Heatmap Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">My Activity Overview</h3>
        <ActivityHeatmap userId={profile.id} userName={profile.name} showTitle={false} />
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setIsEditing(false);
              loadProfile(); // Reset changes
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;