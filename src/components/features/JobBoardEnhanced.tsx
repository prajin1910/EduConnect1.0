import { Award, Briefcase, Building, Clock, DollarSign, Edit, Globe, Mail, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
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

const JobBoardEnhanced: React.FC = () => {
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
      console.log('JobBoardEnhanced: Loading jobs...');
      const response = await api.get('/jobs');
      console.log('JobBoardEnhanced: Jobs loaded:', response.data.length);
      setJobs(response.data);
    } catch (error: any) {
      console.error('JobBoardEnhanced: Error loading jobs:', error);
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
        showToast('Job updated successfully!', 'success');
      } else {
        // Create new job
        const response = await api.post('/jobs', jobData);
        setJobs([response.data, ...jobs]);
        showToast('Job posted successfully!', 'success');
      }
      
      resetForm();
      setShowCreateForm(false);
      setEditingJob(null);
    } catch (error: any) {
      showToast(error.response?.data?.message || `Failed to ${editingJob ? 'update' : 'post'} job`, 'error');
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold">Enhanced Job Board</h2>
        </div>
        {user?.role === 'ALUMNI' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post Job</span>
          </button>
        )}
      </div>

      {/* Enhanced Create Job Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingJob ? 'Edit Job' : 'Post a Comprehensive Job'}
          </h3>
          <form onSubmit={handleCreateJob} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 border-b pb-2">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData(prev => ({ ...prev, workMode: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Job['type'] }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 border-b pb-2">Company Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                  <textarea
                    rows={3}
                    value={formData.companyDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Brief description about the company..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
                  <input
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://company.com"
                  />
                </div>
              </div>
            </div>

            {/* Salary & Experience */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 border-b pb-2">Salary & Experience</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                  <input
                    type="text"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                  <input
                    type="text"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="25"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="INR">INR (LPA)</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead/Principal</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            {/* Dynamic Arrays */}
            {['requirements', 'responsibilities', 'benefits', 'skillsRequired'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
                {(formData as any)[field].map((item: string, index: number) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayField(field, index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder={`Add ${field.slice(0, -1)}...`}
                    />
                    {(formData as any)[field].length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(field, index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField(field)}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  + Add {field.slice(0, -1)}
                </button>
              </div>
            ))}

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 border-b pb-2">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="hr@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application URL</label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationUrl: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://company.com/careers/job-id"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              >
                {editingJob ? 'Update Job' : 'Post Job'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Jobs List with ALL Information */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted</h3>
          <p className="text-gray-600">Be the first to share a job opportunity!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              {/* Compact Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-bold text-blue-600">{job.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      job.type === 'FULL_TIME' ? 'bg-green-100 text-green-800' :
                      job.type === 'INTERNSHIP' ? 'bg-blue-100 text-blue-800' :
                      job.type === 'PART_TIME' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {job.type.replace('_', '-')}
                    </span>
                    {job.workMode && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {job.workMode}
                      </span>
                    )}
                  </div>
                  
                  {/* Company & Location Row */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span className="font-medium">{job.company}</span>
                      {job.companyWebsite && (
                        <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                          <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{job.location}</span>
                    </div>
                    {(job.salaryMin && job.salaryMax) && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium text-green-600">
                          {job.salaryMin}-{job.salaryMax} {job.currency}
                        </span>
                      </div>
                    )}
                    {job.experienceLevel && (
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3" />
                        <span>{job.experienceLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {canEditJob(job) && (
                  <div className="flex space-x-1 ml-2">
                    <button 
                      onClick={() => handleEditJob(job)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                      title="Edit Job"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Compact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {/* Company Description */}
                {job.companyDescription && (
                  <div className="bg-blue-50 p-2 rounded text-xs">
                    <span className="font-medium text-blue-800">Company: </span>
                    <span className="text-blue-700">{job.companyDescription.substring(0, 80)}...</span>
                  </div>
                )}
                
                {/* Industry & Department */}
                {(job.industry || job.department) && (
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    {job.industry && <span className="font-medium">Industry: {job.industry}</span>}
                    {job.industry && job.department && <span> | </span>}
                    {job.department && <span className="font-medium">Dept: {job.department}</span>}
                  </div>
                )}
                
                {/* Posted Info */}
                <div className="bg-yellow-50 p-2 rounded text-xs">
                  <span className="font-medium text-yellow-800">Posted by: </span>
                  <span className="text-yellow-700">{job.postedByName}</span>
                  <span className="text-yellow-600"> • {new Date(job.postedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Job Description - Compact */}
              <div className="mb-3">
                <div className="bg-gray-50 p-2 rounded text-sm">
                  <span className="font-medium text-gray-800">Description: </span>
                  <span className="text-gray-700">{job.description.substring(0, 150)}...</span>
                </div>
              </div>

              {/* Requirements, Responsibilities, Benefits - Horizontal Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-xs">
                {job.requirements && job.requirements.length > 0 && (
                  <div className="bg-red-50 p-2 rounded">
                    <span className="font-medium text-red-800">Requirements:</span>
                    <ul className="text-red-700 mt-1">
                      {job.requirements.slice(0, 2).map((req, index) => (
                        <li key={index}>• {req.substring(0, 40)}...</li>
                      ))}
                      {job.requirements.length > 2 && (
                        <li className="text-red-600">+{job.requirements.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div className="bg-green-50 p-2 rounded">
                    <span className="font-medium text-green-800">Responsibilities:</span>
                    <ul className="text-green-700 mt-1">
                      {job.responsibilities.slice(0, 2).map((resp, index) => (
                        <li key={index}>• {resp.substring(0, 40)}...</li>
                      ))}
                      {job.responsibilities.length > 2 && (
                        <li className="text-green-600">+{job.responsibilities.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {job.benefits && job.benefits.length > 0 && (
                  <div className="bg-purple-50 p-2 rounded">
                    <span className="font-medium text-purple-800">Benefits:</span>
                    <ul className="text-purple-700 mt-1">
                      {job.benefits.slice(0, 2).map((benefit, index) => (
                        <li key={index}>• {benefit.substring(0, 40)}...</li>
                      ))}
                      {job.benefits.length > 2 && (
                        <li className="text-purple-600">+{job.benefits.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Skills - Compact Tags */}
              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-600 mr-2">Skills:</span>
                  <div className="inline-flex flex-wrap gap-1">
                    {job.skillsRequired.slice(0, 6).map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 6 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{job.skillsRequired.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Contact & Application - Compact Row */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{job.contactEmail || job.postedByEmail}</span>
                  </div>
                  {job.contactPhone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{job.contactPhone}</span>
                    </div>
                  )}
                  {job.applicationDeadline && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">
                        Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Apply Button */}
                <div>
                  {job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors text-sm font-medium flex items-center space-x-1"
                    >
                      <span>Apply Now</span>
                      <Globe className="h-3 w-3" />
                    </a>
                  ) : (
                    <a
                      href={`mailto:${job.contactEmail || job.postedByEmail}?subject=Application for ${job.title}&body=Dear ${job.postedByName},%0D%0A%0D%0AI am interested in applying for the ${job.title} position at ${job.company}.%0D%0A%0D%0APlease find my resume attached.%0D%0A%0D%0AThank you for your consideration.%0D%0A%0D%0ABest regards`}
                      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors text-sm font-medium flex items-center space-x-1"
                    >
                      <span>Apply Now</span>
                      <Mail className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBoardEnhanced;
