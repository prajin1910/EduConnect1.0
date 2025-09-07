import { Briefcase, Clock, DollarSign, Edit, MapPin, Plus, Search, Trash2, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  salary?: string;
  description: string;
  requirements: string[];
  postedBy: string;
  postedByName: string;
  postedByEmail: string;
  postedAt: string;
  applicationUrl?: string;
  contactEmail?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const JobBoard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'FULL_TIME' as Job['type'],
    salary: '',
    description: '',
    requirements: [''],
    applicationUrl: '',
    contactEmail: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error: any) {
      showToast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim())
      };

      if (editingJob) {
        // Update existing job
        console.log('Updating job with ID:', editingJob.id);
        console.log('Job data:', jobData);
        const response = await api.put(`/jobs/${editingJob.id}`, jobData);
        setJobs(jobs.map(job => job.id === editingJob.id ? response.data : job));
        showToast('Job updated successfully!', 'success');
        setEditingJob(null);
      } else {
        // Create new job
        console.log('Creating new job:', jobData);
        const response = await api.post('/jobs', jobData);
        setJobs([response.data, ...jobs]);
        showToast('Job posted successfully!', 'success');
      }
      
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'FULL_TIME',
        salary: '',
        description: '',
        requirements: [''],
        applicationUrl: '',
        contactEmail: ''
      });
      setShowCreateForm(false);
      
      // Trigger stats refresh if we're in alumni dashboard
      window.dispatchEvent(new Event('jobUpdated'));
    } catch (error: any) {
      console.error('Job save error:', error);
      console.error('Error response:', error.response?.data);
      showToast(error.response?.data?.message || 'Failed to save job', 'error');
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const canEditJob = (job: Job) => {
    // Only the alumni who posted the job can edit/delete it
    return user?.email === job.postedByEmail;
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(job => job.id !== jobId));
      showToast('Job deleted successfully', 'success');
      
      // Trigger stats refresh if we're in alumni dashboard
      window.dispatchEvent(new Event('jobUpdated'));
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete job', 'error');
    }
  };

  const handleEditJob = (job: Job) => {
    console.log('Editing job:', job);
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary || '',
      description: job.description,
      requirements: job.requirements.length > 0 ? job.requirements : [''],
      applicationUrl: job.applicationUrl || '',
      contactEmail: job.contactEmail || ''
    });
    setShowCreateForm(true);
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
    setShowCreateForm(false);
    setFormData({
      title: '',
      company: '',
      location: '',
      type: 'FULL_TIME',
      salary: '',
      description: '',
      requirements: [''],
      applicationUrl: '',
      contactEmail: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-2">
        {/* Ultra Compact Header */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-md flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Job Board</h1>
                <p className="text-gray-600 text-xs">
                  Discover career opportunities
                </p>
              </div>
            </div>
            {user?.role === 'ALUMNI' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1.5 rounded-md hover:from-orange-700 hover:to-red-700 transition-all duration-300 flex items-center space-x-1 text-sm"
              >
                <Plus className="h-3 w-3" />
                <span>Post</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4 text-xs mt-2">
            <div className="flex items-center space-x-1 text-emerald-600">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span>{jobs.filter(job => job.status === 'ACTIVE').length} Active</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>{new Set(jobs.map(job => job.company)).size} Companies</span>
            </div>
            <div className="flex items-center space-x-1 text-purple-600">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>{new Set(jobs.map(job => job.type)).size} Types</span>
            </div>
          </div>
        </div>

        {/* Ultra Compact Filters */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs"
                />
              </div>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs"
            >
              <option value="">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setSelectedLocation('');
              }}
              className="text-gray-500 hover:text-gray-700 px-2 py-1.5 text-xs"
            >
              Clear
            </button>
          </div>
        </div>

      {/* Create/Edit Job Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {editingJob ? 'Edit Job Posting' : 'Post a New Job'}
              </h3>
              <p className="text-slate-600 mt-1">Share opportunities with our talented alumni network</p>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleCreateJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                  placeholder="Company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                  placeholder="e.g. Bangalore, India or Remote"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Job['type'] }))}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Salary (Optional)</label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                  placeholder="e.g. ₹15-25 LPA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                  placeholder="your.email@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Requirements</label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex space-x-3 mb-3">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                    placeholder="e.g. 3+ years experience in React"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-700 p-3 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-orange-600 hover:text-orange-700 font-semibold flex items-center space-x-2 hover:bg-orange-50 px-3 py-2 rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Requirement</span>
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Application URL (Optional)</label>
              <input
                type="url"
                value={formData.applicationUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, applicationUrl: e.target.value }))}
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-slate-50/50"
                placeholder="https://company.com/careers/job-id"
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {editingJob ? 'Update Job' : 'Post Job'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 bg-slate-200 text-slate-700 py-4 px-6 rounded-xl hover:bg-slate-300 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      {jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              job.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === '' || job.type.toLowerCase().includes(selectedType.toLowerCase());
        const matchesLocation = selectedLocation === '' || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
        return matchesSearch && matchesType && matchesLocation;
      }).length === 0 ? (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-md flex items-center justify-center mx-auto mb-3">
            <Briefcase className="h-6 w-6 text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Jobs Found</h3>
          <p className="text-slate-600 text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  job.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === '' || job.type.toLowerCase().includes(selectedType.toLowerCase());
            const matchesLocation = selectedLocation === '' || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
            return matchesSearch && matchesType && matchesLocation;
          }).map((job) => (
            <div key={job.id} className="bg-white rounded-md shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-md flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          job.type === 'FULL_TIME' ? 'bg-emerald-100 text-emerald-800' :
                          job.type === 'INTERNSHIP' ? 'bg-blue-100 text-blue-800' :
                          job.type === 'PART_TIME' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {job.type.replace('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs font-medium">{job.company}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{new Date(job.postedAt).toLocaleDateString()}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{job.postedByName}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                  
                  {job.requirements.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 3 && (
                          <span className="text-xs text-gray-500">+{job.requirements.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {canEditJob(job) && (
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditJob(job)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                      title="Edit Job"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                      title="Delete Job"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  {job.applicationUrl && (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-md hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-xs"
                    >
                      Apply
                    </a>
                  )}
                  {job.contactEmail && (
                    <a
                      href={`mailto:${job.contactEmail}`}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-all duration-300 text-xs"
                    >
                      Contact
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default JobBoard;