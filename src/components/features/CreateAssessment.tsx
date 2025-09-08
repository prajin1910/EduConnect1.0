import React, { useState } from "react";
import { assessmentAPI } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  Users,
  Save,
  Search,
  X,
  CheckCircle,
  FileText,
  BookOpen,
} from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface AssessmentForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  assignedTo: string[];
  questions: Question[];
}

interface StudentSuggestion {
  id: string;
  name: string;
  email: string;
  className: string;
  department: string;
}

const CreateAssessment: React.FC = () => {
  const [formData, setFormData] = useState<AssessmentForm>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    duration: 60,
    assignedTo: [],
    questions: [],
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSuggestions, setSuggestions] = useState<StudentSuggestion[]>(
    []
  );
  const [selectedStudents, setSelectedStudents] = useState<StudentSuggestion[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const { showToast } = useToast();

  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await assessmentAPI.searchStudents(query);
      setSuggestions(response);
      setShowSuggestions(true);
    } catch (error: any) {
      console.error("Search failed:", error);
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addStudent = (student: StudentSuggestion) => {
    if (!selectedStudents.find((s) => s.id === student.id)) {
      setSelectedStudents((prev) => [...prev, student]);
      setFormData((prev) => ({
        ...prev,
        assignedTo: [...prev.assignedTo, student.id],
      }));
    }
    setStudentSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeStudent = (studentId: string) => {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.filter((id) => id !== studentId),
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? value : opt
              ),
            }
          : q
      ),
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.questions.length === 0) {
      showToast("Please add at least one question", "error");
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        showToast(`Question ${i + 1} is empty`, "error");
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        showToast(`Question ${i + 1} has empty options`, "error");
        return;
      }
      if (!q.explanation.trim()) {
        showToast(`Question ${i + 1} needs an explanation`, "error");
        return;
      }
    }

    if (selectedStudents.length === 0) {
      showToast("Please assign at least one student", "error");
      return;
    }

    setLoading(true);
    try {
      const assessmentData = {
        ...formData,
        totalMarks: formData.questions.length,
      };

      await assessmentAPI.createAssessment(assessmentData);
      showToast("Assessment created and scheduled successfully!", "success");

      // Reset form
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        duration: 60,
        assignedTo: [],
        questions: [],
      });
      setSelectedStudents([]);
      setStudentSearch("");
    } catch (error: any) {
      showToast(error.message || "Failed to create assessment", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Create Assessment
              </h2>
              <p className="text-green-600 font-medium">
                Design and schedule new assessments
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formData.questions.length}
            </div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enhanced Basic Information */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Assessment Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Assessment Title
              </label>
              <input
                type="text"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg font-medium"
                placeholder="Enter assessment title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                required
                rows={4}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 resize-none"
                placeholder="Describe the assessment purpose and instructions..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                className="w-full p-4 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>

            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-4 border border-red-100">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-red-600" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                className="w-full p-4 border-2 border-red-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                Duration (minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-4 border-2 border-yellow-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value),
                  }))
                }
              />
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Assign Students
              </label>

              {/* Enhanced Selected Students */}
              {selectedStudents.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-3">
                  {selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-2xl text-sm flex items-center space-x-3 border border-green-200 shadow-sm"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">{student.name}</span>
                      <span className="text-green-600 font-medium">
                        ({student.email.split("@")[0]})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStudent(student.id)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full p-1 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced Student Search */}
              <div className="relative">
                <div className="flex">
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      searchStudents(e.target.value);
                    }}
                    placeholder="Search students by name, email, or ID (e.g., 23cs1554)"
                    className="flex-1 p-4 border-2 border-purple-200 rounded-l-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                  />
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-l-0 border-purple-200 rounded-r-2xl px-4 flex items-center">
                    <Search className="h-5 w-5 text-purple-600" />
                  </div>
                </div>

                {/* Enhanced Search Suggestions */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-6 text-center text-gray-500">
                        <div className="relative mx-auto w-8 h-8 mb-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200"></div>
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent absolute top-0"></div>
                        </div>
                        <p className="font-medium">Searching students...</p>
                      </div>
                    ) : studentSuggestions.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">No students found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try searching with name, email, or student ID
                        </p>
                      </div>
                    ) : (
                      studentSuggestions.map((student, index) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => addStudent(student)}
                          disabled={
                            selectedStudents.find(
                              (s) => s.id === student.id
                            ) !== undefined
                          }
                          className={`w-full text-left p-4 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                            index === 0 ? "rounded-t-2xl" : ""
                          } ${
                            index === studentSuggestions.length - 1
                              ? "rounded-b-2xl"
                              : "border-b border-gray-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {student.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {student.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {student.className} • {student.department}
                                </p>
                              </div>
                            </div>
                            {selectedStudents.find(
                              (s) => s.id === student.id
                            ) && (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <p className="text-sm text-purple-600 mt-2 font-medium">
                💡 Search by partial email (e.g., "23cs1554"), full email, or
                student name
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Questions Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Assessment Questions
                </h3>
                <p className="text-orange-600 font-medium">
                  {formData.questions.length} questions added
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
            >
              <Plus className="h-5 w-5" />
              <span>Add Question</span>
            </button>
          </div>

          {formData.questions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                No Questions Added Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create engaging questions to assess your students' understanding
              </p>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-3xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3 mx-auto"
              >
                <Plus className="h-6 w-6" />
                <span>Add Your First Question</span>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {formData.questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {qIndex + 1}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">
                        Question {qIndex + 1}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-2xl transition-all duration-300"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Question Text
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none"
                        placeholder="Enter your question here..."
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(qIndex, "question", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-4">
                        Answer Options
                      </label>
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                              question.correctAnswer === oIndex
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                                : "bg-gray-50 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() =>
                                updateQuestion(qIndex, "correctAnswer", oIndex)
                              }
                              className="w-5 h-5 text-green-600 focus:ring-green-500 focus:ring-2"
                            />
                            <span className="font-bold text-lg w-8 text-center bg-white rounded-xl px-2 py-1 shadow-sm">
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                            <input
                              type="text"
                              className="flex-1 p-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300"
                              placeholder={`Option ${String.fromCharCode(
                                65 + oIndex
                              )} - Enter answer choice`}
                              value={option}
                              onChange={(e) =>
                                updateOption(qIndex, oIndex, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-green-600 mt-3 font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Select the radio button next to the correct answer
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Explanation
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 resize-none"
                        placeholder="Explain why this is the correct answer and provide additional context..."
                        value={question.explanation}
                        onChange={(e) =>
                          updateQuestion(qIndex, "explanation", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Submit Button */}
        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={loading || formData.questions.length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-12 py-4 rounded-3xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center space-x-4"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                <span>Creating Assessment...</span>
              </>
            ) : (
              <>
                <Save className="h-6 w-6" />
                <span>Create Assessment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssessment;
