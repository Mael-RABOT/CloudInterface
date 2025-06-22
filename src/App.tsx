import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoginMobile from './components/mobile/LoginMobile';
import DashboardMobile from './components/mobile/DashboardMobile';
import { useDeviceDetection } from './utils/deviceDetection';
import './App.css';
import './mobile.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isMobile } = useDeviceDetection();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000'
      }}>
        <div className="retro-spinner">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login route - redirect to dashboard if already authenticated */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> :
          isMobile ? <LoginMobile /> : <Login />
        }
      />

      {/* Protected dashboard route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {isMobile ? <DashboardMobile /> : <Dashboard />}
          </ProtectedRoute>
        }
      />

      {/* Catch all other routes and redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00ff00',
          colorSuccess: '#00ff00',
          colorWarning: '#ffff00',
          colorError: '#ff0000',
          colorInfo: '#00ff00',
          borderRadius: 0,
          fontFamily: 'VT323, monospace',
          fontSize: 16,
        },
        components: {
          Button: {
            borderRadius: 0,
            controlHeight: 40,
            fontSize: 16,
            fontWeight: 400,
          },
          Input: {
            borderRadius: 0,
            controlHeight: 40,
            fontSize: 16,
          },
          Table: {
            borderRadius: 0,
            headerBg: '#001100',
            rowHoverBg: '#001100',
          },
          Card: {
            borderRadius: 0,
            headerBg: '#001100',
          },
          Modal: {
            borderRadius: 0,
            headerBg: '#001100',
          },
          Tabs: {
            borderRadius: 0,
            itemSelectedColor: '#00ff00',
            itemHoverColor: '#00aa00',
            inkBarColor: '#00ff00',
          },
        },
      }}
    >
      <div className="crt-screen" />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;
