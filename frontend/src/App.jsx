import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/common/Toast";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";

// Public Pages
import { LandingPage } from "./pages/public/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

// Student Pages
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { MyComplaintsPage } from "./pages/student/MyComplaintsPage";
import { SubmitComplaintPage } from "./pages/student/SubmitComplaintPage";
import { ComplaintDetailsPage } from "./pages/student/ComplaintDetailsPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AllComplaintsPage } from "./pages/admin/AllComplaintsPage";

// Department Staff Pages
import { DeptDashboard } from "./pages/department/DeptDashboard";

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student & Staff Routes */}
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
              path="/student/complaints"
              element={
                <ProtectedRoute allowedRoles={["STUDENT_STAFF", "ADMIN", "DEPT_STAFF"]}>
                  <DashboardLayout>
                    <MyComplaintsPage />
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
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
