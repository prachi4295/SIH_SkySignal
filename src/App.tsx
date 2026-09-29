/* ═══════════════════════════════════════════════════════
   SkySignal — App Entry & Router
   Client-side SPA routing with React.lazy code splitting
   AuthProvider wrapper + responsive layout shell
   ═══════════════════════════════════════════════════════ */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dynamic code splitting for all route pages
const Overview = lazy(() => import('./pages/Overview'));
const VerificationQueue = lazy(() => import('./pages/VerificationQueue'));
const DuplicateReview = lazy(() => import('./pages/DuplicateReview'));
const Analytics = lazy(() => import('./pages/Analytics'));
const DataSourcesPage = lazy(() => import('./pages/DataSourcesPage'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const CitizenPortal = lazy(() => import('./pages/CitizenPortal'));
const ReliefNetwork = lazy(() => import('./pages/ReliefNetwork'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const EmergencyDirectoryPage = lazy(() => import('./pages/EmergencyDirectoryPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

// Sleek atmospheric loading spinner fallback
function RouteLoadingFallback() {
  const isHindi = typeof window !== 'undefined' && localStorage.getItem('i18nextLng') === 'hi';
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 animate-fade-in">
      <div className="relative flex h-10 w-10">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-10 w-10 bg-sky-600 items-center justify-center text-white text-[12px] font-bold">
          SS
        </span>
      </div>
      <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
        {isHindi ? 'टेलीमेट्री स्ट्रीम लोड हो रही है...' : 'Loading Telemetry Stream...'}
      </p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
          <Routes>
          <Route element={<AppLayout />}>
            {/* ── Public Routes (Accessible by Guests & Admins in Read-Only Mode) ── */}
            {/* Weather Status (Home) */}
            <Route
              index
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Overview />
                </Suspense>
              }
            />
            <Route path="/overview" element={<Navigate to="/" replace />} />

            {/* Redirect legacy explorer paths to Weather Status */}
            {/* Crisis Aid & Disaster Relief Network */}
            <Route
              path="/relief-network"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ReliefNetwork />
                </Suspense>
              }
            />
            <Route path="/aid" element={<Navigate to="/relief-network" replace />} />
            <Route path="/relief" element={<Navigate to="/relief-network" replace />} />

            {/* Emergency Directory & Helplines */}
            <Route
              path="/emergency"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <EmergencyDirectoryPage />
                </Suspense>
              }
            />
            <Route path="/helplines" element={<Navigate to="/emergency" replace />} />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SettingsPage />
                </Suspense>
              }
            />

            {/* Privacy Policy */}
            <Route
              path="/privacy"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PrivacyPolicyPage />
                </Suspense>
              }
            />
            <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />

            {/* Citizen Portal (/report and alias /citizen) */}
            <Route
              path="/report"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <CitizenPortal />
                </Suspense>
              }
            />
            <Route path="/citizen" element={<Navigate to="/report" replace />} />

            {/* ── Protected Admin Routes (Admins Only — Verification, Duplicates, Audit, Analytics) ── */}
            <Route element={<ProtectedRoute />}>
              {/* Analytics Dashboard */}
              <Route
                path="/analytics"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Analytics />
                  </Suspense>
                }
              />

              {/* Verification Queue */}
              <Route
                path="/verification"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <VerificationQueue />
                  </Suspense>
                }
              />

              {/* Duplicate Review */}
              <Route
                path="/duplicates"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <DuplicateReview />
                  </Suspense>
                }
              />

              {/* Ingestion Sources */}
              <Route
                path="/sources"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <DataSourcesPage />
                  </Suspense>
                }
              />

              {/* Audit Log */}
              <Route
                path="/audit"
                element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <AuditLog />
                  </Suspense>
                }
              />
            </Route>

            {/* 404 Catch-All */}
            <Route
              path="*"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PlaceholderPage
                    title="Page Not Found"
                    description="The requested page could not be found. Please check the URL or navigate using the sidebar."
                  />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
  );
}
