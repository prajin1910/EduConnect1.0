import { Award, Briefcase, Building, Calendar, Github, Linkedin, Mail, MapPin, MessageCircle, Phone, Star, User, UserCheck } from 'lucide-react';
import React from 'react';
import ConnectionManager from './ConnectionManager';

interface AlumniProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  department: string;
  graduationYear?: string;
  batch?: string;
  currentCompany?: string;
  currentPosition?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  workExperience?: number;
  achievements?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isAvailableForMentorship?: boolean;
  profilePicture?: string;
  industry?: string;
  specialization?: string;
  certifications?: string[];
  projects?: string[];
}

interface ProfessionalAlumniCardProps {
  alumni: AlumniProfile;
  onViewProfile: (alumni: AlumniProfile) => void;
  onConnectionUpdate?: () => void;
}

const ProfessionalAlumniCard: React.FC<ProfessionalAlumniCardProps> = ({ 
  alumni, 
  onViewProfile, 
  onConnectionUpdate 
}) => {
  const handleEmailContact = () => {
    const subject = `Connection Request - ${alumni.name}`;
    const body = `Hi ${alumni.name},\n\nI would like to connect with you for mentoring and career guidance.\n\nThank you!`;
    window.open(`mailto:${alumni.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleLinkedInContact = () => {
    if (alumni.linkedinUrl) {
      window.open(alumni.linkedinUrl, '_blank');
    }
  };

  const handleGitHubContact = () => {
    if (alumni.githubUrl) {
      window.open(alumni.githubUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with Profile Picture and Basic Info */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {alumni.profilePicture ? (
                <img 
                  src={alumni.profilePicture} 
                  alt={alumni.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            {alumni.isAvailableForMentorship && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <UserCheck className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate">{alumni.name}</h3>
            <p className="text-blue-100 text-sm truncate">
              {alumni.currentPosition || 'Alumni'}
            </p>
            <p className="text-blue-200 text-xs truncate">
              {alumni.currentCompany || 'Company not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-4">
        {/* Professional Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span>{alumni.department}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Class of {alumni.graduationYear || 'N/A'}</span>
            </div>
          </div>
          
          {alumni.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{alumni.location}</span>
            </div>
          )}

          {alumni.workExperience && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4" />
              <span>{alumni.workExperience} years experience</span>
            </div>
          )}

          {alumni.industry && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Industry:</span> {alumni.industry}
            </div>
          )}

          {alumni.specialization && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Specialization:</span> {alumni.specialization}
            </div>
          )}
        </div>

        {/* Bio */}
        {alumni.bio && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-3">{alumni.bio}</p>
          </div>
        )}

        {/* Skills */}
        {alumni.skills && alumni.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {alumni.skills.slice(0, 6).map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {alumni.skills.length > 6 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  +{alumni.skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Achievements */}
        {alumni.achievements && alumni.achievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-1">
              <Award className="h-4 w-4 text-yellow-600" />
              <span>Recent Achievements</span>
            </h4>
            <div className="space-y-1">
              {alumni.achievements.slice(0, 2).map((achievement, index) => (
                <div key={index} className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                  • {achievement}
                </div>
              ))}
              {alumni.achievements.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{alumni.achievements.length - 2} more achievements
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {alumni.certifications && alumni.certifications.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
            <div className="flex flex-wrap gap-1">
              {alumni.certifications.slice(0, 3).map((cert, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                >
                  {cert}
                </span>
              ))}
              {alumni.certifications.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  +{alumni.certifications.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mentorship Status */}
        {alumni.isAvailableForMentorship && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Available for Mentorship</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Open to guiding students and sharing career insights
            </p>
          </div>
        )}

        {/* Contact Links */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={handleEmailContact}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Send Email"
            >
              <Mail className="h-4 w-4" />
            </button>
            
            {alumni.linkedinUrl && (
              <button
                onClick={handleLinkedInContact}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </button>
            )}
            
            {alumni.githubUrl && (
              <button
                onClick={handleGitHubContact}
                className="p-2 text-gray-400 hover:text-gray-800 transition-colors"
                title="GitHub Profile"
              >
                <Github className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onViewProfile(alumni)}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              View Profile
            </button>
            
            <ConnectionManager
              targetUserId={alumni.id}
              targetUserName={alumni.name}
              onConnectionUpdate={onConnectionUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAlumniCard;