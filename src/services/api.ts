import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle auth errors for actual authentication failures, not for missing data
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || error.response?.data || '';
      
      // Only redirect on actual authentication failures, not on "not found" errors
      if (errorMessage.toLowerCase().includes('unauthorized') || 
          errorMessage.toLowerCase().includes('invalid token') ||
          errorMessage.toLowerCase().includes('token expired') ||
          errorMessage.toLowerCase().includes('access denied')) {
        
        console.log('Authentication token invalid, clearing storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on auth pages
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && 
            !currentPath.includes('/register') && 
            !currentPath.includes('/verify-otp')) {
          console.log('Redirecting to login due to authentication failure');
          window.location.href = '/login';
        }
      } else {
        // For other 401 errors (like "user not found"), don't redirect
        console.log('401 error but not authentication failure:', errorMessage);
      }
    } else if (error.response?.status === 403) {
      // Handle forbidden access without redirecting
      console.log('Access forbidden:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  verifyOTP: async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },
  
  resendOTP: async (email: string) => {
    const response = await api.post(`/auth/resend-otp?email=${email}`);
    return response.data;
  },
};

export const assessmentAPI = {
  generateAIAssessment: async (data: {
    domain: string;
    difficulty: string;
    numberOfQuestions: number;
  }) => {
    const response = await api.post('/assessments/generate-ai', data);
    return response.data;
  },
  
  getStudentAssessments: async () => {
    const response = await api.get('/assessments/student');
    return response.data;
  },
  
  submitAssessment: async (assessmentId: string, submission: any) => {
    const response = await api.post(`/assessments/${assessmentId}/submit`, submission);
    return response.data;
  },
  
  getAssessmentResults: async (assessmentId: string) => {
    const response = await api.get(`/assessments/${assessmentId}/results`);
    return response.data;
  },
  
  createAssessment: async (data: any) => {
    const response = await api.post('/assessments', data);
    return response.data;
  },
  
  getProfessorAssessments: async () => {
    const response = await api.get('/assessments/professor');
    return response.data;
  },
  
  searchStudents: async (query: string) => {
    const response = await api.get(`/assessments/search-students?query=${query}`);
    return response.data;
  },
  
  updateAssessment: async (assessmentId: string, data: any) => {
    const response = await api.put(`/assessments/${assessmentId}`, data);
    return response.data;
  },
};

export const taskAPI = {
  getUserTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  
  createTask: async (data: any) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  
  generateRoadmap: async (taskId: string) => {
    const response = await api.post(`/tasks/${taskId}/roadmap`);
    return response.data;
  },
  
  updateTaskStatus: async (taskId: string, status: string) => {
    const response = await api.put(`/tasks/${taskId}/status`, { status });
    return response.data;
  },
};

export const chatAPI = {
  sendAIMessage: async (message: string) => {
    const response = await api.post('/chat/ai', { message });
    return response.data;
  },
  
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/chat/users');
    return response.data;
  },
  
  markMessagesAsRead: async (userId: string) => {
    const response = await api.put(`/chat/mark-read/${userId}`);
    return response.data;
  },
  
  getChatHistory: async (userId: string) => {
    const response = await api.get(`/chat/history/${userId}`);
    return response.data;
  },
  
  sendMessage: async (data: any) => {
    const response = await api.post('/chat/send', data);
    return response.data;
  },
  
  getAlumniDirectory: async () => {
    const response = await api.get('/users/alumni-directory');
    return response.data;
  },
};

