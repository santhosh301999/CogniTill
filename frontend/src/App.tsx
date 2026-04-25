import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repairs from './pages/Repairs';
import RepairIntake from './pages/RepairIntake';
import RepairTracker from './pages/RepairTracker';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import CloseWizard from './pages/CloseWizard';
import OpenRegister from './pages/OpenRegister';
import Vouchers from './pages/Vouchers';
import AIListingGenerator from './pages/AIListingGenerator';
import Reports from './pages/Reports';
import MonthlySalesReport from './pages/MonthlySalesReport';
import PinVerification from './pages/PinVerification';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/repairs" element={
            <ProtectedRoute>
              <Layout><Repairs /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/repair-intake" element={
            <ProtectedRoute>
              <Layout><RepairIntake /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/repair-tracker" element={
            <ProtectedRoute>
              <Layout><RepairTracker /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/sales" element={
            <ProtectedRoute>
              <Layout><Sales /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Layout><Inventory /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/close-wizard" element={
            <ProtectedRoute roles={['admin', 'manager', 'employee']}>
              <Layout><CloseWizard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/open-register" element={
            <ProtectedRoute roles={['admin', 'manager', 'employee']}>
              <Layout><OpenRegister /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/vouchers" element={
            <ProtectedRoute>
              <Layout><Vouchers /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/ai-listing" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Layout><AIListingGenerator /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/monthly-report" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><MonthlySalesReport /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/pin-verify" element={
            <ProtectedRoute>
              <Layout><PinVerification /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
