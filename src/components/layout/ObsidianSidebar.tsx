/* ═══════════════════════════════════════════════════════
   SkySignal — Obsidian Sidebar Navigation
   Desktop: 228px fixed dark gradient #090e17 -> #0d1527
   Mobile (<768px): Hidden off-canvas drawer with backdrop
   Cyan glow bar (#38bdf8) active state styling
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  CloudSun,
  HeartHandshake,
  Smartphone,
  ShieldAlert,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Copy,
  FileCode,
  BarChart3,
  X,
} from 'lucide-react';

interface ObsidianSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  name: string;
  nameHi: string;
  path: string;
  sectionId?: string;
  icon: any;
  badge?: number;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'weather-status',
    name: 'Weather Status',
    nameHi: 'मौसम की स्थिति',
    path: '/#weather-status',
    sectionId: 'weather-status',
    icon: CloudSun,
  },
  {
    id: 'report',
    name: 'Citizen Portal',
    nameHi: 'नागरिक पोर्टल',
    path: '/#report',
    sectionId: 'report',
    icon: Smartphone,
  },
  {
    id: 'relief',
    name: 'Crisis Aid & Relief',
    nameHi: 'आपदा सहायता और राहत',
    path: '/relief-network',
    icon: HeartHandshake,
  },
  {
    id: 'emergency',
    name: 'Emergency Helplines',
    nameHi: 'आपातकालीन हेल्पलाइन',
    path: '/emergency',
    icon: ShieldAlert,
  },
  {
    id: 'settings',
    name: 'Settings',
    nameHi: 'सेटिंग्स',
    path: '/settings',
    icon: Settings,
  },
  {
    id: 'privacy',
    name: 'Privacy Policy',
    nameHi: 'गोपनीयता नीति',
    path: '/privacy',
    icon: ShieldCheck,
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    nameHi: 'एनालिटिक्स डैशबोर्ड',
    path: '/analytics',
    icon: BarChart3,
    adminOnly: true,
  },
  {
    id: 'verification',
    name: 'Verification Queue',
    nameHi: 'सत्यापन कतार',
    path: '/verification',
    icon: CheckCircle2,
    badge: 12,
    adminOnly: true,
  },
  {
    id: 'duplicates',
    name: 'Duplicate Review',
    nameHi: 'डुप्लिकेट समीक्षा',
    path: '/duplicates',
    icon: Copy,
    badge: 3,
    adminOnly: true,
  },
  {
    id: 'audit',
    name: 'Audit Log',
    nameHi: 'ऑडिट लॉग',
    path: '/audit',
    icon: FileCode,
    adminOnly: true,
  },
];

export default function ObsidianSidebar({
  isOpen,
  onClose,
}: ObsidianSidebarProps) {
  const { i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHindi = i18n.language === 'hi';

  const [activeSection, setActiveSection] = useState<string>('');

  // Listen for scroll-spy updates from homepage
  useEffect(() => {
    const handleActiveSection = (e: Event) => {
      const custom = e as CustomEvent<{ section: string }>;
      if (custom.detail?.section) {
        setActiveSection(custom.detail.section);
      }
    };
    window.addEventListener('skysignal:active-section', handleActiveSection);
    return () => window.removeEventListener('skysignal:active-section', handleActiveSection);
  }, []);

  const visibleNavItems = (isAdmin
    ? [
        NAV_ITEMS.find((i) => i.id === 'weather-status'),
        NAV_ITEMS.find((i) => i.id === 'analytics'),
        NAV_ITEMS.find((i) => i.id === 'verification'),
        NAV_ITEMS.find((i) => i.id === 'duplicates'),
        NAV_ITEMS.find((i) => i.id === 'audit'),
        NAV_ITEMS.find((i) => i.id === 'settings'),
        NAV_ITEMS.find((i) => i.id === 'privacy'),
      ]
    : [
        NAV_ITEMS.find((i) => i.id === 'weather-status'),
        NAV_ITEMS.find((i) => i.id === 'report'),
        NAV_ITEMS.find((i) => i.id === 'relief'),
        NAV_ITEMS.find((i) => i.id === 'emergency'),
        NAV_ITEMS.find((i) => i.id === 'settings'),
        NAV_ITEMS.find((i) => i.id === 'privacy'),
      ]
  ).filter((item): item is NavItem => Boolean(item));

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.sectionId) {
      e.preventDefault();
      if (location.pathname === '/') {
        const elem = document.getElementById(item.sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(item.sectionId);
        }
      } else {
        navigate(`/?section=${item.sectionId}`);
      }
      onClose();
    } else {
      onClose();
    }
  };

  const sidebarContent = (
    <aside
      className="
        h-full flex flex-col justify-between
        bg-gradient-to-b from-[#2d2a27] via-[#24211f] to-[#1a1816]
        text-stone-300 border-r border-[#443e39]/80
        shadow-2xl select-none w-full
      "
      aria-label="Main Navigation"
    >
      {/* ── Brand Header ── */}
      <div className="p-4 border-b border-[#443e39]/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="SkySignal Logo"
            className="w-8 h-8 object-contain select-none"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-[16px] tracking-tight">
                <span style={{ color: '#ffffff' }}>Sky</span>
                <span style={{ color: '#d97706' }}>Signal</span>
              </span>
            </div>
            <div className="text-[10px] text-stone-400 tracking-wider uppercase font-semibold">
              {isHindi ? 'आईएमडी रडार कमान' : 'IMD Radar Command'}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors cursor-pointer"
          aria-label="Close menu"
          title="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          {isHindi ? 'नेविगेशन' : 'Intelligence Radar'}
        </div>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isSectionItem = !!item.sectionId;
          const isCurrentActive = isSectionItem
            ? location.pathname === '/' && activeSection === item.sectionId
            : location.pathname === item.path;

          if (isSectionItem) {
            return (
              <a
                key={item.path}
                href={`#${item.sectionId}`}
                onClick={(e) => handleNavClick(item, e)}
                className={`
                  relative flex items-center justify-between px-3 py-2.5 rounded-xl
                  text-[13px] font-medium transition-all duration-200 group cursor-pointer
                  ${
                    isCurrentActive
                      ? 'text-white bg-amber-500/20 shadow-[0_0_20px_rgba(217,119,6,0.22)] font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }
                `}
              >
                {/* Amber Active Indicator Bar (#d97706) */}
                {isCurrentActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-[#d97706] shadow-[0_0_12px_#d97706]"
                    aria-hidden="true"
                  />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isCurrentActive
                        ? 'text-[#d97706]'
                        : 'text-stone-400 group-hover:text-stone-300'
                    }`}
                  />
                  <span className="truncate">
                    {isHindi ? item.nameHi : item.name}
                  </span>
                </div>

                {/* Badge */}
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCurrentActive
                        ? 'bg-[#d97706] text-stone-950 font-black'
                        : 'bg-stone-800 text-stone-300 group-hover:bg-stone-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                relative flex items-center justify-between px-3 py-2.5 rounded-xl
                text-[13px] font-medium transition-all duration-200 group
                ${
                  isActive
                    ? 'text-white bg-amber-500/20 shadow-[0_0_20px_rgba(217,119,6,0.22)] font-semibold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Amber Active Indicator Bar (#d97706) */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-[#d97706] shadow-[0_0_12px_#d97706]"
                      aria-hidden="true"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`transition-colors ${
                        isActive
                          ? 'text-[#d97706]'
                          : 'text-stone-400 group-hover:text-stone-300'
                      }`}
                    />
                    <span className="truncate">
                      {isHindi ? item.nameHi : item.name}
                    </span>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-[#d97706] text-stone-950 font-black'
                          : 'bg-stone-800 text-stone-300 group-hover:bg-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer container (slides from left) */}
      <div className="relative z-10 w-[250px] sm:w-[260px] h-full shadow-2xl animate-slide-in-left">
        {sidebarContent}
      </div>
    </div>
  );
}