export const managementAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/management/stats');
    return response.data;
  },
  
  getStudentHeatmap: async (studentId: string) => {
    const response = await api.get(`/management/student/${studentId}/heatmap`);
    return response.data;
  },
  
  getAlumniApplications: async () => {
    const response = await api.get('/management/alumni');
    return response.data;
  },
  
  approveAlumni: async (alumniId: string, approved: boolean) => {
    const response = await api.put(`/management/alumni/${alumniId}/status`, { approved });
    return response.data;
  },
  
  searchStudents: async (email: string) => {
    const response = await api.get(`/management/students/search?email=${email}`);
    return response.data;
  },
  
  // Real alumni directory for students/professors
  getApprovedAlumni: async () => {
    const response = await api.get('/management/alumni-available');
    return response.data;
  },
  
  // Alumni Event Request Management
  getAllAlumniEventRequests: async () => {
    const response = await api.get('/management/alumni-event-requests');
    return response.data;
  },
  
  approveAlumniEventRequest: async (requestId: string) => {
    const response = await api.post(`/management/alumni-event-requests/${requestId}/approve`);
    return response.data;
  },
  
  rejectAlumniEventRequest: async (requestId: string, reason?: string) => {
    const response = await api.post(`/management/alumni-event-requests/${requestId}/reject`, { reason });
    return response.data;
  },
  
  // Management-to-Alumni Event Requests
  requestEventFromAlumni: async (alumniId: string, requestData: any) => {
    const response = await api.post(`/management/request-alumni-event/${alumniId}`, requestData);
    return response.data;
  },
  
  getAllManagementEventRequests: async () => {
    const response = await api.get('/management/management-event-requests');
    return response.data;
  },

  // Student ATS Analysis Management
  getStudentATSData: async (studentId: string) => {
    const response = await api.get(`/management/student/${studentId}/ats-data`);
    return response.data;
  },

  getAllStudentsATS: async () => {
    const response = await api.get('/management/students/ats-data');
    return response.data;
  },

  getStudentResume: async (studentId: string, resumeId: string) => {
    const response = await api.get(`/management/student/${studentId}/resume/${resumeId}`);
    return response.data;
  },

  downloadStudentResume: async (studentId: string, resumeId: string) => {
    const response = await api.get(`/management/student/${studentId}/resume/${resumeId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // AI-Powered Student Analysis
  analyzeStudentsBySkills: async (query: string) => {
    const response = await api.post('/management/ai-student-analysis', { query });
    return response.data;
  },

  searchStudentProfiles: async (criteria: any) => {
    const response = await api.post('/management/search-student-profiles', criteria);
    return response.data;
  },
};

export const studentAPI = {
  getProfile: async (userId: string) => {
    const response = await api.get(`/students/profile/${userId}`);
    return response.data;
  },
  
  getMyProfile: async () => {
    const response = await api.get('/students/my-profile');
    return response.data;
  },
  
  updateMyProfile: async (profileData: any) => {
    const response = await api.put('/students/my-profile', profileData);
    return response.data;
  },
  
  getAssessmentHistory: async (userId?: string) => {
    const endpoint = userId ? `/students/assessment-history/${userId}` : '/students/my-assessment-history';
    const response = await api.get(endpoint);
    return response.data;
  },
};

export const professorAPI = {
  getProfile: async (userId: string) => {
    const response = await api.get(`/professors/profile/${userId}`);
    return response.data;
  },
  
  getMyProfile: async () => {
    const response = await api.get('/professors/my-profile');
    return response.data;
  },
  
  updateMyProfile: async (profileData: any) => {
    const response = await api.put('/professors/my-profile', profileData);
    return response.data;
  },
  
  getTeachingStats: async (userId?: string) => {
    const endpoint = userId ? `/professors/teaching-stats/${userId}` : '/professors/my-teaching-stats';
    const response = await api.get(endpoint);
    return response.data;
  },
};

export const alumniAPI = {
  getProfile: async (userId: string) => {
    const response = await api.get(`/alumni/profile/${userId}`);
    return response.data;
  },
  
  submitEventRequest: async (requestData: any) => {
    const response = await api.post('/api/alumni-events/request', requestData);
    return response.data;
  },
  
  getApprovedEvents: async () => {
    const response = await api.get('/api/alumni-events/approved');
    return response.data;
  },
  
  // Management-to-Alumni Event Requests (Alumni side)
  getPendingManagementRequests: async () => {
    const response = await api.get('/alumni/pending-requests');
    return response.data;
  },
  
  acceptManagementEventRequest: async (requestId: string, responseMessage: string) => {
    const response = await api.post(`/alumni/accept-management-request/${requestId}`, { response: responseMessage });
    return response.data;
  },
  
  rejectManagementEventRequest: async (requestId: string, reason: string) => {
    const response = await api.post(`/alumni/reject-management-request/${requestId}`, { reason });
    return response.data;
  },
  
  getAlumniStats: async () => {
    const response = await api.get('/alumni/stats');
    return response.data;
  },
  
  // Alumni Profile Management
  getMyProfile: async () => {
    const response = await api.get('/alumni/my-profile');
    return response.data;
  },
  
  updateMyProfile: async (profileData: any) => {
    const response = await api.put('/alumni/my-profile', profileData);
    return response.data;
  },
  
  getCompleteProfile: async (userId: string) => {
    const response = await api.get(`/alumni-profiles/complete-profile/${userId}`);
    return response.data;
  },
  
  sendConnectionRequest: async (recipientId: string, message?: string) => {
    const response = await api.post('/connections/send-request', { recipientId, message: message || 'I would like to connect with you.' });
    return response.data;
  },
};

export const activityAPI = {
  logActivity: async (type: string, description: string) => {
    const response = await api.post('/activities', { type, description });
    return response.data;
  },
  
  getUserActivities: async (userId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/activities/user/${userId}?${params.toString()}`);
    return response.data;
  },
  
  getHeatmapData: async (userId: string) => {
    const response = await api.get(`/activities/heatmap/${userId}`);
    return response.data;
  },
};

