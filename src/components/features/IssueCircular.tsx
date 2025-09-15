import {
    AlertCircle,
    CheckCircle,
    Globe,
    GraduationCap,
    Send,
    UserCheck,
    Users,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { circularAPI } from '../../services/api';

interface RecipientOption {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const IssueCircular: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  // Define recipient options based on user role
  const getRecipientOptions = (): RecipientOption[] => {
    const baseOptions: RecipientOption[] = [];
    
    if (user?.role === 'MANAGEMENT') {
      baseOptions.push(
        {
          id: 'STUDENTS',
          label: 'Students',
          icon: Users,
          description: 'Send to all students',
          color: 'bg-blue-100 text-blue-600 border-blue-200'
        },
        {
          id: 'PROFESSORS',
          label: 'Professors',
          icon: GraduationCap,
          description: 'Send to all professors',
          color: 'bg-green-100 text-green-600 border-green-200'
        },
        {
          id: 'ALL',
          label: 'Everyone',
          icon: Globe,
          description: 'Send to students and professors',
          color: 'bg-purple-100 text-purple-600 border-purple-200'
        }
      );
    } else if (user?.role === 'PROFESSOR') {
      baseOptions.push(
        {
          id: 'STUDENTS',
          label: 'Students',
          icon: Users,
          description: 'Send to all students',
          color: 'bg-blue-100 text-blue-600 border-blue-200'
        },
        {
          id: 'MANAGEMENT',
          label: 'Management',
          icon: UserCheck,
          description: 'Send to management',
          color: 'bg-orange-100 text-orange-600 border-orange-200'
        }
      );
    }
    
    return baseOptions;
  };

  const recipientOptions = getRecipientOptions();

  const handleRecipientToggle = (recipientId: string) => {
    if (recipientId === 'ALL') {
      // If "Everyone" is selected, clear other selections and only select ALL
      setSelectedRecipients(['ALL']);
    } else {
      // Remove "ALL" if individual options are selected
      const filtered = selectedRecipients.filter(id => id !== 'ALL');
      
      if (filtered.includes(recipientId)) {
        setSelectedRecipients(filtered.filter(id => id !== recipientId));
      } else {
        setSelectedRecipients([...filtered, recipientId]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }
    
    if (!body.trim()) {
      showToast('Please enter the circular content', 'error');
      return;
    }
    
    if (selectedRecipients.length === 0) {
      showToast('Please select at least one recipient group', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await circularAPI.createCircular({
        title: title.trim(),
        body: body.trim(),
        recipientTypes: selectedRecipients
      });
      
      showToast('Circular sent successfully!', 'success');
      
      // Reset form
      setTitle('');
      setBody('');
      setSelectedRecipients([]);
      setShowPreview(false);
      
    } catch (error: any) {
      console.error('Error sending circular:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send circular';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedRecipientsText = () => {
    if (selectedRecipients.includes('ALL')) {
      return 'Everyone (Students & Professors)';
    }
    
    if (selectedRecipients.length === 0) {
      return 'No recipients selected';
    }
    
    return selectedRecipients.map(id => 
      recipientOptions.find(opt => opt.id === id)?.label
    ).join(', ');
  };

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Preview Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Preview Circular</h2>
                  <p className="text-purple-100 text-sm">Review before sending</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            {/* Circular Header */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">From: {user?.name}</span>
                <span className="text-sm text-gray-500">
                  {user?.role === 'MANAGEMENT' ? 'Management' : 'Professor'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                To: <span className="font-medium text-purple-600">{getSelectedRecipientsText()}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
            </div>

            {/* Circular Body */}
            <div className="prose max-w-none mb-6">
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {body}
              </div>
            </div>

            {/* Preview Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Circular</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Issue Circular</h2>
              <p className="text-purple-100 text-sm">
                Send announcements and important information
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Circular Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter circular title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              maxLength={200}
              required
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                Keep it clear and descriptive
              </p>
              <p className="text-xs text-gray-400">
                {title.length}/200
              </p>
            </div>
          </div>

          {/* Recipients Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Send To *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recipientOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedRecipients.includes(option.id);
                
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleRecipientToggle(option.id)}
                    className={`p-4 border-2 rounded-xl transition-all text-left ${
                      isSelected
                        ? `${option.color} border-current scale-105`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${
                        isSelected ? 'text-current' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isSelected ? 'text-current' : 'text-gray-700'
                        }`}>
                          {option.label}
                        </p>
                        <p className={`text-xs ${
                          isSelected ? 'text-current opacity-80' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-current" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedRecipients.length === 0 && (
              <div className="flex items-center space-x-2 mt-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">Please select at least one recipient group</p>
              </div>
            )}
          </div>

          {/* Body Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Circular Content *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your circular content here..."
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              maxLength={5000}
              required
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                Write clear and concise information
              </p>
              <p className="text-xs text-gray-400">
                {body.length}/5000
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!title.trim() || !body.trim() || selectedRecipients.length === 0}
              className="px-6 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !body.trim() || selectedRecipients.length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Circular</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueCircular;
