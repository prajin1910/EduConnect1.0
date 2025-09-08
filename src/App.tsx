import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import StyledLogin from "./components/auth/StyledLogin";
import StyledRegister from "./components/auth/StyledRegister";
import VerifyOTP from "./components/auth/VerifyOTP";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Toast from "./components/common/Toast";
import AlumniDashboard from "./components/dashboards/AlumniDashboard";
import ManagementDashboard from "./components/dashboards/ManagementDashboard";
import ProfessorDashboard from "./components/dashboards/ProfessorDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import DebugPage from "./components/DebugPage";
import UserProfileView from "./components/features/UserProfileView";
import LandingPage from "./components/LandingPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<StyledLogin />} />
              <Route path="/register" element={<StyledRegister />} />
              <Route path="/login-old" element={<Login />} />
              <Route path="/register-old" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "STUDENT",
                      "PROFESSOR",
                      "ALUMNI",
                      "MANAGEMENT",
                    ]}
                  >
                    <UserProfileView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={["STUDENT"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/professor"
                element={
                  <ProtectedRoute allowedRoles={["PROFESSOR"]}>
                    <ProfessorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/management"
                element={
                  <ProtectedRoute allowedRoles={["MANAGEMENT"]}>
                    <ManagementDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alumni"
                element={
                  <ProtectedRoute allowedRoles={["ALUMNI"]}>
                    <AlumniDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<LandingPage />} />
            </Routes>
          </Router>
        </AuthProvider>
        <Toast />
      </ToastProvider>
    </div>
  );
}

export default App;
