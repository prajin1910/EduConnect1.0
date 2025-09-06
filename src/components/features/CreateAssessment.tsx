import React, { useState } from 'react';
import { assessmentAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, Calendar, Clock, Users, Save, Search, X, CheckCircle } from 'lucide-react';

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
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 60,
    assignedTo: [],
    questions: []
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSuggestions, setSuggestions] = useState<StudentSuggestion[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<StudentSuggestion[]>([]);
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
      console.error('Search failed:', error);
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addStudent = (student: StudentSuggestion) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(prev => [...prev, student]);
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, student.id]
      }));
    }
    setStudentSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeStudent = (studentId: string) => {
    setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(id => id !== studentId)
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.questions.length === 0) {
      showToast('Please add at least one question', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        showToast(`Question ${i + 1} is empty`, 'error');
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        showToast(`Question ${i + 1} has empty options`, 'error');
        return;
      }
      if (!q.explanation.trim()) {
        showToast(`Question ${i + 1} needs an explanation`, 'error');
        return;
      }
    }

    if (selectedStudents.length === 0) {
      showToast('Please assign at least one student', 'error');
      return;
    }

    setLoading(true);
    try {
      const assessmentData = {
        ...formData,
        totalMarks: formData.questions.length
      };

      await assessmentAPI.createAssessment(assessmentData);
      showToast('Assessment created and scheduled successfully!', 'success');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: 60,
        assignedTo: [],
        questions: []
      });
      setSelectedStudents([]);
      setStudentSearch('');
    } catch (error: any) {
      showToast(error.message || 'Failed to create assessment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Plus className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold">Create Assessment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Assessment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Title
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter assessment title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe the assessment"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="inline h-4 w-4 mr-1" />
                Assign Students
              </label>
              
              {/* Selected Students */}
              {selectedStudents.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{student.name}</span>
                      <span className="text-green-600">({student.email.split('@')[0]})</span>
                      <button
                        type="button"
                        onClick={() => removeStudent(student.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Student Search */}
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
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <div className="bg-gray-50 border-t border-r border-b border-gray-300 rounded-r-lg px-3 flex items-center">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Search Suggestions */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : studentSuggestions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No students found</p>
                        <p className="text-xs text-gray-400 mt-1">Try searching with name, email, or student ID</p>
                      </div>
                    ) : (
                      studentSuggestions.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => addStudent(student)}
                          disabled={selectedStudents.find(s => s.id === student.id) !== undefined}
                          className="w-full text-left p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-gray-600">{student.email}</p>
                              <p className="text-xs text-gray-500">{student.className} • {student.department}</p>
                            </div>
                            {selectedStudents.find(s => s.id === student.id) && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Search by partial email (e.g., "23cs1554"), full email, or student name
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>

          {formData.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No questions added yet. Click "Add Question" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Question {qIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text
                      </label>
                      <textarea
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your question"
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <span className="font-medium text-sm w-6">
                              {String.fromCharCode(65 + oIndex)}.
                            </span>
                            <input
                              type="text"
                              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation
                      </label>
                      <textarea
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Explain why this is the correct answer"
                        value={question.explanation}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || formData.questions.length === 0}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Creating...' : 'Create Assessment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssessment;