import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useParams } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import VerifyPaymentPage from "./pages/VerifyPaymentPage";
import ConsultationBooking from "./components/consultation/ConsultationBooking";
import ConsultationVerify from "./components/consultation/ConsultationVerify";
import StorePage from "./pages/StorePage";
import CheckoutPage from "./pages/CheckoutPage";

// Components - Student
import StudentDashboard from "./components/student/Dashboard";
import CourseLearning from "./components/courses/CourseLearning";

// Components - Admin
import AdminDashboard from "./components/admin/AdminDashboard";

// Common Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import ScrollToTop from "./components/common/ScrollToTop";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
          {/* ============================================ */}
          {/* PUBLIC ROUTES */}
          {/* ============================================ */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-payment/:reference"
            element={<VerifyPaymentPage />}
          />
          <Route path="/consultation" element={<ConsultationBooking />} />
          <Route
            path="/consultation-verify/:reference"
            element={<ConsultationVerify />}
          />
          {/* ============================================ */}
          {/* PROTECTED STUDENT ROUTES */}
          {/* ============================================ */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/learn/:slug"
            element={
              <ProtectedRoute>
                <CourseLearning />
              </ProtectedRoute>
            }
          />
          {/* ============================================ */}
          {/* PROTECTED ADMIN ROUTES */}
          {/* ============================================ */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* ============================================ */}
          {/* FALLBACK - REDIRECT TO HOME */}
          {/* ============================================ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
