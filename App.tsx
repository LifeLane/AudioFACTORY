/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Root Router & Application Entry
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketingLayout } from './src/website/components/MarketingLayout';
import { HomePage } from './src/website/pages/HomePage';
import { FeaturesPage } from './src/website/pages/FeaturesPage';
import { PricingPage } from './src/website/pages/PricingPage';
import { HowItWorksPage } from './src/website/pages/HowItWorksPage';
import { VoicesPage } from './src/website/pages/VoicesPage';
import { UseCasesPage } from './src/website/pages/UseCasesPage';
import { FaqPage } from './src/website/pages/FaqPage';
import { AboutPage } from './src/website/pages/AboutPage';
import { ContactPage } from './src/website/pages/ContactPage';
import { PrivacyPage } from './src/website/pages/PrivacyPage';
import { TermsPage } from './src/website/pages/TermsPage';
import { RefundPolicyPage } from './src/website/pages/RefundPolicyPage';
import { AccountDeletionPage } from './src/website/pages/AccountDeletionPage';
import { StudioApp } from './src/studio/StudioApp';
import { ProfileDashboard } from './src/pages/ProfileDashboard';
import { AdminPanel } from './src/pages/AdminPanel';
import { useAds } from './src/monetization/useAds';

const AdIntegrator: React.FC = () => {
  useAds();
  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AdIntegrator />
      <Routes>
        {/* ================= ADMIN & PROFILE ================= */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profile" element={<ProfileDashboard />} />

        {/* ================= MARKETING WEBSITE ROUTES ================= */}
        <Route 
          path="/" 
          element={
            <MarketingLayout>
              <HomePage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/features" 
          element={
            <MarketingLayout>
              <FeaturesPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <MarketingLayout>
              <PricingPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/how-it-works" 
          element={
            <MarketingLayout>
              <HowItWorksPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/voices" 
          element={
            <MarketingLayout>
              <VoicesPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/use-cases" 
          element={
            <MarketingLayout>
              <UseCasesPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/faq" 
          element={
            <MarketingLayout>
              <FaqPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/about" 
          element={
            <MarketingLayout>
              <AboutPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/contact" 
          element={
            <MarketingLayout>
              <ContactPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/privacy" 
          element={
            <MarketingLayout>
              <PrivacyPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/terms" 
          element={
            <MarketingLayout>
              <TermsPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/refund-policy" 
          element={
            <MarketingLayout>
              <RefundPolicyPage />
            </MarketingLayout>
          } 
        />
        <Route 
          path="/account-deletion" 
          element={
            <MarketingLayout>
              <AccountDeletionPage />
            </MarketingLayout>
          } 
        />

        {/* ================= APPLICATION STUDIO ROUTES ================= */}
        <Route path="/app" element={<StudioApp />} />
        <Route path="/app/studio" element={<StudioApp />} />
        <Route path="/app/projects" element={<StudioApp />} />
        <Route path="/app/account" element={<StudioApp />} />
        <Route path="/app/billing" element={<StudioApp />} />

        {/* ================= CATCH-ALL REDIRECT ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
