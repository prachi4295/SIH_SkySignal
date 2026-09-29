/* ═══════════════════════════════════════════════════════
   SkySignal — Navigation Bar (Sub-Header Bar)
   Sleek horizontal navigation bar positioned below the Topbar.
   Provides menu toggle beside Weather Status, and quick tab switching
   for Weather Status, Analytics Dashboard, Citizen Portal, and Admin Views.
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  CloudSun,
  Smartphone,
  CheckCircle2,
  Copy,
  FileCode,
  BarChart3,
} from 'lucide-react';

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

interface NavigationBarProps {
  onToggleMenu?: () => void;
}

export default function NavigationBar({ onToggleMenu }: NavigationBarProps) {
  const { i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHindi = i18n.language === 'hi';

  const [activeSection, setActiveSection] = useState<string>('weather-status');

  // Listen to scroll spy events dispatched by the homepage sections
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

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (isAdmin && item.id === 'report') return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    e.preventDefault();

    if (item.sectionId) {
      if (location.pathname === '/') {
        const elem = document.getElementById(item.sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(item.sectionId);
        }
      } else {
        navigate(`/?section=${item.sectionId}`);
      }
    } else {
      navigate(item.path);
    }
  };

  const isItemActive = (item: NavItem) => {
    if (location.pathname === '/') {
      return item.sectionId === activeSection;
    }
    return location.pathname === item.path;
  };

  return (
    <nav
      aria-label="Secondary Navigation"
      className="
        sticky top-[64px] z-10
        bg-white/95 backdrop-blur-md border-b border-slate-200/90
        shadow-xs
        transition-all duration-200
      "
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start gap-2 h-[46px]">
          {/* ── Menu Logo Button (Beside Weather Status) ── */}
          {onToggleMenu && (
            <button
              onClick={onToggleMenu}
              className="flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 border border-slate-200/80 shadow-xs mr-0.5"
              aria-label="Toggle navigation menu"
              title="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
          )}

          {/* ── Horizontal Navigation Tabs ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
            {visibleItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`
                    flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold
                    transition-all duration-200 shrink-0 cursor-pointer select-none whitespace-nowrap
                    ${
                      active
                        ? 'bg-amber-500/10 text-amber-900 border border-amber-400/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={`transition-colors shrink-0 ${
                      active ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{isHindi ? item.nameHi : item.name}</span>

                  {item.badge !== undefined && (
                    <span
                      className={`
                        px-1.5 py-0.2 rounded-full text-[10px] font-black
                        ${
                          active
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
