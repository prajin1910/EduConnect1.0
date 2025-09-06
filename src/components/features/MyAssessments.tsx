import { Calendar, Clock, Edit, Eye, FileText, Plus, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { assessmentAPI } from '../../services/api';

interface Assessment {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  questions: any[];
  assignedTo: string[];
  createdAt: string;
}

const MyAssessments: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await assessmentAPI.getProfessorAssessments();
      setAssessments(response);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentStatus = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    const endTime = new Date(assessment.endTime);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'completed';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    return now < startTime;
  };

  const handleEdit = (assessment: Assessment) => {
    if (!canEdit(assessment)) {
      showToast('Cannot edit assessment after it has started', 'warning');
      return;
    }
    setEditingAssessment(assessment);
  };

  const handleSaveEdit = async (updatedAssessment: Assessment) => {
    try {
      await assessmentAPI.updateAssessment(updatedAssessment.id, updatedAssessment);
      setAssessments(assessments.map(a => a.id === updatedAssessment.id ? updatedAssessment : a));
      setEditingAssessment(null);
      showToast('Assessment updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update assessment', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold">My Assessments</h2>
        </div>
        <div className="text-sm text-gray-600">
          {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} created
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Created</h3>
          <p className="text-gray-600 mb-4">You haven't created any assessments yet.</p>
          <button 
            onClick={() => navigate('/professor/create-assessment')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First Assessment</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {assessments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((assessment) => {
              const status = getAssessmentStatus(assessment);
              
              return (
                <div key={assessment.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{assessment.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{assessment.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Start</div>
                            <div>{new Date(assessment.startTime).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <div className="font-medium">End</div>
                            <div>{new Date(assessment.endTime).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Duration</div>
                            <div>{assessment.duration} minutes</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Students</div>
                            <div>{assessment.assignedTo.length} assigned</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {canEdit(assessment) && (
                        <button
                          onClick={() => handleEdit(assessment)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Assessment"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      )}
                      
                      {status === 'completed' && (
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="View Results"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                      
                      {canEdit(assessment) && (
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Assessment"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{assessment.questions.length} questions</span>
                      <span>{assessment.totalMarks} marks</span>
                      <span>Created {new Date(assessment.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!canEdit(assessment) && status !== 'completed' && (
                        <span className="text-sm text-gray-500">Assessment is live</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Edit Modal would go here */}
      {editingAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Assessment</h3>
            <p className="text-gray-600 mb-4">
              You can only edit the title, description, and timing before the assessment starts.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingAssessment.title}
                  onChange={(e) => setEditingAssessment({...editingAssessment, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingAssessment.description}
                  onChange={(e) => setEditingAssessment({...editingAssessment, description: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={editingAssessment.startTime.slice(0, 16)}
                    onChange={(e) => setEditingAssessment({...editingAssessment, startTime: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={editingAssessment.endTime.slice(0, 16)}
                    onChange={(e) => setEditingAssessment({...editingAssessment, endTime: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingAssessment(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingAssessment)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssessments;