import { Calendar, CheckSquare, ChevronDown, ChevronUp, Clock, MapPin, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { activityAPI, taskAPI } from '../../services/api';

interface Task {
  id: string;
  taskName: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  roadmap: string[];
  roadmapGenerated: boolean;
  createdAt: string;
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [generatingRoadmap, setGeneratingRoadmap] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    dueDate: ''
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      console.log('TaskManagement: Fetching user tasks...');
      const response = await taskAPI.getUserTasks();
      console.log('TaskManagement: Tasks loaded:', response.length);
      setTasks(response);
    } catch (error: any) {
      console.error('TaskManagement: Error fetching tasks:', error);
      // Don't show error toast if it's just no tasks available
      if (error.response?.status !== 404) {
        showToast(error.message || 'Failed to fetch tasks', 'error');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await taskAPI.createTask(formData);
      setTasks([response, ...tasks]);
      setFormData({ taskName: '', description: '', dueDate: '' });
      setShowCreateForm(false);
      
      // Log activity
      await activityAPI.logActivity('TASK_MANAGEMENT', `Created task: ${formData.taskName}`);
      showToast('Task created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create task', 'error');
    }
  };

  const generateRoadmap = async (taskId: string) => {
    try {
      setGeneratingRoadmap(taskId);
      showToast('Generating roadmap...', 'info');
      
      const response = await taskAPI.generateRoadmap(taskId);
      setTasks(tasks.map(task => task.id === taskId ? response : task));
      
      // Auto-expand the task to show the generated roadmap
      setExpandedTasks(prev => new Set([...prev, taskId]));
      
      // Log activity
      await activityAPI.logActivity('TASK_MANAGEMENT', 'Generated AI roadmap for task');
      showToast('Roadmap generated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to generate roadmap', 'error');
    } finally {
      setGeneratingRoadmap(null);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await taskAPI.updateTaskStatus(taskId, status);
      setTasks(tasks.map(task => task.id === taskId ? response : task));
      showToast('Task status updated!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update task status', 'error');
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && tasks.find(t => t.dueDate === dueDate)?.status !== 'COMPLETED';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Task Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          <form onSubmit={createTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task name"
                value={formData.taskName}
                onChange={(e) => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your task in detail"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Yet</h3>
          <p className="text-gray-600">Create your first task to get started with AI-powered roadmaps.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{task.taskName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {isOverdue(task.dueDate) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!task.roadmapGenerated && (
                    <button
                      onClick={() => generateRoadmap(task.id)}
                      disabled={generatingRoadmap === task.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>
                        {generatingRoadmap === task.id ? 'Generating...' : 'Generate Roadmap'}
                      </span>
                    </button>
                  )}
                  
                  {task.roadmapGenerated && (
                    <button
                      onClick={() => toggleTaskExpansion(task.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>View Roadmap</span>
                    </button>
                  )}
                  
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  
                  {task.roadmapGenerated && (
                    <button
                      onClick={() => toggleTaskExpansion(task.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {expandedTasks.has(task.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Roadmap */}
              {task.roadmapGenerated && expandedTasks.has(task.id) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold mb-3 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <span>AI Generated Roadmap</span>
                  </h4>
                  <div className="space-y-2">
                    {task.roadmap.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;