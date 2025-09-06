import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { alumniAPI, professorAPI, studentAPI } from '../../services/api';
import UserProfile from './UserProfile';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const [userType, setUserType] = useState<'STUDENT' | 'PROFESSOR' | 'ALUMNI' | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserType(userId);
    }
  }, [userId]);

  const fetchUserType = async (id: string) => {
    try {
      setLoading(true);
      
      // Try each API to determine user type
      // First try alumni API
      try {
        const response = await alumniAPI.getProfile(id);
        if (response) {
          setUserType('ALUMNI');
          return;
        }
      } catch (error) {
        // Continue to next API
      }
      
      // Try student API
      try {
        const response = await studentAPI.getProfile(id);
        if (response) {
          setUserType('STUDENT');
          return;
        }
      } catch (error) {
        // Continue to next API
      }
      
      // Try professor API
      try {
        const response = await professorAPI.getProfile(id);
        if (response) {
          setUserType('PROFESSOR');
          return;
        }
      } catch (error) {
        // No valid user type found
      }
      
      // If none worked, default to null
      setUserType(null);
      showToast('User profile not found', 'error');
    } catch (error) {
      console.error('Failed to fetch user type:', error);
      showToast('Failed to load user profile', 'error');
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 mx-4 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (!userType) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 mx-4 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-6">The requested user profile could not be loaded.</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the UserProfile component which is already a full modal
  return (
    <UserProfile
      userId={userId}
      userType={userType}
      onClose={onClose}
    />
  );
};

export default UserProfileModal;
