import { Bot, Brain, Lightbulb, Loader2, MessageSquare, Search, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';
import { resumeManagementAPI } from '../../services/api';

const AIStudentAnalysis: React.FC = () => {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Predefined query templates
  const queryTemplates = [
    "Which students have the highest ATS scores and would be most suitable for tech internships?",
    "Find students with strong programming skills and relevant project experience.",
    "Which students need the most improvement in their resume formatting and presentation?",
    "Identify top performers who would be good candidates for leadership positions.",
    "Show me students with diverse skill sets who could fit into cross-functional teams.",
    "Which students have the best combination of technical and soft skills?",
    "Find students who would benefit from additional career guidance and mentoring.",
    "Identify students with entrepreneurial potential based on their experiences."
  ];

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError('Please enter a query or select a template');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await resumeManagementAPI.analyzeStudentProfiles(query);
      setAnalysis(response.analysis);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze student profiles');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: string) => {
    setQuery(template);
    setAnalysis('');
    setError('');
  };

  const formatAnalysis = (text: string) => {
    // Simple formatting for better readability
    return text
      .split('\n')
      .map((line, index) => {
        if (line.trim() === '') return <br key={index} />;
        
        // Bold headers (lines ending with :)
        if (line.trim().endsWith(':')) {
          return (
            <div key={index} className="font-semibold text-blue-800 mt-4 mb-2">
              {line}
            </div>
          );
        }
        
        // Numbered lists
        if (line.match(/^\d+\./)) {
          return (
            <div key={index} className="ml-4 mb-2">
              <span className="font-medium text-blue-600">{line.match(/^\d+\./)}</span>
              {line.replace(/^\d+\./, '')}
            </div>
          );
        }
        
        // Bullet points
        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          return (
            <div key={index} className="ml-6 mb-1">
              <span className="text-blue-500 mr-2">•</span>
              {line.replace(/^[-•]\s*/, '')}
            </div>
          );
        }
        
        return (
          <div key={index} className="mb-2">
            {line}
          </div>
        );
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Student Analysis</h2>
              <p className="text-purple-100">Get intelligent insights about your students using AI</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Query Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="inline h-4 w-4 mr-1" />
              Ask me anything about your students
            </label>
            <div className="flex space-x-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Which students would be best for software engineering roles?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Query Templates */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Quick Analysis Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {queryTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => useTemplate(template)}
                  className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors text-sm"
                >
                  <Bot className="inline h-4 w-4 mr-2 text-blue-500" />
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="p-4 border-b border-blue-200 bg-white/50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  AI Analysis Results
                </h3>
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-gray-700">
                  {formatAnalysis(analysis)}
                </div>
              </div>
            </div>
          )}

          {/* Usage Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  AI Analysis powered by advanced machine learning
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Results are based on resume data and ATS analysis scores
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Pro Tips:</strong> Be specific in your queries for better results. 
              Ask about skills, experience levels, ATS scores, or career readiness. 
              The AI analyzes all student resume data to provide comprehensive insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudentAnalysis;
