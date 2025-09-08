import { Calendar, CheckCircle, Clock, FileText, Play, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { activityAPI, assessmentAPI } from '../../services/api';

interface Assessment {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const ClassAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startedAt, setStartedAt] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAssessments, setSubmittedAssessments] = useState<Set<string>>(new Set());

  const { showToast } = useToast();

  useEffect(() => {
    fetchAssessments();
    loadSubmissionStatus();
  }, []);

  useEffect(() => {
    let timer: number;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const loadSubmissionStatus = () => {
    try {
      const submitted = JSON.parse(localStorage.getItem('submittedAssessments') || '[]');
      setSubmittedAssessments(new Set(submitted));
      console.log('ClassAssessments: Loaded submitted assessments:', submitted);
    } catch (error) {
      console.error('Error loading submission status:', error);
      setSubmittedAssessments(new Set());
    }
  };

  const saveSubmissionStatus = (assessmentId: string) => {
    try {
      const currentSubmitted = JSON.parse(localStorage.getItem('submittedAssessments') || '[]');
      const updatedSubmitted = [...new Set([...currentSubmitted, assessmentId])];
      localStorage.setItem('submittedAssessments', JSON.stringify(updatedSubmitted));
      setSubmittedAssessments(new Set(updatedSubmitted));
      console.log('ClassAssessments: Saved submission status for assessment:', assessmentId);
    } catch (error) {
      console.error('Error saving submission status:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      console.log('ClassAssessments: Fetching student assessments...');
      const response = await assessmentAPI.getStudentAssessments();
      console.log('ClassAssessments: Assessments loaded:', response.length);
      setAssessments(response);
    } catch (error: any) {
      console.error('ClassAssessments: Error fetching assessments:', error);
      // Don't show error toast if it's just no assessments available
      if (error.response?.status !== 404) {
        showToast(error.message || 'Failed to fetch assessments', 'error');
      }
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    const endTime = new Date(assessment.endTime);

    if (now < startTime) {
      showToast('Assessment has not started yet', 'warning');
      return;
    }

    if (now > endTime) {
      showToast('Assessment has ended', 'error');
      return;
    }

    // Check if already submitted - this is the key check
    if (submittedAssessments.has(assessment.id)) {
      showToast('You have already submitted this assessment', 'warning');
      return;
    }

    setActiveAssessment(assessment);
    setAnswers(new Array(assessment.questions.length).fill(-1));
    setCurrentQuestion(0);
    setTimeLeft(Math.min(assessment.duration * 60, Math.floor((endTime.getTime() - now.getTime()) / 1000)));
    setIsActive(true);
    setStartedAt(now.toISOString());
    setShowResults(false);
    setResults(null);
    
    showToast('Assessment started! Good luck!', 'info');
  };

  const submitAssessment = async () => {
    if (!activeAssessment) return;
    
    // Prevent double submission
    if (isSubmitting) return;

    setIsActive(false);
    setIsSubmitting(true);
    
    try {
      // Validate that all questions have been answered
      const unansweredQuestions = answers.filter(answer => answer === -1);
      if (unansweredQuestions.length > 0) {
        const proceedAnyway = window.confirm(
          `You have ${unansweredQuestions.length} unanswered question(s). Do you want to submit anyway?`
        );
        if (!proceedAnyway) {
          setIsActive(true);
          setIsSubmitting(false);
          return;
        }
      }

      const submission = {
        answers: answers.map((answer, index) => ({
          questionIndex: index,
          selectedAnswer: answer
        })),
        startedAt
      };

      console.log('Submitting assessment:', submission);

      const result = await assessmentAPI.submitAssessment(activeAssessment.id, submission);
      
      // Check if result is valid
      if (result && typeof result === 'object') {
        setResults(result);
        setShowResults(true);
        
        // Mark assessment as submitted and save to localStorage
        saveSubmissionStatus(activeAssessment.id);
        
        // Log activity
        try {
          await activityAPI.logActivity('ASSESSMENT_COMPLETED', `Completed assessment: ${activeAssessment.title}`);
        } catch (activityError) {
          console.warn('Failed to log activity:', activityError);
        }
        
        showToast('Assessment submitted successfully!', 'success');
        setActiveAssessment(null);
        setIsActive(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Assessment submission error:', error);
      let errorMessage = 'Failed to submit assessment';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 400) {
          const errorData = error.response.data;
          if (typeof errorData === 'object' && errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else {
            errorMessage = 'Invalid submission data. Please check your answers and try again.';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          // Redirect to login if session expired
          window.location.href = '/login';
          return;
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to submit this assessment.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
      // Re-enable the assessment if submission fails
      setIsActive(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAssessmentActive = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    const endTime = new Date(assessment.endTime);
    return now >= startTime && now <= endTime;
  };

  const getAssessmentStatus = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    const endTime = new Date(assessment.endTime);

    // MOST IMPORTANT: Check if submitted first, regardless of time
    if (submittedAssessments.has(assessment.id)) {
      return 'completed';
    }

    // Only show missed if NOT submitted and time has passed
    if (now > endTime) {
      return 'missed';
    }

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'missed';
    return 'active';
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'Assessment Submitted', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'missed': return { text: 'Assessment Missed', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'upcoming': return { text: 'Upcoming', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case 'active': return { text: 'Active Now', color: 'text-green-600', bgColor: 'bg-green-50' };
      default: return { text: status, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Assessment Completed!</h2>
            <p className="text-gray-600">Here's your performance summary</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{results.score}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">{results.totalMarks - results.score}</div>
              <div className="text-sm text-gray-600">Wrong</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{results.totalMarks}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{results.percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detailed Feedback</h3>
            {results.feedback.map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  {item.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">Question {index + 1}</span>
                </div>
                
                <p className="text-gray-700">{item.question}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-red-600">Your Answer: </span>
                    {item.selectedOption}
                  </div>
                  <div>
                    <span className="font-medium text-green-600">Correct Answer: </span>
                    {item.correctOption}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">Explanation: </span>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setShowResults(false);
              setResults(null);
              setActiveAssessment(null);
              fetchAssessments(); // Refresh the list
            }}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (activeAssessment && isActive) {
    const currentQ = activeAssessment.questions[currentQuestion];
    
    return (
      <div className="space-y-6">
        {/* Timer and Progress */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-600">Time Left: {formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {activeAssessment.questions.length}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / activeAssessment.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = index;
                  setAnswers(newAnswers);
                }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            
            {currentQuestion === activeAssessment.questions.length - 1 ? (
              <button
                onClick={submitAssessment}
                disabled={isSubmitting}
                className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Assessment</span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Class Assessments</h2>
      </div>

      {assessments.length === 0 ? (
                <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">No Assessments Available</h3>
          <p className="text-gray-600">No assessments found for your courses.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assessments.map((assessment) => {
            const status = getAssessmentStatus(assessment);
            const isActiveNow = isAssessmentActive(assessment);
            const isSubmitted = submittedAssessments.has(assessment.id);
            const statusDisplay = getStatusDisplay(status);
            
            return (
              <div key={assessment.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{assessment.title}</h3>
                    <p className="text-gray-600 mb-3">{assessment.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                      {statusDisplay.text}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status === 'active' ? 'bg-green-100 text-green-800' :
                      status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                      status === 'missed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status === 'active' ? 'Active' : 
                       status === 'upcoming' ? 'Upcoming' : 
                       status === 'missed' ? 'Ended' : 
                       status === 'completed' ? 'Submitted' : 'Unknown'}
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Start: {new Date(assessment.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>End: {new Date(assessment.endTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {assessment.duration} min</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Questions: {assessment.questions.length}</span>
                  </div>
                </div>

                {isActiveNow && !isSubmitted && status !== 'completed' && (
                  <button
                    onClick={() => startAssessment(assessment)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Assessment</span>
                  </button>
                )}

                {(status === 'completed' || isSubmitted) && (
                  <div className="text-center py-3 text-blue-600 font-medium flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Assessment Submitted Successfully</span>
                  </div>
                )}

                {status === 'upcoming' && (
                  <div className="text-center py-3 text-gray-600">
                    Assessment will be available at the scheduled time
                  </div>
                )}

                {status === 'missed' && !isSubmitted && (
                  <div className="text-center py-3 text-red-600 font-medium">
                    Assessment Deadline Passed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassAssessments;