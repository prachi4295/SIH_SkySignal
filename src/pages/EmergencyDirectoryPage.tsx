/* ═══════════════════════════════════════════════════════
   SkySignal — Emergency Helplines & Disaster Authorities Directory
   Click-to-dial direct contact directory for NDRF, SDMAs, and emergency services
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import { PhoneCall, ShieldAlert, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HelplineItem {
  id: string;
  name: string;
  category: 'National' | 'State' | 'Medical' | 'Maritime' | 'Disaster';
  number: string;
  secondaryNumber?: string;
  description: string;
  availability: string;
  state?: string;
}

const EMERGENCY_HELPLINES: HelplineItem[] = [
  {
    id: 'HL-01',
    name: 'National Emergency Response (All Emergencies)',
    category: 'National',
    number: '112',
    description: 'Unified single emergency number for Police, Fire, and Ambulance across all States and UTs.',
    availability: '24/7 Toll-Free',
  },
  {
    id: 'HL-02',
    name: 'National Disaster Management Authority (NDMA)',
    category: 'Disaster',
    number: '1078',
    secondaryNumber: '011-26701728',
    description: 'Apex national disaster control room for cyclone, flood, earthquake, and major hazard escalations.',
    availability: '24/7 Operations Room',
  },
  {
    id: 'HL-03',
    name: 'National Disaster Response Force (NDRF HQ)',
    category: 'Disaster',
    number: '011-24363260',
    secondaryNumber: '9711077372',
    description: 'Specialized search & rescue battalions dispatch for severe flood, cyclone, and collapse operations.',
    availability: '24/7 Emergency Dispatch',
  },
  {
    id: 'HL-04',
    name: 'Emergency Medical & Ambulance Network',
    category: 'Medical',
    number: '108',
    secondaryNumber: '102 (Pregnancy / Infant)',
    description: 'Immediate trauma, oxygen support, paramedic dispatch, and disaster patient transit.',
    availability: '24/7 Toll-Free',
  },
  {
    id: 'HL-05',
    name: 'Indian Coast Guard SAR (Maritime & Coastal)',
    category: 'Maritime',
    number: '1554',
    secondaryNumber: '011-23384934',
    description: 'Search, rescue and storm evacuation for fishermen, coastal vessels, and island communities.',
    availability: '24/7 Toll-Free Maritime Ops',
  },
  {
    id: 'HL-06',
    name: 'Fire & Rescue Service',
    category: 'National',
    number: '101',
    description: 'Urban flood pumping, building collapse extraction, electrical fire and hazmat containment.',
    availability: '24/7 Immediate Dispatch',
  },
  {
    id: 'HL-07',
    name: 'Gujarat State Disaster Management Authority (GSDMA)',
    category: 'State',
    number: '1070',
    secondaryNumber: '079-23259283',
    description: 'State Emergency Operations Centre (SEOC) for Gujarat coastal storm and flood monitoring.',
    availability: '24/7 SEOC Gandhinagar',
    state: 'Gujarat',
  },
  {
    id: 'HL-08',
    name: 'Maharashtra State Disaster Control Room',
    category: 'State',
    number: '1070',
    secondaryNumber: '022-22027990',
    description: 'Mantralaya State Disaster Ops Centre for Mumbai surge, Konkan rainfall, and river basin floods.',
    availability: '24/7 SEOC Mumbai',
    state: 'Maharashtra',
  },
  {
    id: 'HL-09',
    name: 'Rajasthan Disaster Management & Relief Dept',
    category: 'State',
    number: '1070',
    secondaryNumber: '0141-2227084',
    description: 'Heatwave crisis management, drought water supply, and flash flood emergency control.',
    availability: '24/7 SEOC Jaipur',
    state: 'Rajasthan',
  },
  {
    id: 'HL-10',
    name: 'Tamil Nadu State Disaster Management Authority (TNSDMA)',
    category: 'State',
    number: '1070',
    secondaryNumber: '044-28593990',
    description: 'Chennai coastal storm surge, Northeast monsoon flood mitigation, and cyclone emergency hub.',
    availability: '24/7 SEOC Chennai',
    state: 'Tamil Nadu',
  },
];

export default function EmergencyDirectoryPage() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredHelplines = EMERGENCY_HELPLINES.filter((item) => {
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.includes(searchQuery) ||
      (item.state && item.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto animate-fade-in">
      {/* ── Hero Capsule ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-[#24211f] to-[#1a1816] text-white p-6 sm:p-8 border border-rose-900/60 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[11.5px] font-black uppercase tracking-wider">
            <ShieldAlert size={14} className="animate-pulse" />
            <span>{isHindi ? '24/7 राष्ट्रीय आपातकालीन हेल्पलाइन निर्देशिका' : '24/7 National Disaster & Emergency Helplines'}</span>
          </div>

          <h1 className="text-[24px] sm:text-[30px] font-black tracking-tight text-white leading-tight">
            {isHindi
              ? 'आपातकालीन सहायता और आपदा प्रबंधन नियंत्रण कक्ष'
              : 'Direct Emergency Contacts & Disaster Operations Centers'}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-stone-300 leading-relaxed font-medium max-w-2xl">
            {isHindi
              ? 'राष्ट्रीय आपदा प्रतिक्रिया बल (NDRF), राज्य आपदा प्रबंधन प्राधिकरण (SDMA), तटरक्षक बल और एम्बुलेंस सेवाओं के लिए तत्काल संपर्क नंबर।'
              : 'One-touch emergency calling directory connecting citizens to NDRF battalions, State Disaster Operations Centers, Coast Guard rescue, and ambulance grids.'}
          </p>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'All', labelEn: 'All Helplines', labelHi: 'सभी हेल्पलाइन' },
            { id: 'National', labelEn: 'National', labelHi: 'राष्ट्रीय' },
            { id: 'Disaster', labelEn: 'Disaster', labelHi: 'आपदा प्रबंधन' },
            { id: 'Medical', labelEn: 'Medical', labelHi: 'चिकित्सा / एम्बुलेंस' },
            { id: 'Maritime', labelEn: 'Maritime', labelHi: 'तटीय / समुद्री' },
            { id: 'State', labelEn: 'State', labelHi: 'राज्य नियंत्रण' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isHindi ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHindi ? 'हेल्पलाइन या राज्य खोजें...' : 'Search hotline or state...'}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-[12.5px] bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* ── Helpline Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHelplines.map((item) => (
          <div
            key={item.id}
            className="glass-card p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  {isHindi
                    ? item.category === 'National'
                      ? 'राष्ट्रीय'
                      : item.category === 'Disaster'
                      ? 'आपदा'
                      : item.category === 'Medical'
                      ? 'चिकित्सा'
                      : item.category === 'Maritime'
                      ? 'तटरक्षक'
                      : 'राज्य'
                    : item.category}{' '}
                  {item.state ? `· ${item.state}` : ''}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isHindi ? '२४/७ टोल-फ्री उपलब्ध' : item.availability}
                </span>
              </div>

              <h3 className="text-[15px] font-black text-slate-900 leading-snug">{item.name}</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-mono text-[18px] font-black text-rose-700">{item.number}</div>
                {item.secondaryNumber && (
                  <div className="font-mono text-[11px] text-slate-500 font-semibold">
                    {isHindi ? 'वैकल्पिक:' : 'Alt:'} {item.secondaryNumber}
                  </div>
                )}
              </div>

              <a
                href={`tel:${item.number}`}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[12.5px] flex items-center gap-1.5 shadow-sm shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
              >
                <PhoneCall size={14} />
                <span>{isHindi ? 'हेल्पलाइन डायल करें' : 'Call Helpline'}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
