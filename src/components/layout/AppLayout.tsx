/* ═══════════════════════════════════════════════════════
   SkySignal — Responsive Master-Detail App Layout
   ObsidianSidebar (228px fixed desktop / off-canvas mobile)
   + Sticky Topbar with breadcrumbs & IST clock
   + Ambient glassmorphic canvas
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ObsidianSidebar from './ObsidianSidebar';
import Topbar from './Topbar';
import NavigationBar from './NavigationBar';
import AdminLoginModal from '../auth/AdminLoginModal';
import LocationGateModal from '../location/LocationGateModal';
import TelemetryToast from '../telemetry/TelemetryToast';
import EventDetailDrawer from '../events/EventDetailDrawer';
import FloatingSOSButton from '../citizen/FloatingSOSButton';

export default function AppLayout() {
  const { isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [inspectedTelemetryEvent, setInspectedTelemetryEvent] = useState<any | null>(null);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-slate-800 flex flex-col">
      {/* Ambient Atmospheric Radial Background Glow */}
      <div className="ambient-glow" aria-hidden="true" />

      {/* ── Slide-over Obsidian Sidebar Drawer ── */}
      <ObsidianSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* ── Main App Shell Area (Full width) ── */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Sticky Topbar */}
        <Topbar />

        {/* Sticky Horizontal Navigation Bar with Menu Toggle */}
        <NavigationBar onToggleMenu={() => setMenuOpen(!menuOpen)} />

        {/* Routed Page Content */}
        <main className="relative flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Real-Time SSE Telemetry Toast (Analyst only) ── */}
      {isAdmin && <TelemetryToast onSelectEvent={setInspectedTelemetryEvent} />}

      {/* ── Event Detail Drawer from Telemetry Toast (Admin Only) ── */}
      {isAdmin && inspectedTelemetryEvent && (
        <EventDetailDrawer
          event={inspectedTelemetryEvent}
          onClose={() => setInspectedTelemetryEvent(null)}
        />
      )}

      {/* ── Floating SOS Emergency Dispatch (Citizen View Only) ── */}
      {!isAdmin && <FloatingSOSButton />}

      {/* ── Admin Login Modal ── */}
      <AdminLoginModal />

      {/* ── Location Gate Modal (Onboarding & On-Demand Switcher) ── */}
      <LocationGateModal />
    </div>
  );
}
