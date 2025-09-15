import { Award, Briefcase, Building, Clock, DollarSign, Edit, Globe, Mail, MapPin, Phone, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface Job {
  id: string;
  title: string;
  company: string;
  companyDescription?: string;
  companyWebsite?: string;
  location: string;
  workMode?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  salary?: string;
  salaryMin?: string;
  salaryMax?: string;
  currency?: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  benefits?: string[];
  skillsRequired?: string[];
  experienceLevel?: string;
  minExperience?: number;
  maxExperience?: number;
  educationLevel?: string;
  industry?: string;
  department?: string;
  employmentDuration?: string;
  applicationDeadline?: string;
  postedBy: string;
  postedByName: string;
  postedByEmail: string;
  postedByDesignation?: string;
  postedByCompany?: string;
  postedAt: string;
  applicationUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  viewCount?: number;
  applicationCount?: number;
}

const JobBoardFixed: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    companyDescription: '',
    companyWebsite: '',
    location: '',
    workMode: 'On-site',
    type: 'FULL_TIME' as Job['type'],
    salary: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    skillsRequired: [''],
    experienceLevel: 'Mid',
    minExperience: 0,
    maxExperience: 5,
    educationLevel: 'Bachelor',
    industry: '',
    department: '',
    employmentDuration: 'Permanent',
    applicationDeadline: '',
    applicationUrl: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      console.log('JobBoardFixed: Loading jobs...');
      const response = await api.get('/jobs');
      console.log('JobBoardFixed: Jobs loaded:', response.data.length);
      setJobs(response.data);
    } catch (error: any) {
      console.error('JobBoardFixed: Error loading jobs:', error);
      // Don't show error toast if it's just no jobs available
      if (error.response?.status !== 404) {
        showToast('Failed to load jobs', 'error');
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        responsibilities: formData.responsibilities.filter(resp => resp.trim()),
        benefits: formData.benefits.filter(ben => ben.trim()),
        skillsRequired: formData.skillsRequired.filter(skill => skill.trim())
      };

      if (editingJob) {
        // Update existing job
        const response = await api.put(`/jobs/${editingJob.id}`, jobData);
        setJobs(jobs.map(job => job.id === editingJob.id ? response.data : job));
        showToast('Job updated successfully', 'success');
      } else {
        // Create new job
        const response = await api.post('/jobs', jobData);
        setJobs([response.data, ...jobs]);
        showToast('Job posted successfully', 'success');
      }
      
      setShowCreateForm(false);
      resetForm();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save job', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      companyDescription: '',
      companyWebsite: '',
      location: '',
      workMode: 'On-site',
      type: 'FULL_TIME',
      salary: '',
      salaryMin: '',
      salaryMax: '',
      currency: 'INR',
      description: '',
      requirements: [''],
      responsibilities: [''],
      benefits: [''],
      skillsRequired: [''],
      experienceLevel: 'Mid',
      minExperience: 0,
      maxExperience: 5,
      educationLevel: 'Bachelor',
      industry: '',
      department: '',
      employmentDuration: 'Permanent',
      applicationDeadline: '',
      applicationUrl: '',
      contactEmail: '',
      contactPhone: ''
    });
    setEditingJob(null);
  };

  const addArrayField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev as any)[field], '']
    }));
  };

  const updateArrayField = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const canEditJob = (job: Job) => {
    return user?.role === 'ALUMNI' && user?.id === job.postedBy;
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(job => job.id !== jobId));
      showToast('Job deleted successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete job', 'error');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      companyDescription: job.companyDescription || '',
      companyWebsite: job.companyWebsite || '',
      location: job.location,
      workMode: job.workMode || 'On-site',
      type: job.type,
      salary: job.salary || '',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      currency: job.currency || 'INR',
      description: job.description,
      requirements: job.requirements || [''],
      responsibilities: job.responsibilities || [''],
      benefits: job.benefits || [''],
      skillsRequired: job.skillsRequired || [''],
      experienceLevel: job.experienceLevel || 'Mid',
      minExperience: job.minExperience || 0,
      maxExperience: job.maxExperience || 5,
      educationLevel: job.educationLevel || 'Bachelor',
      industry: job.industry || '',
      department: job.department || '',
      employmentDuration: job.employmentDuration || 'Permanent',
      applicationDeadline: job.applicationDeadline || '',
      applicationUrl: job.applicationUrl || '',
      contactEmail: job.contactEmail || '',
      contactPhone: job.contactPhone || ''
    });
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-900">Loading Opportunities</p>
          <p className="text-sm text-gray-600">Fetching the latest career openings for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Career Opportunities</h2>
              <p className="text-gray-600 text-sm">Discover exciting positions from our alumni network</p>
            </div>
          </div>
          {user?.role === 'ALUMNI' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Post Position</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {editingJob ? 'Edit Position' : 'Post New Position'}
              </h3>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-orange-500" />
                <span>Position Details</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData(prev => ({ ...prev, workMode: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Job['type'] }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Job Description *</h4>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Mail className="h-5 w-5 text-orange-500" />
                <span>Contact Information</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="hr@company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Application URL</label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationUrl: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://company.com/careers/job-id"
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              >
                {editingJob ? 'Update Position' : 'Publish Position'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Positions Available</h3>
          <p className="text-gray-600 mb-4">Be the first to share an exciting career opportunity!</p>
          {user?.role === 'ALUMNI' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Post the First Position
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div key={job.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {/* Job Header */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 space-y-3 lg:space-y-0">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {job.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      job.type === 'FULL_TIME' ? 'bg-green-100 text-green-800' :
                      job.type === 'INTERNSHIP' ? 'bg-blue-100 text-blue-800' :
                      job.type === 'PART_TIME' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {job.type.replace('_', '-')}
                    </span>
                    {job.workMode && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {job.workMode}
                      </span>
                    )}
                  </div>
                  
                  {/* Company & Location Row */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold">{job.company}</span>
                      {job.companyWebsite && (
                        <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-orange-500">
                          <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span>{job.location}</span>
                    </div>
                    {(job.salaryMin && job.salaryMax) && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-600">
                          {job.salaryMin}-{job.salaryMax} {job.currency}
                        </span>
                      </div>
                    )}
                    {job.experienceLevel && (
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-orange-500" />
                        <span>{job.experienceLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Posted Info */}
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Posted by {job.postedByName}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                    {job.applicationDeadline && (
                      <>
                        <span className="mx-2">•</span>
                        <div className="flex items-center space-x-1 text-red-500">
                          <Clock className="h-3 w-3" />
                          <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {canEditJob(job) && (
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEditJob(job)}
                        className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg" 
                        title="Edit Job"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                        title="Delete Job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              {/* Skills and Requirements */}
              {(job.skillsRequired && job.skillsRequired.length > 0) && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills Required:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill, skillIndex) => (
                      <span key={skillIndex} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Apply */}
              <div className="flex flex-col sm:flex-row gap-3">
                {job.applicationUrl ? (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Apply Now
                  </a>
                ) : job.contactEmail ? (
                  <a
                    href={`mailto:${job.contactEmail}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact via Email
                  </a>
                ) : null}
                
                {job.contactPhone && (
                  <a
                    href={`tel:${job.contactPhone}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

JobBoardFixed.displayName = 'JobBoardFixed';

export default JobBoardFixed;
