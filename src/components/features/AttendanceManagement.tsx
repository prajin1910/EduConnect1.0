import { FileText, Save, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  className: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  period: string;
  className: string;
  department: string;
  professorName: string;
  notes?: string;
  studentAttendances: StudentAttendance[];
  createdAt: string;
}

interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('take-attendance');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data for taking attendance
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    period: '',
    notes: '',
    studentAttendances: [] as Array<{
      studentId: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      remarks: string;
    }>
  });

  const classes = ['I', 'II', 'III', 'IV'];

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
    loadAttendanceRecords();
  }, [selectedClass]);

  const loadStudents = async () => {
    if (!selectedClass) {
      console.log('AttendanceManagement: Missing selectedClass:', selectedClass);
      return;
    }
    
    // Use professor's actual department from user object - this is critical
    const professorDepartment = user?.department;
    
    if (!professorDepartment) {
      console.error('AttendanceManagement: Professor department is missing from user object:', user);
      showToast('Professor department not found. Please contact administration to update your department information.', 'error');
      return;
    }
    
    console.log('AttendanceManagement: Using professor department:', professorDepartment, 'for user:', user?.email);
    console.log('AttendanceManagement: Full user object:', user);
    
    try {
      setLoading(true);
      console.log('AttendanceManagement: Loading students for department:', professorDepartment, 'class:', selectedClass);
      
      const apiUrl = `/attendance/students?department=${encodeURIComponent(professorDepartment)}&className=${selectedClass}`;
      console.log('AttendanceManagement: Making API call to:', apiUrl);
      
      const response = await api.get(apiUrl);
      const studentsData = response.data;
      
      console.log('AttendanceManagement: API response:', response);
      console.log('AttendanceManagement: Students data:', studentsData);
      console.log('AttendanceManagement: Number of students found:', studentsData.length);
      
      if (studentsData.length === 0) {
        showToast(`No students found for ${professorDepartment} department, Class ${selectedClass}. Please verify the class exists.`, 'warning');
      }
      
      setStudents(studentsData);
      
      // Initialize attendance data for all students
      setAttendanceData(prev => ({
        ...prev,
        studentAttendances: studentsData.map((student: Student) => ({
          studentId: student.id,
          status: 'PRESENT' as const,
          remarks: ''
        }))
      }));
      
      console.log('Loaded students for class', selectedClass, ':', studentsData.length);
    } catch (error: any) {
      console.error('AttendanceManagement: Error loading students:', error);
      console.error('AttendanceManagement: Error response:', error.response);
      console.error('AttendanceManagement: Error response data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data || 'Failed to load students';
      showToast(errorMessage, 'error');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const response = await api.get(`/attendance/professor/records${selectedClass ? `?className=${selectedClass}` : ''}`);
      setAttendanceRecords(response.data);
    } catch (error: any) {
      console.error('Error loading attendance records:', error);
      setAttendanceRecords([]);
    }
  };

  const updateStudentAttendance = (studentId: string, field: 'status' | 'remarks', value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      studentAttendances: prev.studentAttendances.map(sa =>
        sa.studentId === studentId ? { ...sa, [field]: value } : sa
      )
    }));
  };

  const submitAttendance = async () => {
    if (!attendanceData.period.trim()) {
      showToast('Please enter the period/subject name', 'error');
      return;
    }

    if (!selectedClass) {
      showToast('Please select a class', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      // Use professor's actual department
      const professorDepartment = user?.department;
      
      if (!professorDepartment) {
        console.error('AttendanceManagement: Professor department missing for attendance submission');
        showToast('Professor department not found in your profile. Please contact administration.', 'error');
        return;
      }
      
      const submissionData = {
        department: professorDepartment,
        className: selectedClass,
        date: attendanceData.date,
        period: attendanceData.period,
        notes: attendanceData.notes,
        studentAttendances: attendanceData.studentAttendances
      };

      console.log('AttendanceManagement: Submitting attendance with data:', submissionData);
      
      await api.post('/attendance/submit', submissionData);
      
      showToast('Attendance submitted successfully!', 'success');
      
      // Reset form
      setAttendanceData({
        date: new Date().toISOString().split('T')[0],
        period: '',
        notes: '',
        studentAttendances: students.map(student => ({
          studentId: student.id,
          status: 'PRESENT',
          remarks: ''
        }))
      });
      
      // Reload records
      loadAttendanceRecords();
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      const errorMessage = error.response?.data?.error || error.response?.data || 'Failed to submit attendance';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
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

  const calculateAttendanceStats = (record: AttendanceRecord) => {
    const total = record.studentAttendances.length;
    const present = record.studentAttendances.filter(sa => sa.status === 'PRESENT').length;
    const absent = record.studentAttendances.filter(sa => sa.status === 'ABSENT').length;
    const late = record.studentAttendances.filter(sa => sa.status === 'LATE').length;
    const excused = record.studentAttendances.filter(sa => sa.status === 'EXCUSED').length;
    
    return { total, present, absent, late, excused, percentage: total > 0 ? (present / total) * 100 : 0 };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold">Attendance Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('take-attendance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'take-attendance'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Take Attendance
          </button>
          <button
            onClick={() => setActiveTab('view-records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view-records'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            View Records
          </button>
        </nav>
      </div>

      {/* Take Attendance Tab */}
      {activeTab === 'take-attendance' && (
        <div className="space-y-6">
          {/* Class Selection */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Select Class</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {classes.map((className) => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedClass === className
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">Class {className}</div>
                    <div className="text-sm text-gray-600">{user?.department}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Attendance Form */}
          {selectedClass && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  Take Attendance - Class {selectedClass}
                </h3>
                <div className="text-sm text-gray-600">
                  {students.length} students
                </div>
              </div>

              {/* Date, Period, and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={attendanceData.date}
                    onChange={(e) => setAttendanceData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period/Subject *
                  </label>
                  <input
                    type="text"
                    value={attendanceData.period}
                    onChange={(e) => setAttendanceData(prev => ({ ...prev, period: e.target.value }))}
                    placeholder="e.g., Mathematics, Period 1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={attendanceData.notes}
                    onChange={(e) => setAttendanceData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Class notes or remarks"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Students List */}
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No students found for Class {selectedClass}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Student Attendance</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setAttendanceData(prev => ({
                            ...prev,
                            studentAttendances: prev.studentAttendances.map(sa => ({ ...sa, status: 'PRESENT' }))
                          }));
                        }}
                        className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded"
                      >
                        Mark All Present
                      </button>
                      <button
                        onClick={() => {
                          setAttendanceData(prev => ({
                            ...prev,
                            studentAttendances: prev.studentAttendances.map(sa => ({ ...sa, status: 'ABSENT' }))
                          }));
                        }}
                        className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded"
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {students.map((student) => {
                      const studentAttendance = attendanceData.studentAttendances.find(sa => sa.studentId === student.id);
                      
                      return (
                        <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium">{student.name}</h4>
                                <p className="text-sm text-gray-600">{student.studentId}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {/* Status Buttons */}
                              <div className="flex space-x-2">
                                {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => updateStudentAttendance(student.id, 'status', status)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                      studentAttendance?.status === status
                                        ? getStatusColor(status)
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                              
                              {/* Remarks Input */}
                              <input
                                type="text"
                                value={studentAttendance?.remarks || ''}
                                onChange={(e) => updateStudentAttendance(student.id, 'remarks', e.target.value)}
                                placeholder="Remarks (optional)"
                                className="w-32 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={submitAttendance}
                      disabled={submitting || !attendanceData.period.trim()}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Submit Attendance</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* View Records Tab */}
      {activeTab === 'view-records' && (
        <div className="space-y-6">
          {/* Filter Controls */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Attendance Records</h3>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>Class {className}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {attendanceRecords.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
                <p className="text-gray-600">Start taking attendance to see records here.</p>
              </div>
            ) : (
              attendanceRecords.map((record) => {
                const stats = calculateAttendanceStats(record);
                
                return (
                  <div key={record.id} className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {record.period} - Class {record.className}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-900">{stats.total}</div>
                            <div className="text-gray-600">Total</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-semibold text-green-900">{stats.present}</div>
                            <div className="text-gray-600">Present</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="font-semibold text-red-900">{stats.absent}</div>
                            <div className="text-gray-600">Absent</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="font-semibold text-yellow-900">{stats.late}</div>
                            <div className="text-gray-600">Late</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-semibold text-blue-900">{stats.percentage.toFixed(1)}%</div>
                            <div className="text-gray-600">Attendance</div>
                          </div>
                        </div>
                        
                        {record.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {record.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3">Student</th>
                            <th className="text-center py-2 px-3">Status</th>
                            <th className="text-left py-2 px-3">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.studentAttendances.map((sa) => (
                            <tr key={sa.studentId} className="border-b border-gray-100">
                              <td className="py-2 px-3">
                                <div>
                                  <div className="font-medium">{sa.studentName}</div>
                                  <div className="text-xs text-gray-500">{sa.studentEmail}</div>
                                </div>
                              </td>
                              <td className="text-center py-2 px-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sa.status)}`}>
                                  {sa.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-600">
                                {sa.remarks || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;