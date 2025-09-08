import {
  Calendar,
  Clock,
  Edit,
  Eye,
  FileText,
  Plus,
  Trash2,
  Users,
  X,
  Save,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import { assessmentAPI } from "../../services/api";

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
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(
    null
  );

  const { showToast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await assessmentAPI.getProfessorAssessments();
      setAssessments(response);
    } catch (error: any) {
      showToast(error.message || "Failed to fetch assessments", "error");
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentStatus = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    const endTime = new Date(assessment.endTime);

    if (now < startTime) return "upcoming";
    if (now > endTime) return "completed";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white";
      case "active":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white";
      case "completed":
        return "bg-gradient-to-r from-blue-400 to-indigo-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const canEdit = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    return now < startTime;
  };

  const handleEdit = (assessment: Assessment) => {
    if (!canEdit(assessment)) {
      showToast("Cannot edit assessment after it has started", "warning");
      return;
    }
    setEditingAssessment(assessment);
  };

  const handleSaveEdit = async (updatedAssessment: Assessment) => {
    try {
      await assessmentAPI.updateAssessment(
        updatedAssessment.id,
        updatedAssessment
      );
      setAssessments(
        assessments.map((a) =>
          a.id === updatedAssessment.id ? updatedAssessment : a
        )
      );
      setEditingAssessment(null);
      showToast("Assessment updated successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update assessment", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl p-6 border border-teal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                My Assessments
              </h2>
              <p className="text-teal-600 font-medium">
                Manage and track your assessments
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">
              {assessments.length}
            </div>
            <div className="text-sm text-gray-600">Total Created</div>
          </div>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-12 w-12 text-teal-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No Assessments Created
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Start creating assessments to evaluate your students' progress
          </p>
          <button
            onClick={() => navigate("/professor/create-assessment")}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-2xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-6 w-6" />
            <span className="font-semibold text-lg">
              Create Your First Assessment
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {assessments
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((assessment) => {
              const status = getAssessmentStatus(assessment);

              return (
                <div
                  key={assessment.id}
                  className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {assessment.title}
                            </h3>
                            <span
                              className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${getStatusColor(
                                status
                              )}`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {assessment.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-sm">
                                Start Time
                              </div>
                              <div className="text-green-600 font-semibold text-sm">
                                {new Date(
                                  assessment.startTime
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-sm">
                                End Time
                              </div>
                              <div className="text-red-600 font-semibold text-sm">
                                {new Date(assessment.endTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-sm">
                                Duration
                              </div>
                              <div className="text-yellow-600 font-semibold text-sm">
                                {assessment.duration} min
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-sm">
                                Students
                              </div>
                              <div className="text-purple-600 font-semibold text-sm">
                                {assessment.assignedTo.length} assigned
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      {canEdit(assessment) && (
                        <button
                          onClick={() => handleEdit(assessment)}
                          className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 group/btn"
                          title="Edit Assessment"
                        >
                          <Edit className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}

                      {status === "completed" && (
                        <button
                          className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all duration-300 group/btn"
                          title="View Results"
                        >
                          <Eye className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}

                      {canEdit(assessment) && (
                        <button
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 group/btn"
                          title="Delete Assessment"
                        >
                          <Trash2 className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600 font-medium">
                          {assessment.questions.length} questions
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600 font-medium">
                          {assessment.totalMarks} marks
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600 font-medium">
                          Created{" "}
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!canEdit(assessment) && status !== "completed" && (
                        <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-2xl">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-700 font-semibold text-sm">
                            Assessment is live
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Enhanced Edit Modal */}
      {editingAssessment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Edit Assessment</h3>
                    <p className="text-teal-100">
                      Modify assessment details before it starts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingAssessment(null)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Assessment Title
                    </label>
                    <input
                      type="text"
                      value={editingAssessment.title}
                      onChange={(e) =>
                        setEditingAssessment({
                          ...editingAssessment,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-lg font-medium"
                      placeholder="Enter assessment title..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Description
                    </label>
                    <textarea
                      value={editingAssessment.description}
                      onChange={(e) =>
                        setEditingAssessment({
                          ...editingAssessment,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 resize-none"
                      placeholder="Describe the assessment..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editingAssessment.startTime.slice(0, 16)}
                      onChange={(e) =>
                        setEditingAssessment({
                          ...editingAssessment,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editingAssessment.endTime.slice(0, 16)}
                      onChange={(e) =>
                        setEditingAssessment({
                          ...editingAssessment,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setEditingAssessment(null)}
                className="px-6 py-3 text-gray-600 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingAssessment)}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssessments;
