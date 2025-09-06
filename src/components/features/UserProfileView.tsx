import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { alumniAPI, professorAPI, studentAPI } from '../../services/api';
import UserProfile from './UserProfile';

const UserProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [userType, setUserType] = useState<'STUDENT' | 'PROFESSOR' | 'ALUMNI' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !token) {
      navigate('/login');
      return;
    }

    // Fetch user type from the user ID
    fetchUserType(userId);
  }, [userId, token, navigate]);

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
    } catch (error) {
      console.error('Failed to fetch user type:', error);
      setUserType(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  if (!userId) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The requested user profile could not be found.</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <UserProfile
      userId={userId}
      userType={userType}
      onClose={handleClose}
    />
  );
};

export default UserProfileView;
