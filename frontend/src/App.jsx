import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

// Student Pages
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { SubmitComplaintPage } from "./pages/student/SubmitComplaintPage";
import { ComplaintDetailsPage } from "./pages/student/ComplaintDetailsPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AllComplaintsPage } from "./pages/admin/AllComplaintsPage";

// Department Staff Pages
import { DeptDashboard } from "./pages/department/DeptDashboard";

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "DEPT_STAFF") return <Navigate to="/dept" replace />;
  return <Navigate to="/student" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root Role-Based Landing */}
          <Route path="/" element={<RootRedirect />} />

          {/* Student / Staff Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["STUDENT_STAFF", "ADMIN", "DEPT_STAFF"]}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/submit"
            element={
              <ProtectedRoute allowedRoles={["STUDENT_STAFF", "ADMIN"]}>
                <DashboardLayout>
                  <SubmitComplaintPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Unified Complaint Details Route */}
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComplaintDetailsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Administrator Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout>
                  <AllComplaintsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Department Staff Routes */}
          <Route
            path="/dept"
            element={
              <ProtectedRoute allowedRoles={["DEPT_STAFF", "ADMIN"]}>
                <DashboardLayout>
                  <DeptDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
