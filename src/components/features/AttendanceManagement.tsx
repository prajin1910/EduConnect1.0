import {
  FileText,
  Save,
  User,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import api from "../../services/api";

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
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
}

const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("take-attendance");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data for taking attendance
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split("T")[0],
    period: "",
    notes: "",
    studentAttendances: [] as Array<{
      studentId: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
      remarks: string;
    }>,
  });

  const classes = ["I", "II", "III", "IV"];

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
    loadAttendanceRecords();
  }, [selectedClass]);

  const loadStudents = async () => {
    if (!selectedClass) {
      console.log(
        "AttendanceManagement: Missing selectedClass:",
        selectedClass
      );
      return;
    }

    // Use professor's actual department from user object - this is critical
    const professorDepartment = user?.department;

    if (!professorDepartment) {
      console.error(
        "AttendanceManagement: Professor department is missing from user object:",
        user
      );
      showToast(
        "Professor department not found. Please contact administration to update your department information.",
        "error"
      );
      return;
    }

    console.log(
      "AttendanceManagement: Using professor department:",
      professorDepartment,
      "for user:",
      user?.email
    );
    console.log("AttendanceManagement: Full user object:", user);

    try {
      setLoading(true);
      console.log(
        "AttendanceManagement: Loading students for department:",
        professorDepartment,
        "class:",
        selectedClass
      );

      const apiUrl = `/attendance/students?department=${encodeURIComponent(
        professorDepartment
      )}&className=${selectedClass}`;
      console.log("AttendanceManagement: Making API call to:", apiUrl);

      const response = await api.get(apiUrl);
      const studentsData = response.data;

      console.log("AttendanceManagement: API response:", response);
      console.log("AttendanceManagement: Students data:", studentsData);
      console.log(
        "AttendanceManagement: Number of students found:",
        studentsData.length
      );

      if (studentsData.length === 0) {
        showToast(
          `No students found for ${professorDepartment} department, Class ${selectedClass}. Please verify the class exists.`,
          "warning"
        );
      }

      setStudents(studentsData);

      // Initialize attendance data for all students
      setAttendanceData((prev) => ({
        ...prev,
        studentAttendances: studentsData.map((student: Student) => ({
          studentId: student.id,
          status: "PRESENT" as const,
          remarks: "",
        })),
      }));

      console.log(
        "Loaded students for class",
        selectedClass,
        ":",
        studentsData.length
      );
    } catch (error: any) {
      console.error("AttendanceManagement: Error loading students:", error);
      console.error("AttendanceManagement: Error response:", error.response);
      console.error(
        "AttendanceManagement: Error response data:",
        error.response?.data
      );
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data ||
        "Failed to load students";
      showToast(errorMessage, "error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const response = await api.get(
        `/attendance/professor/records${
          selectedClass ? `?className=${selectedClass}` : ""
        }`
      );
      setAttendanceRecords(response.data);
    } catch (error: any) {
      console.error("Error loading attendance records:", error);
      setAttendanceRecords([]);
    }
  };

  const updateStudentAttendance = (
    studentId: string,
    field: "status" | "remarks",
    value: string
  ) => {
    setAttendanceData((prev) => ({
      ...prev,
      studentAttendances: prev.studentAttendances.map((sa) =>
        sa.studentId === studentId ? { ...sa, [field]: value } : sa
      ),
    }));
  };

  const submitAttendance = async () => {
    if (!attendanceData.period.trim()) {
      showToast("Please enter the period/subject name", "error");
      return;
    }

    if (!selectedClass) {
      showToast("Please select a class", "error");
      return;
    }

    try {
      setSubmitting(true);

      // Use professor's actual department
      const professorDepartment = user?.department;

      if (!professorDepartment) {
        console.error(
          "AttendanceManagement: Professor department missing for attendance submission"
        );
        showToast(
          "Professor department not found in your profile. Please contact administration.",
          "error"
        );
        return;
      }

      const submissionData = {
        department: professorDepartment,
        className: selectedClass,
        date: attendanceData.date,
        period: attendanceData.period,
        notes: attendanceData.notes,
        studentAttendances: attendanceData.studentAttendances,
      };

      console.log(
        "AttendanceManagement: Submitting attendance with data:",
        submissionData
      );

      await api.post("/attendance/submit", submissionData);

      showToast("Attendance submitted successfully!", "success");

      // Reset form
      setAttendanceData({
        date: new Date().toISOString().split("T")[0],
        period: "",
        notes: "",
        studentAttendances: students.map((student) => ({
          studentId: student.id,
          status: "PRESENT",
          remarks: "",
        })),
      });

      // Reload records
      loadAttendanceRecords();
    } catch (error: any) {
      console.error("Error submitting attendance:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data ||
        "Failed to submit attendance";
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white";
      case "ABSENT":
        return "bg-gradient-to-r from-red-400 to-rose-500 text-white";
      case "LATE":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "EXCUSED":
        return "bg-gradient-to-r from-blue-400 to-indigo-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const calculateAttendanceStats = (record: AttendanceRecord) => {
    const total = record.studentAttendances.length;
    const present = record.studentAttendances.filter(
      (sa) => sa.status === "PRESENT"
    ).length;
    const absent = record.studentAttendances.filter(
      (sa) => sa.status === "ABSENT"
    ).length;
    const late = record.studentAttendances.filter(
      (sa) => sa.status === "LATE"
    ).length;
    const excused = record.studentAttendances.filter(
      (sa) => sa.status === "EXCUSED"
    ).length;

    return {
      total,
      present,
      absent,
      late,
      excused,
      percentage: total > 0 ? (present / total) * 100 : 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-6 border border-cyan-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Attendance Management
              </h2>
              <p className="text-cyan-600 font-medium">
                Track and manage student attendance
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {attendanceRecords.length}
            </div>
            <div className="text-sm text-gray-600">Records</div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-2">
        <nav className="flex space-x-2">
          <button
            onClick={() => setActiveTab("take-attendance")}
            className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 ${
              activeTab === "take-attendance"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            Take Attendance
          </button>
          <button
            onClick={() => setActiveTab("view-records")}
            className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 ${
              activeTab === "view-records"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            View Records
          </button>
        </nav>
      </div>

      {/* Take Attendance Tab */}
      {activeTab === "take-attendance" && (
        <div className="space-y-6">
          {/* Enhanced Class Selection */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Select Class</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {classes.map((className) => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedClass === className
                      ? "border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      Class {className}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {user?.department}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Attendance Form */}
          {selectedClass && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Take Attendance - Class {selectedClass}
                    </h3>
                    <p className="text-green-600 font-medium">
                      {students.length} students enrolled
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Date, Period, and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Date
                  </label>
                  <input
                    type="date"
                    value={attendanceData.date}
                    onChange={(e) =>
                      setAttendanceData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Period/Subject *
                  </label>
                  <input
                    type="text"
                    value={attendanceData.period}
                    onChange={(e) =>
                      setAttendanceData((prev) => ({
                        ...prev,
                        period: e.target.value,
                      }))
                    }
                    placeholder="e.g., Mathematics, Period 1"
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={attendanceData.notes}
                    onChange={(e) =>
                      setAttendanceData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Class notes or remarks"
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Enhanced Students List */}
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    No Students Found
                  </h3>
                  <p className="text-gray-500">
                    No students found for Class {selectedClass}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-xl font-bold text-gray-800">
                        Student Attendance
                      </h4>
                      <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-2xl text-sm font-semibold">
                        {students.length} Students
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setAttendanceData((prev) => ({
                            ...prev,
                            studentAttendances: prev.studentAttendances.map(
                              (sa) => ({ ...sa, status: "PRESENT" })
                            ),
                          }));
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark All Present</span>
                      </button>
                      <button
                        onClick={() => {
                          setAttendanceData((prev) => ({
                            ...prev,
                            studentAttendances: prev.studentAttendances.map(
                              (sa) => ({ ...sa, status: "ABSENT" })
                            ),
                          }));
                        }}
                        className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Mark All Absent</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {students.map((student) => {
                      const studentAttendance =
                        attendanceData.studentAttendances.find(
                          (sa) => sa.studentId === student.id
                        );

                      return (
                        <div
                          key={student.id}
                          className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 rounded-3xl p-6 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 text-lg">
                                  {student.name}
                                </h4>
                                <p className="text-blue-600 font-semibold">
                                  {student.studentId}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {student.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              {/* Enhanced Status Buttons */}
                              <div className="flex space-x-2">
                                {[
                                  {
                                    status: "PRESENT",
                                    icon: CheckCircle,
                                    color: "from-green-500 to-emerald-500",
                                  },
                                  {
                                    status: "ABSENT",
                                    icon: XCircle,
                                    color: "from-red-500 to-rose-500",
                                  },
                                  {
                                    status: "LATE",
                                    icon: AlertCircle,
                                    color: "from-yellow-500 to-orange-500",
                                  },
                                  {
                                    status: "EXCUSED",
                                    icon: Info,
                                    color: "from-blue-500 to-indigo-500",
                                  },
                                ].map(({ status, icon: Icon, color }) => (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      updateStudentAttendance(
                                        student.id,
                                        "status",
                                        status
                                      )
                                    }
                                    className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                                      studentAttendance?.status === status
                                        ? `bg-gradient-to-r ${color} text-white shadow-lg`
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" />
                                    <span>{status}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Enhanced Remarks Input */}
                              <input
                                type="text"
                                value={studentAttendance?.remarks || ""}
                                onChange={(e) =>
                                  updateStudentAttendance(
                                    student.id,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                                placeholder="Add remarks..."
                                className="w-40 p-3 border-2 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Enhanced Submit Button */}
                  <div className="flex justify-end pt-8 border-t-2 border-gray-100">
                    <button
                      onClick={submitAttendance}
                      disabled={submitting || !attendanceData.period.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-3xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                          <span>Submitting Attendance...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-6 w-6" />
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

      {/* Enhanced View Records Tab */}
      {activeTab === "view-records" && (
        <div className="space-y-6">
          {/* Enhanced Filter Controls */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Attendance Records
                </h3>
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-6 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 font-semibold"
              >
                <option value="">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    Class {className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Records List */}
          <div className="space-y-6">
            {attendanceRecords.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No Attendance Records
                </h3>
                <p className="text-gray-600 text-lg">
                  Start taking attendance to see records here.
                </p>
              </div>
            ) : (
              attendanceRecords.map((record) => {
                const stats = calculateAttendanceStats(record);

                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {record.period} - Class {record.className}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-2xl text-sm font-bold">
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                              <span className="text-gray-500 font-medium">
                                by {record.professorName}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                            <div className="text-2xl font-bold text-gray-800">
                              {stats.total}
                            </div>
                            <div className="text-gray-600 font-semibold">
                              Total
                            </div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200">
                            <div className="text-2xl font-bold text-green-700">
                              {stats.present}
                            </div>
                            <div className="text-green-600 font-semibold">
                              Present
                            </div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl border border-red-200">
                            <div className="text-2xl font-bold text-red-700">
                              {stats.absent}
                            </div>
                            <div className="text-red-600 font-semibold">
                              Absent
                            </div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-700">
                              {stats.late}
                            </div>
                            <div className="text-yellow-600 font-semibold">
                              Late
                            </div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">
                              {stats.percentage.toFixed(1)}%
                            </div>
                            <div className="text-blue-600 font-semibold">
                              Attendance
                            </div>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
                            <p className="text-amber-800 font-medium">
                              <strong>Notes:</strong> {record.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Student Details Table */}
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">
                        Student Details
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-4 px-4 font-bold text-gray-700">
                                Student
                              </th>
                              <th className="text-center py-4 px-4 font-bold text-gray-700">
                                Status
                              </th>
                              <th className="text-left py-4 px-4 font-bold text-gray-700">
                                Remarks
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.studentAttendances.map((sa, index) => (
                              <tr
                                key={sa.studentId}
                                className={`border-b border-gray-100 ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-blue-50 transition-colors`}
                              >
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                      <span className="text-white font-bold">
                                        {sa.studentName.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-800">
                                        {sa.studentName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {sa.studentEmail}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center py-4 px-4">
                                  <span
                                    className={`px-3 py-1 rounded-2xl text-sm font-bold ${getStatusColor(
                                      sa.status
                                    )}`}
                                  >
                                    {sa.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-gray-600 font-medium">
                                  {sa.remarks || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
