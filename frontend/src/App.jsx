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
import InstructorDetail from './pages/Public/InstructorDetail';
import TeamMemberDetail from './pages/Public/TeamMemberDetail';
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
import StudentPlaceholder from './pages/Student/StudentPlaceholder';
import Products from './pages/Student/Products';
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
import AdminInstructors from './pages/Admin/AdminInstructors';
import AdminHomeCustomization from './pages/Admin/AdminHomeCustomization';
import AdminCommunityLinks from './pages/Admin/AdminCommunityLinks';
import AdminTrainings from './pages/Admin/AdminTrainings';
import AdminFreelanceApplications from './pages/Admin/AdminFreelanceApplications';
import AdminCoupons from './pages/Admin/AdminCoupons';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminWithdrawals from './pages/Admin/AdminWithdrawals';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminMasterclassFunnel from './pages/Admin/AdminMasterclassFunnel';
import AdminChapters from './pages/Admin/AdminChapters';
import AdminCommissions from './pages/Admin/AdminCommissions';
import AdminReferrals from './pages/Admin/AdminReferrals';
import AdminManagers from './pages/Admin/AdminManagers';
import AdminTeamMembers from './pages/Admin/AdminTeamMembers';
import AdminWalletDetails from './pages/Admin/AdminWalletDetails';
import AdminAchievements from './pages/Admin/AdminAchievements';
import AdminCertificateTemplate from './pages/Admin/AdminCertificateTemplate';
import AdminManagerEarnings from './pages/Admin/AdminManagerEarnings';
import AdminUsersEarnings from './pages/Admin/AdminUsersEarnings';
import AdminManagerRequests from './pages/Admin/AdminManagerRequests';
import AdminAchievementRequests from './pages/Admin/AdminAchievementRequests';
import AdminPackageUpgrades from './pages/Admin/AdminPackageUpgrades';
import AdminCourseLinks from './pages/Admin/AdminCourseLinks';
import AdminRegistrationDetails from './pages/Admin/AdminRegistrationDetails';
import AdminConnectForm from './pages/Admin/AdminConnectForm';
import AdminProducts from './pages/Admin/AdminProducts';
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerTeam from './pages/Manager/ManagerTeam';
import ManagerCommissions from './pages/Manager/ManagerCommissions';
import ManagerAllUsers from './pages/Manager/ManagerAllUsers';
import ManagerEarnings from './pages/Manager/ManagerEarnings';
import ManagerLeaderboard from './pages/Manager/ManagerLeaderboard';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';

import BrandedLoader from './components/BrandedLoader';
import ScrollToTop from './components/ScrollToTop';

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
      <ScrollToTop />
      <Routes>
        {/* Public Routes wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/instructor/:slug" element={<InstructorDetail />} />
          <Route path="/team/:slug" element={<TeamMemberDetail />} />
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
          <ProtectedRoute allowedRoles={['student', 'manager', 'team_member', 'admin']}>
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
          <Route path="offers" element={<StudentPlaceholder section="offers" />} />
          <Route path="products" element={<Products />} />
          <Route path="packages" element={<StudentPackages />} />
          <Route path="packages/:id" element={<StudentPackageDetail />} />
          <Route path="my-team" element={<MyTeam />} />
          <Route path="link-generator" element={<LinkGenerator />} />
          <Route path="watch/:courseId" element={<WatchCourse />} />
          <Route path="watch-course/:courseId" element={<WatchCourse />} />
        </Route>

        {/* Checkout — deliberately standalone, outside DashboardLayout, so
            payment is a focused full-screen flow without sidebar/header chrome. */}
        <Route path="/student/checkout" element={
          <ProtectedRoute allowedRoles={['student', 'manager', 'team_member', 'admin']}>
            <Checkout />
          </ProtectedRoute>
        } />

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
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="home-customization" element={<AdminHomeCustomization />} />
          <Route path="community-links" element={<AdminCommunityLinks />} />
          <Route path="trainings" element={<AdminTrainings />} />
          <Route path="freelance-applications" element={<AdminFreelanceApplications />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="masterclass-funnel" element={<AdminMasterclassFunnel />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="referrals" element={<AdminReferrals />} />
          <Route path="managers" element={<AdminManagers />} />
          <Route path="team-members" element={<AdminTeamMembers />} />
          <Route path="wallet-details" element={<AdminWalletDetails />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="certificate-template" element={<AdminCertificateTemplate />} />
          <Route path="manager-earnings" element={<AdminManagerEarnings />} />
          <Route path="users-earnings" element={<AdminUsersEarnings />} />
          <Route path="manager-requests" element={<AdminManagerRequests />} />
          <Route path="achievement-requests" element={<AdminAchievementRequests />} />
          <Route path="package-upgrades" element={<AdminPackageUpgrades />} />
          <Route path="course-links" element={<AdminCourseLinks />} />
          <Route path="registration-details" element={<AdminRegistrationDetails />} />
          <Route path="connect-form" element={<AdminConnectForm />} />
          <Route path="products" element={<AdminProducts />} />
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
          <Route path="all-users" element={<ManagerAllUsers />} />
          <Route path="earnings" element={<ManagerEarnings />} />
          <Route path="leaderboard" element={<ManagerLeaderboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
