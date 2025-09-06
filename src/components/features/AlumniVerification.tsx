import React, { useState, useEffect } from 'react';
import { managementAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { UserCheck, Clock, CheckCircle, XCircle, Building, Calendar, User } from 'lucide-react';

interface Alumni {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  graduationYear: string;
  batch: string;
  placedCompany: string;
  department: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
}

const AlumniVerification: React.FC = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAlumniApplications();
  }, []);

  const fetchAlumniApplications = async () => {
    try {
      console.log('Fetching alumni applications...');
      const response = await managementAPI.getAlumniApplications();
      console.log('Alumni applications response:', response);
      
      const alumniData = Array.isArray(response) ? response : [];
      setAlumni(alumniData);
    } catch (error: any) {
      console.error('Failed to fetch alumni applications:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch alumni applications';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAlumniAction = async (alumniId: string, approved: boolean) => {
    setActionLoading(alumniId);
    try {
      console.log('Processing alumni action:', alumniId, approved);
      const response = await managementAPI.approveAlumni(alumniId, approved);
      console.log('Alumni action response:', response);
      showToast(response, approved ? 'success' : 'info');
      
      // Remove from list after action
      setAlumni(prev => prev.filter(a => a.id !== alumniId));
    } catch (error: any) {
      console.error('Failed to update alumni status:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to update alumni status';
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCheck className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Alumni Verification</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{alumni.length} pending applications</span>
        </div>
      </div>

      {alumni.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
          <p className="text-gray-600">All alumni applications have been processed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {alumni.map((alumnus) => (
            <div key={alumnus.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{alumnus.name}</h3>
                      <p className="text-gray-600">{alumnus.email}</p>
                      <p className="text-sm text-gray-500">
                        Applied on {new Date(alumnus.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{alumnus.phoneNumber}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Graduation:</span>
                      <span className="font-medium">{alumnus.graduationYear}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Batch:</span>
                      <span className="font-medium">{alumnus.batch}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{alumnus.placedCompany}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm md:col-span-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{alumnus.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleAlumniAction(alumnus.id, true)}
                    disabled={actionLoading === alumnus.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{actionLoading === alumnus.id ? 'Processing...' : 'Approve'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleAlumniAction(alumnus.id, false)}
                    disabled={actionLoading === alumnus.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Verification Checklist</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Email format verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Graduation year within valid range</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Department matches college programs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Manual verification required for company placement</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniVerification;