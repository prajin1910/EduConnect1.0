import { Briefcase, Building, Clock, DollarSign, Edit, MapPin, Plus, Trash2, User } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold">Job Board</h2>
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

      {/* Create/Edit Job Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingJob ? 'Edit Job' : 'Post a New Job'}
            </h3>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Bangalore, India or Remote"
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Optional)</label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. ₹15-25 LPA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your.email@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g. 3+ years experience in React"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                + Add Requirement
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application URL (Optional)</label>
              <input
                type="url"
                value={formData.applicationUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, applicationUrl: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://company.com/careers/job-id"
              />
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
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted</h3>
          <p className="text-gray-600">Be the first to share a job opportunity!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.type === 'FULL_TIME' ? 'bg-green-100 text-green-800' :
                      job.type === 'INTERNSHIP' ? 'bg-blue-100 text-blue-800' :
                      job.type === 'PART_TIME' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {job.type.replace('_', '-').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{job.description}</p>
                  
                  <div className="mb-3">
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>Posted by {job.postedByName}</span>
                  </div>
                </div>
                
                {canEditJob(job) && (
                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Job"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Contact: {job.contactEmail}
                </div>
                <div className="flex space-x-3">
                  {job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      Apply Now
                    </a>
                  ) : (
                    <a
                      href={`mailto:${job.contactEmail}?subject=Application for ${job.title}`}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      Apply Now
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

export default JobBoard;