import { Calendar, Clock, TrendingDown, TrendingUp, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendancePercentage: number;
  attendanceDetails: AttendanceDetail[];
}

interface AttendanceDetail {
  date: string;
  period: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  professorName: string;
  notes?: string;
  remarks?: string;
}

const StudentAttendanceView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAttendanceSummary();
  }, []);

  const loadAttendanceSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/student/my-summary');
      setAttendanceSummary(response.data);
      console.log('Student attendance summary loaded:', response.data);
    } catch (error: any) {
      console.error('Error loading attendance summary:', error);
      // Don't show error toast if it's just no attendance data
      if (error.response?.status !== 404) {
        showToast('Failed to load attendance data', 'error');
      }
      setAttendanceSummary({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        excusedDays: 0,
        attendancePercentage: 0,
        attendanceDetails: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return '✓';
      case 'ABSENT': return '✗';
      case 'LATE': return '⏰';
      case 'EXCUSED': return '📝';
      default: return '?';
    }
  };

  const getAttendanceGrade = (percentage: number) => {
    if (percentage >= 95) return { grade: 'Excellent', color: 'text-green-600' };
    if (percentage >= 85) return { grade: 'Very Good', color: 'text-blue-600' };
    if (percentage >= 75) return { grade: 'Good', color: 'text-yellow-600' };
    if (percentage >= 65) return { grade: 'Average', color: 'text-orange-600' };
    return { grade: 'Poor', color: 'text-red-600' };
  };

  const filterAttendanceByMonth = (details: AttendanceDetail[]) => {
    return details.filter(detail => {
      const date = new Date(detail.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attendanceSummary) {
    return (
            <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white mb-2">No Attendance Data</h3>
        <p className="text-gray-600">No attendance records found.</p>
      </div>
    );
  }

  const attendanceGrade = getAttendanceGrade(attendanceSummary.attendancePercentage);
  const filteredDetails = filterAttendanceByMonth(attendanceSummary.attendanceDetails);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">My Attendance</h2>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-1">Total Days</h3>
          <p className="text-2xl font-bold text-blue-600">{attendanceSummary.totalDays}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-1">Present</h3>
          <p className="text-2xl font-bold text-green-600">{attendanceSummary.presentDays}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-semibold mb-1">Absent</h3>
          <p className="text-2xl font-bold text-red-600">{attendanceSummary.absentDays}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-1">Attendance</h3>
          <p className={`text-2xl font-bold ${attendanceGrade.color}`}>
            {attendanceSummary.attendancePercentage.toFixed(1)}%
          </p>
          <p className={`text-sm ${attendanceGrade.color}`}>{attendanceGrade.grade}</p>
        </div>
      </div>

      {/* Attendance Grade Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Attendance Performance</h3>
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${attendanceGrade.color}`}>
                {attendanceSummary.attendancePercentage.toFixed(1)}%
              </div>
              <div>
                <div className={`text-lg font-semibold ${attendanceGrade.color}`}>
                  {attendanceGrade.grade}
                </div>
                <div className="text-sm text-gray-600">
                  {attendanceSummary.presentDays} out of {attendanceSummary.totalDays} days
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-yellow-600">{attendanceSummary.lateDays}</div>
                <div className="text-gray-600">Late</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{attendanceSummary.excusedDays}</div>
                <div className="text-gray-600">Excused</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                attendanceSummary.attendancePercentage >= 85 ? 'bg-green-500' :
                attendanceSummary.attendancePercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(attendanceSummary.attendancePercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>Required: 75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Month Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Attendance Details</h3>
          <div className="flex space-x-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Attendance Details Table */}
        {filteredDetails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No attendance records for the selected month</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Period/Subject</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Professor</th>
                  <th className="text-left py-3 px-4 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((detail, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(detail.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{detail.period}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(detail.status)}`}>
                          {getStatusIcon(detail.status)} {detail.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{detail.professorName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>
                          {detail.remarks && (
                            <div className="text-sm">{detail.remarks}</div>
                          )}
                          {detail.notes && (
                            <div className="text-xs text-gray-500 mt-1">Class: {detail.notes}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Insights */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Attendance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Monthly Performance</h4>
            <div className="space-y-2">
              {Array.from({ length: 6 }, (_, i) => {
                const monthDate = new Date();
                monthDate.setMonth(monthDate.getMonth() - i);
                const monthName = monthDate.toLocaleString('default', { month: 'short' });
                
                // Calculate attendance for this month (mock data for now)
                const monthlyPercentage = Math.max(0, attendanceSummary.attendancePercentage - (i * 2));
                
                return (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{monthName} {monthDate.getFullYear()}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            monthlyPercentage >= 85 ? 'bg-green-500' :
                            monthlyPercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${monthlyPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {monthlyPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Tips */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Attendance Guidelines</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-800">Minimum 75% attendance required</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800">85%+ attendance for excellent grade</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800">Contact professor for excused absences</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-800">Below 75% may affect academic standing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceView;