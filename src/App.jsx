import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';

// Public Landing Page
import PublicHome from './pages/PublicHome';

// Admin Portal
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardOverview from './pages/admin/DashboardOverview';
import EnquiriesManager from './pages/admin/EnquiriesManager';
import ProjectsManager from './pages/admin/ProjectsManager';
import ServicesManager from './pages/admin/ServicesManager';
import TechnologiesManager from './pages/admin/TechnologiesManager';
import CompanySettings from './pages/admin/CompanySettings';

// Styles
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/responsive.css';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CompanyProvider>
        <AuthProvider>
          <Routes>
            {/* Public Website */}
            <Route path="/" element={<PublicHome />} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="enquiries" element={<EnquiriesManager />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="services" element={<ServicesManager />} />
              <Route path="technologies" element={<TechnologiesManager />} />
              <Route path="settings" element={<CompanySettings />} />
            </Route>

            {/* Fallback to Public Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </CompanyProvider>
    </BrowserRouter>
  );
}
