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

const JobBoardEnhanced: React.FC = React.memo(() => {
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
      <div className="card content-padding">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-white">Loading Job Opportunities</p>
          <p className="text-sm text-white/60">Fetching the latest career opportunities for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="card content-padding">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-glow">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="heading-secondary">Job Opportunities</h2>
              <p className="text-body text-sm">Discover career opportunities from our alumni network</p>
            </div>
          </div>
          {user?.role === 'ALUMNI' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Post Job</span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Create Job Form */}
      {showCreateForm && (
        <div className="card content-padding animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h3 className="heading-tertiary">
                {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
              </h3>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="btn-ghost p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleCreateJob} className="space-y-8">
            {/* Basic Information Section */}
            <div className="glass-soft rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-orange-400" />
                <span>Basic Information</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-primary"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="input-primary"
                    placeholder="Company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="input-primary"
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData(prev => ({ ...prev, workMode: e.target.value }))}
                    className="input-primary"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Job['type'] }))}
                    className="input-primary"
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="input-primary"
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
              </div>
            </div>

            {/* Company Details Section */}
            <div className="glass-soft rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-400" />
                <span>Company Details</span>
              </h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Company Description</label>
                  <textarea
                    rows={3}
                    value={formData.companyDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                    className="input-primary resize-none"
                    placeholder="Brief description about the company..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Company Website</label>
                  <input
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                    className="input-primary"
                    placeholder="https://company.com"
                  />
                </div>
              </div>
            </div>

            {/* Salary & Experience Section */}
            <div className="glass-soft rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span>Compensation & Experience</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Min Salary</label>
                  <input
                    type="text"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                    className="input-primary"
                    placeholder="15"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Max Salary</label>
                  <input
                    type="text"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                    className="input-primary"
                    placeholder="25"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="input-primary"
                  >
                    <option value="INR">INR (LPA)</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="input-primary"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead/Principal</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Job Description */}
            <div className="glass-soft rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4">Job Description *</h4>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-primary resize-none"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            {/* Dynamic Arrays - Enhanced */}
            {['requirements', 'responsibilities', 'benefits', 'skillsRequired'].map((field) => (
              <div key={field} className="glass-soft rounded-2xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </h4>
                <div className="space-y-3">
                  {(formData as any)[field].map((item: string, index: number) => (
                    <div key={index} className="flex space-x-3">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayField(field, index, e.target.value)}
                        className="flex-1 input-primary"
                        placeholder={`Add ${field.slice(0, -1)}...`}
                      />
                      {(formData as any)[field].length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(field, index)}
                          className="btn-ghost p-3 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField(field)}
                    className="btn-secondary text-sm"
                  >
                    + Add {field.slice(0, -1)}
                  </button>
                </div>
              </div>
            ))}

            {/* Contact Information */}
            <div className="glass-soft rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>Contact Information</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="input-primary"
                    placeholder="hr@company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="input-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90">Application URL</label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationUrl: e.target.value }))}
                    className="input-primary"
                    placeholder="https://company.com/careers/job-id"
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="btn-primary flex-1 py-4 text-lg font-semibold"
              >
                {editingJob ? 'Update Job Posting' : 'Publish Job Posting'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="btn-secondary flex-1 py-4"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Jobs List */}
      {jobs.length === 0 ? (
        <div className="card content-padding text-center animate-slide-up">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h3 className="heading-tertiary mb-2">No Jobs Available</h3>
          <p className="text-body">Be the first to share an exciting career opportunity!</p>
          {user?.role === 'ALUMNI' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary mt-4"
            >
              Post the First Job
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div key={job.id} className="card-interactive px-6 py-5 animate-slide-up hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Enhanced Job Header */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 space-y-3 lg:space-y-0">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-white cursor-pointer">
                      {job.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      job.type === 'FULL_TIME' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      job.type === 'INTERNSHIP' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      job.type === 'PART_TIME' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {job.type.replace('_', '-')}
                    </span>
                    {job.workMode && (
                      <span className="px-2 py-1 bg-white/10 text-white/80 rounded-full text-xs border border-white/20">
                        {job.workMode}
                      </span>
                    )}
                  </div>
                  
                  {/* Company & Location Row */}
                  <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-blue-400" />
                      <span className="font-semibold">{job.company}</span>
                      {job.companyWebsite && (
                        <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-400">
                          <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-400" />
                      <span>{job.location}</span>
                    </div>
                    {(job.salaryMin && job.salaryMax) && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="font-semibold text-green-300">
                          {job.salaryMin}-{job.salaryMax} {job.currency}
                        </span>
                      </div>
                    )}
                    {job.experienceLevel && (
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-orange-400" />
                        <span>{job.experienceLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Posted Info */}
                  <div className="flex items-center text-xs text-white/60">
                    <span>Posted by {job.postedByName}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                    {job.applicationDeadline && (
                      <>
                        <span className="mx-2">•</span>
                        <div className="flex items-center space-x-1 text-red-400">
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
                        className="btn-ghost p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20" 
                        title="Edit Job"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="btn-ghost p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        title="Delete Job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Apply Button */}
                  {job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm"
                    >
                      <span>Apply Now</span>
                      <Globe className="h-3 w-3" />
                    </a>
                  ) : (
                    <a
                      href={`mailto:${job.contactEmail || job.postedByEmail}?subject=Application for ${job.title}&body=Dear ${job.postedByName},%0D%0A%0D%0AI am interested in applying for the ${job.title} position at ${job.company}.%0D%0A%0D%0APlease find my resume attached.%0D%0A%0D%0AThank you for your consideration.%0D%0A%0D%0ABest regards`}
                      className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm"
                    >
                      <span>Apply Now</span>
                      <Mail className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Company Description */}
              {job.companyDescription && (
                <div className="glass-soft rounded-xl p-3 mb-3 border border-white/10">
                  <h4 className="text-xs font-semibold text-blue-300 mb-2">About the Company</h4>
                  <p className="text-white/80 text-xs leading-relaxed">{job.companyDescription}</p>
                </div>
              )}

              {/* Job Description */}
              <div className="glass-soft rounded-xl p-3 mb-3 border border-white/10">
                <h4 className="text-xs font-semibold text-white mb-2">Job Description</h4>
                <p className="text-white/80 text-xs leading-relaxed">{job.description}</p>
              </div>

              {/* Enhanced Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="glass-soft rounded-xl p-3 border border-red-500/20">
                    <h4 className="text-xs font-semibold text-red-300 mb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      <span>Requirements</span>
                    </h4>
                    <ul className="space-y-1">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="text-white/80 text-xs flex items-start space-x-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                      {job.requirements.length > 3 && (
                        <li className="text-red-300 text-xs">+{job.requirements.length - 3} more requirements</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div className="glass-soft rounded-xl p-3 border border-green-500/20">
                    <h4 className="text-xs font-semibold text-green-300 mb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      <span>Key Responsibilities</span>
                    </h4>
                    <ul className="space-y-1">
                      {job.responsibilities.slice(0, 3).map((resp, index) => (
                        <li key={index} className="text-white/80 text-xs flex items-start space-x-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                      {job.responsibilities.length > 3 && (
                        <li className="text-green-300 text-xs">+{job.responsibilities.length - 3} more responsibilities</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                  <div className="glass-soft rounded-xl p-3 border border-purple-500/20">
                    <h4 className="text-xs font-semibold text-purple-300 mb-2 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                      <span>Benefits & Perks</span>
                    </h4>
                    <ul className="space-y-1">
                      {job.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="text-white/80 text-xs flex items-start space-x-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                      {job.benefits.length > 3 && (
                        <li className="text-purple-300 text-xs">+{job.benefits.length - 3} more benefits</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Skills Section */}
              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-white mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {job.skillsRequired.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information Footer */}
              <div className="glass-soft rounded-xl p-3 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
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
                    {(job.industry || job.department) && (
                      <div className="text-xs">
                        {job.industry && <span className="text-white/60">Industry: {job.industry}</span>}
                        {job.industry && job.department && <span className="text-white/40"> | </span>}
                        {job.department && <span className="text-white/60">Dept: {job.department}</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {job.applicationUrl ? (
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs flex items-center space-x-1 px-3 py-1"
                      >
                        <span>View Details</span>
                        <Globe className="h-3 w-3" />
                      </a>
                    ) : (
                      <a
                        href={`mailto:${job.contactEmail || job.postedByEmail}?subject=Inquiry about ${job.title}`}
                        className="btn-secondary text-xs flex items-center space-x-1 px-3 py-1"
                      >
                        <span>Contact</span>
                        <Mail className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default JobBoardEnhanced;