export const connectionAPI = {
  sendConnectionRequest: async (recipientId: string, message: string) => {
    console.log('connectionAPI: Sending request to recipient ID:', recipientId);
    console.log('connectionAPI: Message:', message);
    const response = await api.post('/connections/send-request', { recipientId, message });
    console.log('connectionAPI: Response:', response.data);
    return response.data;
  },
  
  acceptConnectionRequest: async (connectionId: string) => {
    const response = await api.post(`/connections/${connectionId}/accept`);
    return response.data;
  },
  
  rejectConnectionRequest: async (connectionId: string) => {
    const response = await api.post(`/connections/${connectionId}/reject`);
    return response.data;
  },
  
  getPendingRequests: async () => {
    const response = await api.get('/connections/pending');
    return response.data;
  },
  
  getAcceptedConnections: async () => {
    const response = await api.get('/connections/accepted');
    return response.data;
  },
  
  getConnectionStatus: async (userId: string) => {
    console.log('connectionAPI: Checking connection status for user ID:', userId);
    const response = await api.get(`/connections/status/${userId}`);
    console.log('connectionAPI: Connection status response:', response.data);
    return response.data;
  },
  
  getConnectionCount: async () => {
    const response = await api.get('/connections/count');
    return response.data;
  },
};

export const passwordAPI = {
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },
};

export const resumeAPI = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getMyResumes: async () => {
    const response = await api.get('/resumes/my');
    return response.data;
  },
  
  getCurrentResume: async () => {
    const response = await api.get('/resumes/current');
    return response.data;
  },
  
  getResume: async (id: string) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },
  
  downloadResume: async (id: string) => {
    const response = await api.get(`/resumes/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  activateResume: async (id: string) => {
    const response = await api.put(`/resumes/${id}/activate`);
    return response.data;
  },
  
  deleteResume: async (id: string) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },
  
  updateResume: async (id: string, resumeData: any) => {
    const response = await api.put(`/resumes/${id}`, resumeData);
    return response.data;
  },
  
  renameResume: async (id: string, newName: string) => {
    const response = await api.put(`/resumes/${id}/rename`, { fileName: newName });
    return response.data;
  },
  
  analyzeResumeATS: async (id: string) => {
    const response = await api.post(`/resumes/${id}/analyze-ats`);
    return response.data;
  },
  
  sendATSToManagement: async (id: string) => {
    const response = await api.post(`/resumes/${id}/send-ats-to-management`);
    return response.data;
  },
  
  searchBySkill: async (skill: string) => {
    const response = await api.get(`/resumes/search?skill=${skill}`);
    return response.data;
  },
  
  getUserResume: async (userId: string) => {
    const response = await api.get(`/resumes/user/${userId}`);
    return response.data;
  },
};

export const resumeManagementAPI = {
  getAllStudentResumes: async () => {
    const response = await api.get('/resumes/management/all');
    return response.data;
  },
  
  getResumesWithATS: async () => {
    const response = await api.get('/resumes/management/with-ats');
    return response.data;
  },
  
  analyzeStudentProfiles: async (query: string) => {
    const response = await api.post('/resumes/management/analyze-students', { query });
    return response.data;
  },
  
  markResumeAsSent: async (id: string) => {
    const response = await api.post(`/resumes/management/${id}/mark-sent`);
    return response.data;
  },
};

// Alumni Directory API
export const alumniDirectoryAPI = {
  getAllVerifiedAlumni: async () => {
    const response = await api.get('/api/alumni-directory');
    return response.data;
  },

  getAllVerifiedAlumniForAlumni: async () => {
    const response = await api.get('/api/alumni-directory/for-alumni');
    return response.data;
  },

  getAlumniProfile: async (alumniId: string) => {
    const response = await api.get(`/api/alumni-directory/${alumniId}`);
    return response.data;
  },

  searchAlumni: async (query: string) => {
    const response = await api.get(`/api/alumni-directory/search?query=${query}`);
    return response.data;
  },

  getAlumniStatistics: async () => {
    const response = await api.get('/api/alumni-directory/statistics');
    return response.data;
  },
};

// Events API - Universal for all user types
export const eventsAPI = {
  getApprovedEvents: async () => {
    try {
      const response = await api.get('/api/events/approved');
      return response.data;
    } catch (error: any) {
      console.error('Events API error:', error);
      // If authenticated API fails, try debug endpoint as fallback
      try {
        const fallbackResponse = await fetch('http://localhost:8080/api/debug/events');
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          return data.events || [];
        }
      } catch (fallbackError) {
        console.error('Fallback events API also failed:', fallbackError);
      }
      throw error;
    }
  },

  updateAttendance: async (eventId: string, attending: boolean) => {
    const response = await api.post(`/api/events/${eventId}/attendance`, { attending });
    return response.data;
  },
};

export default api;
