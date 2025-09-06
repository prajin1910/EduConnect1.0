import { Github, Link, Linkedin, Save, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { alumniAPI } from '../../services/api';

interface AlumniProfileData {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  currentJob?: string;
  company?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isAvailableForMentorship?: boolean;
  experience?: string;
  achievements?: string[];
}

const AlumniProfile: React.FC = () => {
  const [profile, setProfile] = useState<AlumniProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await alumniAPI.getMyProfile();
      setProfile(profileData);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      showToast('Failed to load profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await alumniAPI.updateMyProfile(profile);
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AlumniProfileData, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills?.includes(skillInput.trim())) {
      const newSkills = [...(profile.skills || []), skillInput.trim()];
      handleInputChange('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = (profile.skills || []).filter(skill => skill !== skillToRemove);
    handleInputChange('skills', newSkills);
  };

  const addAchievement = () => {
    if (achievementInput.trim() && !profile.achievements?.includes(achievementInput.trim())) {
      const newAchievements = [...(profile.achievements || []), achievementInput.trim()];
      handleInputChange('achievements', newAchievements);
      setAchievementInput('');
    }
  };

  const removeAchievement = (achievementToRemove: string) => {
    const newAchievements = (profile.achievements || []).filter(achievement => achievement !== achievementToRemove);
    handleInputChange('achievements', newAchievements);
  };

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
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold">My Alumni Profile</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={profile.name || ''}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={profile.department || ''}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Job Title</label>
              <input
                type="text"
                value={profile.currentJob || ''}
                onChange={(e) => handleInputChange('currentJob', e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={profile.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., Google, Microsoft"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Chennai, India"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input
                type="text"
                value={profile.experience || ''}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="e.g., 3 years"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">About Me</h3>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself, your interests, and what you're passionate about..."
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <button
                onClick={addSkill}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Social Links</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Linkedin className="h-4 w-4 inline mr-1" />
                LinkedIn URL
              </label>
              <input
                type="url"
                value={profile.linkedinUrl || ''}
                onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Github className="h-4 w-4 inline mr-1" />
                GitHub URL
              </label>
              <input
                type="url"
                value={profile.githubUrl || ''}
                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                placeholder="https://github.com/yourusername"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Link className="h-4 w-4 inline mr-1" />
                Portfolio URL
              </label>
              <input
                type="url"
                value={profile.portfolioUrl || ''}
                onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Achievements</h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                placeholder="Add an achievement"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
              />
              <button
                onClick={addAchievement}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(profile.achievements || []).map((achievement, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                >
                  <span className="text-sm">{achievement}</span>
                  <button
                    onClick={() => removeAchievement(achievement)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mentorship */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Mentorship</h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isAvailableForMentorship || false}
              onChange={(e) => handleInputChange('isAvailableForMentorship', e.target.checked)}
              className="text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium">I'm available to mentor students and junior alumni</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;
