import { AlertCircle, Bot, CheckCircle, Download, Edit3, FileCheck, FileText, Plus, Save, Send, Star, Trash2, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { resumeAPI } from '../../services/api';

interface Resume {
  id: string;
  fileName: string;
  originalFileName?: string;
  uploadedAt: string;
  isActive: boolean;
  fileSize?: number;
  fileType?: string;
  atsScore?: number;
  atsAnalysis?: ATSAnalysis;
  skills?: string[];
  experiences?: Experience[];
  educations?: Education[];
  certifications?: string[];
  summary?: string;
  contactInfo?: ContactInfo;
}

interface ATSAnalysis {
  detailedSummary?: string;
  overallScore: number;
  skillsScore: number;
  formattingScore: number;
  keywordsScore: number;
  experienceScore: number;
  educationScore: number;
  feedback: string[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  analyzedAt: string;
  sentToManagement?: boolean;
  sentAt?: string;
}

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
  achievements?: string[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  duration: string;
  grade?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

const ResumeManager: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [renamingResume, setRenamingResume] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [activeTab, setActiveTab] = useState<'manage' | 'ats'>('manage');
  const [selectedResumeForATS, setSelectedResumeForATS] = useState<Resume | null>(null);
  const [atsAnalyzing, setAtsAnalyzing] = useState(false);
  const [showATSResults, setShowATSResults] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    loadResumes();
    loadCurrentResume();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await resumeAPI.getMyResumes();
      setResumes(response);
    } catch (error: any) {
      showToast('Failed to load resumes', 'error');
    }
  };

  const loadCurrentResume = async () => {
    try {
      const response = await resumeAPI.getCurrentResume();
      setCurrentResume(response);
    } catch (error: any) {
      // No current resume is fine
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload a PDF, DOC, or DOCX file', 'error');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }

    setUploading(true);
    try {
      await resumeAPI.uploadResume(file);

      showToast('Resume uploaded successfully!', 'success');
      setShowUpload(false);
      loadResumes();
      loadCurrentResume();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to upload resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  const activateResume = async (resumeId: string) => {
    try {
      await resumeAPI.activateResume(resumeId);
      showToast('Resume activated successfully!', 'success');
      loadResumes();
      loadCurrentResume();
    } catch (error: any) {
      showToast('Failed to activate resume', 'error');
    }
  };

  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      await resumeAPI.deleteResume(resumeId);
      showToast('Resume deleted successfully!', 'success');
      loadResumes();
      loadCurrentResume();
    } catch (error: any) {
      showToast('Failed to delete resume', 'error');
    }
  };

  const renameResume = async (resumeId: string, newName: string) => {
    try {
      await resumeAPI.renameResume(resumeId, newName);
      showToast('Resume renamed successfully!', 'success');
      setRenamingResume(null);
      setNewFileName('');
      loadResumes();
      loadCurrentResume();
    } catch (error: any) {
      showToast('Failed to rename resume', 'error');
    }
  };

  const analyzeResumeWithATS = async (resume: Resume) => {
    console.log('Starting ATS analysis for resume:', resume.id);
    setSelectedResumeForATS(resume);
    setAtsAnalyzing(true);
    
    try {
      console.log('Calling ATS analysis API...');
      const updatedResume = await resumeAPI.analyzeResumeATS(resume.id);
      console.log('ATS analysis response received:', updatedResume);
      
      // The backend now returns the full updated resume with ATS analysis
      setSelectedResumeForATS(updatedResume);
      setShowATSResults(true);
      showToast('ATS analysis completed!', 'success');
      loadResumes(); // Refresh to get updated data
    } catch (error: any) {
      console.error('ATS analysis failed:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to analyze resume';
      showToast(errorMessage, 'error');
    } finally {
      setAtsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getATSScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const downloadResume = async (resumeId: string, fileName: string) => {
    try {
      const blob = await resumeAPI.downloadResume(resumeId);

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      showToast('Failed to download resume', 'error');
    }
  };

  const saveResumeData = async () => {
    if (!editingResume) return;

    try {
      await resumeAPI.updateResume(editingResume.id, editingResume);
      showToast('Resume data updated successfully!', 'success');
      setEditingResume(null);
      loadResumes();
      loadCurrentResume();
    } catch (error: any) {
      showToast('Failed to update resume data', 'error');
    }
  };

  const addSkill = () => {
    if (!editingResume) return;
    setEditingResume({
      ...editingResume,
      skills: [...(editingResume.skills || []), '']
    });
  };

  const updateSkill = (index: number, value: string) => {
    if (!editingResume) return;
    const skills = [...(editingResume.skills || [])];
    skills[index] = value;
    setEditingResume({ ...editingResume, skills });
  };

  const removeSkill = (index: number) => {
    if (!editingResume) return;
    const skills = editingResume.skills?.filter((_, i) => i !== index) || [];
    setEditingResume({ ...editingResume, skills });
  };

  const addExperience = () => {
    if (!editingResume) return;
    const newExperience: Experience = {
      company: '',
      position: '',
      duration: '',
      description: '',
      achievements: []
    };
    setEditingResume({
      ...editingResume,
      experiences: [...(editingResume.experiences || []), newExperience]
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    if (!editingResume) return;
    const experiences = [...(editingResume.experiences || [])];
    experiences[index] = { ...experiences[index], [field]: value };
    setEditingResume({ ...editingResume, experiences });
  };

  const removeExperience = (index: number) => {
    if (!editingResume) return;
    const experiences = editingResume.experiences?.filter((_, i) => i !== index) || [];
    setEditingResume({ ...editingResume, experiences });
  };

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Current Resume */}
      {currentResume && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Resume</h3>
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Active</span>
              </span>
              {currentResume.atsScore && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getATSScoreBg(currentResume.atsScore)} ${getATSScoreColor(currentResume.atsScore)}`}>
                  ATS: {currentResume.atsScore}%
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-orange-600" />
              <div>
                <p className="font-medium">{currentResume.fileName}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Uploaded {new Date(currentResume.uploadedAt).toLocaleDateString()}</span>
                  {currentResume.fileSize && <span>{formatFileSize(currentResume.fileSize)}</span>}
                  {currentResume.fileType && <span>{currentResume.fileType.toUpperCase()}</span>}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => downloadResume(currentResume.id, currentResume.fileName)}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Display resume data if available */}
          {currentResume.skills && currentResume.skills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {currentResume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Resumes */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">All Resumes ({resumes.length})</h3>
        
        {resumes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resumes Uploaded</h3>
            <p className="text-gray-600">Upload your first resume to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`border rounded-lg p-4 transition-all ${
                  resume.isActive 
                    ? 'border-green-200 bg-green-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-orange-600" />
                    <div className="flex-1">
                      {renamingResume === resume.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Enter new name"
                            autoFocus
                          />
                          <button
                            onClick={() => renameResume(resume.id, newFileName)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setRenamingResume(null);
                              setNewFileName('');
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="font-medium">{resume.fileName}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</span>
                        {resume.fileSize && <span>{formatFileSize(resume.fileSize)}</span>}
                        {resume.fileType && <span>{resume.fileType.toUpperCase()}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {resume.isActive && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>Active</span>
                      </span>
                    )}
                    
                    {resume.atsScore && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getATSScoreBg(resume.atsScore)} ${getATSScoreColor(resume.atsScore)}`}>
                        ATS: {resume.atsScore}%
                      </span>
                    )}
                    
                    <div className="flex space-x-1">
                      {!resume.isActive && (
                        <button
                          onClick={() => activateResume(resume.id)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Set as Active Resume"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setRenamingResume(resume.id);
                          setNewFileName(resume.fileName);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Rename Resume"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteResume(resume.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderATSTab = () => (
    <div className="space-y-6">
      {/* ATS Score Checker Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">AI-Powered ATS Score Checker</h3>
            <p className="text-blue-700">Get detailed feedback on your resume's ATS compatibility</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-4 w-4 text-blue-600" />
            <span>Comprehensive Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-blue-600" />
            <span>AI-Powered Recommendations</span>
          </div>
          <div className="flex items-center space-x-2">
            <Send className="h-4 w-4 text-blue-600" />
            <span>Send to Management</span>
          </div>
        </div>
      </div>

      {/* Resume Selection for ATS */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Select Resume for ATS Analysis</h3>
        
        {resumes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resumes Available</h3>
            <p className="text-gray-600">Upload a resume first to analyze its ATS score.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedResumeForATS?.id === resume.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedResumeForATS(resume)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-orange-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{resume.fileName}</p>
                      {resume.isActive && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
                      {resume.atsScore && (
                        <span className={`font-medium ${getATSScoreColor(resume.atsScore)}`}>
                          ATS: {resume.atsScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {resume.atsAnalysis && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Last analyzed: {new Date(resume.atsAnalysis.analyzedAt).toLocaleDateString()}
                      </span>
                      {resume.atsAnalysis.sentToManagement && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Sent to Management
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {selectedResumeForATS && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => analyzeResumeWithATS(selectedResumeForATS)}
                disabled={atsAnalyzing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Bot className="h-4 w-4" />
                <span>{atsAnalyzing ? 'Analyzing...' : 'Analyze with AI'}</span>
              </button>
              
              {selectedResumeForATS.atsAnalysis && (
                <button
                  onClick={() => setShowATSResults(true)}
                  className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>View Results</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold">Resume Manager</h2>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manage Resumes
            </button>
            <button
              onClick={() => setActiveTab('ats')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ats'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bot className="h-4 w-4 inline mr-2" />
              ATS Score Checker
            </button>
          </div>
        </div>
        
        {activeTab === 'manage' && (
          <button
            onClick={() => setShowUpload(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Resume</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'manage' ? renderManageTab() : renderATSTab()}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Resume</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Choose a resume file to upload
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
            
            {uploading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                  <span className="text-sm text-gray-600">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATS Results Modal */}
      {showATSResults && selectedResumeForATS?.atsAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">ATS Analysis Results</h3>
                  <p className="text-sm text-gray-600">{selectedResumeForATS.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowATSResults(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Detailed Summary */}
              {selectedResumeForATS.atsAnalysis.detailedSummary && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <span>AI Resume Analysis Summary</span>
                  </h4>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    {selectedResumeForATS.atsAnalysis.detailedSummary.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="text-sm">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Score */}
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className={`text-4xl font-bold mb-2 ${getATSScoreColor(selectedResumeForATS.atsAnalysis.overallScore)}`}>
                  {selectedResumeForATS.atsAnalysis.overallScore}%
                </div>
                <p className="text-gray-600">Overall ATS Score</p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-semibold ${getATSScoreColor(selectedResumeForATS.atsAnalysis.skillsScore)}`}>
                    {selectedResumeForATS.atsAnalysis.skillsScore}%
                  </div>
                  <p className="text-sm text-gray-600">Skills</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-semibold ${getATSScoreColor(selectedResumeForATS.atsAnalysis.formattingScore)}`}>
                    {selectedResumeForATS.atsAnalysis.formattingScore}%
                  </div>
                  <p className="text-sm text-gray-600">Formatting</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-semibold ${getATSScoreColor(selectedResumeForATS.atsAnalysis.keywordsScore)}`}>
                    {selectedResumeForATS.atsAnalysis.keywordsScore}%
                  </div>
                  <p className="text-sm text-gray-600">Keywords</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-semibold ${getATSScoreColor(selectedResumeForATS.atsAnalysis.experienceScore)}`}>
                    {selectedResumeForATS.atsAnalysis.experienceScore}%
                  </div>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-semibold ${getATSScoreColor(selectedResumeForATS.atsAnalysis.educationScore)}`}>
                    {selectedResumeForATS.atsAnalysis.educationScore}%
                  </div>
                  <p className="text-sm text-gray-600">Education</p>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Strengths</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedResumeForATS.atsAnalysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-700 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Areas for Improvement</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedResumeForATS.atsAnalysis.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">{weakness}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700">AI Recommendations</h4>
                <div className="space-y-2">
                  {selectedResumeForATS.atsAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              {selectedResumeForATS.atsAnalysis.missingKeywords.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-orange-700">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResumeForATS.atsAnalysis.missingKeywords.map((keyword, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-center">
              <button
                onClick={() => setShowATSResults(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Resume</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Choose a resume file to upload
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
            
            {uploading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                  <span className="text-sm text-gray-600">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Resume Data Modal */}
      {editingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Resume Data</h3>
              <button
                onClick={() => setEditingResume(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  value={editingResume.summary || ''}
                  onChange={(e) => setEditingResume({ ...editingResume, summary: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief professional summary..."
                />
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Skills</label>
                  <button
                    onClick={addSkill}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Skill</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {(editingResume.skills || []).map((skill, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Skill name"
                      />
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <button
                    onClick={addExperience}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Experience</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {(editingResume.experiences || []).map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="Company"
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          placeholder="Position"
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                          placeholder="Duration (e.g., 2020-2022)"
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Job description and responsibilities"
                        rows={3}
                        className="w-full mt-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingResume(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveResumeData}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeManager;
