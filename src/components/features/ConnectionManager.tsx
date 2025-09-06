import { MessageCircle, UserCheck, UserPlus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { connectionAPI } from '../../services/api';

interface Connection {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestedAt: string;
  respondedAt?: string;
  senderName?: string;
  recipientName?: string;
}

interface ConnectionManagerProps {
  targetUserId: string;
  targetUserName: string;
  onConnectionUpdate?: () => void;
  buttonText?: string;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ 
  targetUserId, 
  targetUserName, 
  onConnectionUpdate,
  buttonText = "Request Mentoring"
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<string>('none');
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (targetUserId && user?.id) {
      checkConnectionStatus();
    }
  }, [targetUserId, user?.id]);

  const checkConnectionStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await connectionAPI.getConnectionStatus(targetUserId);
      console.log('ConnectionManager: Connection status response:', response);
      setConnectionStatus(response.status);
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus('none'); // Default to none if check fails
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSendRequest = async () => {
    if (!requestMessage.trim()) {
      showToast('Please enter a message for your connection request', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('ConnectionManager: Sending connection request to:', targetUserId);
      console.log('ConnectionManager: Target user name:', targetUserName);
      console.log('ConnectionManager: Message:', requestMessage);
      
      await connectionAPI.sendConnectionRequest(targetUserId, requestMessage);
      setConnectionStatus('pending');
      setShowRequestModal(false);
      setRequestMessage('');
      showToast(`Connection request sent to ${targetUserName}!`, 'success');
      
      // Trigger connection update callback to refresh any parent components
      onConnectionUpdate?.();
      
      // Trigger a custom event to notify other components to refresh their data
      window.dispatchEvent(new CustomEvent('connectionUpdated'));
    } catch (error: any) {
      console.error('ConnectionManager: Error sending connection request:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to send connection request';
      console.error('ConnectionManager: Error message:', errorMessage);
      showToast(error.response?.data?.error || 'Failed to send connection request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (checkingStatus) {
      return {
        icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>,
        text: 'Checking...',
        className: 'bg-gray-400 text-white cursor-not-allowed text-xs',
        onClick: () => {}
      };
    }
    
    switch (connectionStatus) {
      case 'none':
        return {
          icon: <UserPlus className="h-4 w-4" />,
          text: buttonText,
          className: 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium',
          onClick: () => {
            setRequestMessage(`Hi ${targetUserName}, I would like to connect with you for mentoring and career guidance. Thank you!`);
            setShowRequestModal(true);
          }
        };
      case 'pending':
        return {
          icon: <MessageCircle className="h-4 w-4" />,
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 cursor-not-allowed text-xs',
          onClick: () => {}
        };
      case 'connected':
        return {
          icon: <UserCheck className="h-4 w-4" />,
          text: 'Connected',
          className: 'bg-green-100 text-green-800 text-xs',
          onClick: () => showToast('You are already connected!', 'info')
        };
      default:
        return {
          icon: <UserPlus className="h-4 w-4" />,
          text: buttonText,
          className: 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium',
          onClick: () => setShowRequestModal(true)
        };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <>
      <button
        onClick={buttonContent.onClick}
        disabled={loading || connectionStatus === 'pending' || checkingStatus}
        className={`px-3 py-2 rounded-md transition-colors flex items-center justify-center space-x-1 disabled:opacity-50 w-full ${buttonContent.className}`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <>
            {buttonContent.icon}
            <span>{buttonContent.text}</span>
          </>
        )}
      </button>

      {/* Connection Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Connect with {targetUserName}</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Hi ${targetUserName}, I would like to connect with you...`}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectionManager;
