import {
  Award,
  Calendar,
  Edit,
  Eye,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useToast } from "../../contexts/ToastContext";
import { assessmentAPI } from "../../services/api";

interface Assessment {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  questions: any[];
  assignedTo: string[];
}

interface AssessmentResult {
  id: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
  timeTaken: number;
}

interface AssessmentStats {
  totalAssigned: number;
  totalCompleted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
}

const AssessmentInsights: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await assessmentAPI.getProfessorAssessments();
      setAssessments(response);
    } catch (error: any) {
      showToast(error.message || "Failed to fetch assessments", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentResults = async (assessmentId: string) => {
    setResultsLoading(true);
    try {
      const response = await assessmentAPI.getAssessmentResults(assessmentId);
      setResults(response);

      // Calculate stats
      const assessment = assessments.find((a) => a.id === assessmentId);
      if (assessment) {
        const totalAssigned = assessment.assignedTo.length;
        const totalCompleted = response.length;
        const scores = response.map((r: AssessmentResult) => r.score);
        const averageScore =
          scores.length > 0
            ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
            : 0;
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
        const completionRate =
          totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

        setStats({
          totalAssigned,
          totalCompleted,
          averageScore,
          highestScore,
          lowestScore,
          completionRate,
        });
      }
    } catch (error: any) {
      showToast(error.message || "Failed to fetch results", "error");
    } finally {
      setResultsLoading(false);
    }
  };

  const selectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    fetchAssessmentResults(assessment.id);
  };

  const getAssessmentStatus = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    const endTime = new Date(assessment.endTime);

    if (now < startTime) return "upcoming";
    if (now > endTime) return "completed";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white";
      case "active":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white";
      case "completed":
        return "bg-gradient-to-r from-blue-400 to-indigo-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const canEdit = (assessment: Assessment) => {
    const now = new Date();
    const startTime = new Date(assessment.startTime);
    return now < startTime;
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const getScoreDistribution = () => {
    const ranges = [
      { range: "90-100%", min: 90, max: 100 },
      { range: "80-89%", min: 80, max: 89 },
      { range: "70-79%", min: 70, max: 79 },
      { range: "60-69%", min: 60, max: 69 },
      { range: "Below 60%", min: 0, max: 59 },
    ];

    return ranges.map((range) => ({
      range: range.range,
      count: results.filter(
        (r) => r.percentage >= range.min && r.percentage <= range.max
      ).length,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl p-6 border border-teal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Assessment Insights
              </h2>
              <p className="text-teal-600 font-medium">
                Analyze performance and track progress
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">
              {assessments.length}
            </div>
            <div className="text-sm text-gray-600">Total Assessments</div>
          </div>
        </div>
      </div>

      {/* Enhanced Assessment List */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Select Assessment to Analyze
          </h3>
        </div>

        {assessments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              No Assessments Available
            </h3>
            <p className="text-gray-500">
              Create assessments to view performance insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const status = getAssessmentStatus(assessment);
              const isSelected = selectedAssessment?.id === assessment.id;

              return (
                <div
                  key={assessment.id}
                  className={`p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected
                      ? "border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  onClick={() => selectAssessment(assessment)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Award className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-800">
                            {assessment.title}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-2xl text-sm font-bold ${getStatusColor(
                              status
                            )}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {assessment.description}
                        </p>

                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-xl">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-700 font-semibold">
                              {new Date(
                                assessment.startTime
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-xl">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span className="text-purple-700 font-semibold">
                              {assessment.assignedTo.length} students
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-xl">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-semibold">
                              {assessment.questions.length} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {canEdit(assessment) && (
                        <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300">
                          <Edit className="h-5 w-5" />
                        </button>
                      )}
                      {status === "completed" && (
                        <button className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all duration-300">
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment Insights */}
      {selectedAssessment && (
        <div className="space-y-6">
          {/* Stats Overview */}
          {stats && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">
                Assessment Statistics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalAssigned}
                  </div>
                  <div className="text-sm text-gray-600">Assigned</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalCompleted}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.completionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.averageScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">
                    {stats.highestScore}
                  </div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.lowestScore}
                  </div>
                  <div className="text-sm text-gray-600">Lowest Score</div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Score Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getScoreDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count }) =>
                        count > 0 ? `${range}: ${count}` : ""
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {getScoreDistribution().map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Student Performance
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={results.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="studentName"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Student Results Table */}
          {resultsLoading ? (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Student Results</h3>

              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No submissions yet for this assessment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Student
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Score
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Percentage
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Time Taken
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Submitted At
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((result, index) => {
                          const getGrade = (percentage: number) => {
                            if (percentage >= 90)
                              return {
                                grade: "A+",
                                color: "text-green-600 bg-green-100",
                              };
                            if (percentage >= 80)
                              return {
                                grade: "A",
                                color: "text-green-600 bg-green-100",
                              };
                            if (percentage >= 70)
                              return {
                                grade: "B",
                                color: "text-blue-600 bg-blue-100",
                              };
                            if (percentage >= 60)
                              return {
                                grade: "C",
                                color: "text-yellow-600 bg-yellow-100",
                              };
                            return {
                              grade: "F",
                              color: "text-red-600 bg-red-100",
                            };
                          };

                          const gradeInfo = getGrade(result.percentage);

                          return (
                            <tr
                              key={result.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  {index < 3 && (
                                    <Award
                                      className={`h-4 w-4 ${
                                        index === 0
                                          ? "text-yellow-500"
                                          : index === 1
                                          ? "text-gray-400"
                                          : "text-orange-400"
                                      }`}
                                    />
                                  )}
                                  <span className="font-medium">
                                    {result.studentName}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center py-3 px-4">
                                {result.score}/{result.totalMarks}
                              </td>
                              <td className="text-center py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    result.percentage >= 80
                                      ? "bg-green-100 text-green-800"
                                      : result.percentage >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {result.percentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="text-center py-3 px-4 text-gray-600">
                                {Math.floor(result.timeTaken / 60)}m{" "}
                                {result.timeTaken % 60}s
                              </td>
                              <td className="text-center py-3 px-4 text-gray-600">
                                {new Date(result.submittedAt).toLocaleString()}
                              </td>
                              <td className="text-center py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${gradeInfo.color}`}
                                >
                                  {gradeInfo.grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!selectedAssessment && assessments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Select an Assessment
          </h3>
          <p className="text-gray-600">
            Choose an assessment from the list above to view detailed insights
            and student performance.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentInsights;
