import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';

// Pages
import Home from './pages/Public/Home';
import Courses from './pages/Public/Courses';
import PackageDetail from './pages/Public/PackageDetail';
import CourseDetail from './pages/Public/CourseDetail';
import About from './pages/Public/About';
import Contact from './pages/Public/Contact';
import Packages from './pages/Public/Packages';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import StudentDashboard from './pages/Student/Dashboard';
import WatchCourse from './pages/Student/WatchCourse';
import KYC from './pages/Student/KYC';
import MyCourses from './pages/Student/MyCourses';
import Wallet from './pages/Student/Wallet';
import Commissions from './pages/Student/Commissions';
import Referrals from './pages/Student/Referrals';
import Leaderboard from './pages/Student/Leaderboard';
import Profile from './pages/Student/Profile';
import Achievements from './pages/Student/Achievements';
import Certificates from './pages/Student/Certificates';
import Trip from './pages/Student/Trip';
import Nominee from './pages/Student/Nominee';
import Support from './pages/Student/Support';
import Trainings from './pages/Student/Trainings';
import Freelancing from './pages/Student/Freelancing';
import Tools from './pages/Student/Tools';
import Community from './pages/Student/Community';
import Marketing from './pages/Student/Marketing';
import Upgrade from './pages/Student/Upgrade';
import Offers from './pages/Student/Offers';
import Checkout from './pages/Student/Checkout';
import StudentPackages from './pages/Student/StudentPackages';
import StudentPackageDetail from './pages/Student/StudentPackageDetail';
import MyTeam from './pages/Student/MyTeam';
import LinkGenerator from './pages/Student/LinkGenerator';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminKyc from './pages/Admin/AdminKyc';
import AdminPackages from './pages/Admin/AdminPackages';
import AdminCourses from './pages/Admin/AdminCourses';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminWithdrawals from './pages/Admin/AdminWithdrawals';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminChapters from './pages/Admin/AdminChapters';
import AdminCommissions from './pages/Admin/AdminCommissions';
import AdminReferrals from './pages/Admin/AdminReferrals';
import AdminManagers from './pages/Admin/AdminManagers';
import AdminTeamMembers from './pages/Admin/AdminTeamMembers';
import AdminWalletDetails from './pages/Admin/AdminWalletDetails';
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerTeam from './pages/Manager/ManagerTeam';
import ManagerCommissions from './pages/Manager/ManagerCommissions';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';

import BrandedLoader from './components/BrandedLoader';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <BrandedLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Student Routes wrapped in DashboardLayout */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student', 'manager', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="kyc" element={<KYC />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="trip" element={<Trip />} />
          <Route path="nominee" element={<Nominee />} />
          <Route path="support" element={<Support />} />
          <Route path="trainings" element={<Trainings />} />
          <Route path="freelancing" element={<Freelancing />} />
          <Route path="tools" element={<Tools />} />
          <Route path="community" element={<Community />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="upgrade" element={<Upgrade />} />
          <Route path="offers" element={<Offers />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="packages" element={<StudentPackages />} />
          <Route path="packages/:id" element={<StudentPackageDetail />} />
          <Route path="my-team" element={<MyTeam />} />
          <Route path="link-generator" element={<LinkGenerator />} />
          <Route path="watch/:courseId" element={<WatchCourse />} />
        </Route>

        {/* Protected Admin Routes wrapped in AdminLayout */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="kyc" element={<AdminKyc />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:courseId/chapters" element={<AdminChapters />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="referrals" element={<AdminReferrals />} />
          <Route path="managers" element={<AdminManagers />} />
          <Route path="team-members" element={<AdminTeamMembers />} />
          <Route path="wallet-details" element={<AdminWalletDetails />} />
        </Route>

        {/* Protected Manager Routes wrapped in ManagerLayout */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ManagerDashboard />} />
          <Route path="team" element={<ManagerTeam />} />
          <Route path="commissions" element={<ManagerCommissions />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
