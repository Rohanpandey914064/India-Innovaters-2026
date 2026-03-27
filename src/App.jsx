import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Feed from '@/pages/Feed';
import MapView from '@/pages/MapView';
import Services from '@/pages/Services';
import AICivicAssistant from '@/pages/AICivicAssistant';

import ReportIssue from '@/pages/ReportIssue';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import HelpCenter from '@/pages/HelpCenter';
import Blog from '@/pages/Blog';
import About from '@/pages/About';
import Careers from '@/pages/Careers';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import Pricing from '@/pages/Pricing';
import Documentation from '@/pages/Documentation';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={user ? <Navigate to="/home" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/home" /> : <Auth isLogin={true} />} />
          <Route path="/signup" element={user ? <Navigate to="/home" /> : <Auth isLogin={false} />} />
          
          {/* Informational Pages */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/docs" element={<Documentation />} />

          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><AICivicAssistant /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
          <Route path="/schemes" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/guidance" element={<ProtectedRoute><AICivicAssistant /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
