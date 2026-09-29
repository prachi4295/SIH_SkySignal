/* ═══════════════════════════════════════════════════════
   SkySignal — Crisis Aid & Disaster Relief Network
   Multi-stakeholder coordination hub for NGOs, Govt, and Citizens
   Financial aid drives, emergency food supply, citizen SOS requests, and relief camp locator.
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import {
  HeartHandshake,
  Heart,
  Utensils,
  Home,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  Search,
  Droplets,
  X,
  QrCode,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserLocation } from '../context/LocationContext';

interface ReliefDrive {
  id: string;
  title: string;
  organization: string;
  orgType: 'Govt' | 'NGO' | 'Community';
  hazardCategory: string;
  location: string;
  targetAmount?: number;
  raisedAmount?: number;
  foodPacketsGoal?: number;
  foodPacketsDistributed?: number;
  activeBeneficiaries: number;
  urgentNeeds: string[];
  status: 'Active' | 'Urgent' | 'Completed';
  verified: boolean;
  contact: string;
}

interface ReliefCamp {
  id: string;
  name: string;
  district: string;
  state: string;
  capacity: number;
  occupancy: number;
  facilities: string[];
  doctorOnSite: boolean;
  helpline: string;
  managedBy: string;
}

const MOCK_RELIEF_DRIVES: ReliefDrive[] = [
  {
    id: 'DRV-2026-001',
    title: 'Surat Coastal Flooding & Slum Ration Supply',
    organization: 'Gujarat State Disaster Relief & Red Cross',
    orgType: 'Govt',
    hazardCategory: 'Flooding',
    location: 'Surat, Gujarat',
    targetAmount: 2500000,
    raisedAmount: 1845000,
    foodPacketsGoal: 10000,
    foodPacketsDistributed: 7420,
    activeBeneficiaries: 12500,
    urgentNeeds: ['Dry Rations', 'Baby Food', 'Chlorine Tablets', 'Tarpaulins'],
    status: 'Urgent',
    verified: true,
    contact: '0261-2423300',
  },
  {
    id: 'DRV-2026-002',
    title: 'Mumbai High-Tide Low-Lying Evacuee Support',
    organization: 'Goonj Relief Mission & BMC Disaster Cell',
    orgType: 'NGO',
    hazardCategory: 'Heavy Rain / Surge',
    location: 'Kurla & Sion, Mumbai',
    targetAmount: 1800000,
    raisedAmount: 1420000,
    foodPacketsGoal: 8500,
    foodPacketsDistributed: 6200,
    activeBeneficiaries: 9800,
    urgentNeeds: ['Cooked Meals', 'Dry Clothing', 'ORS Kits', 'Mosquito Nets'],
    status: 'Active',
    verified: true,
    contact: '022-22694725',
  },
  {
    id: 'DRV-2026-003',
    title: 'Jaipur & Thar Severe Heatwave Water Tanker Network',
    organization: 'Rajasthan Seva Sangathan',
    orgType: 'Community',
    hazardCategory: 'Heatwave',
    location: 'Jaipur & Barmer, Rajasthan',
    targetAmount: 850000,
    raisedAmount: 690000,
    foodPacketsGoal: 4000,
    foodPacketsDistributed: 3100,
    activeBeneficiaries: 6200,
    urgentNeeds: ['Clean Water Tankers', 'Electrolyte Packs', 'Cooling Tents'],
    status: 'Active',
    verified: true,
    contact: '0141-2227200',
  },
  {
    id: 'DRV-2026-004',
    title: 'Brahmaputra Basin Flash Flood Emergency Nutrition',
    organization: 'Akshaya Patra Disaster Response',
    orgType: 'NGO',
    hazardCategory: 'Flash Flood',
    location: 'Guwahati & Kaziranga, Assam',
    targetAmount: 3200000,
    raisedAmount: 2980000,
    foodPacketsGoal: 15000,
    foodPacketsDistributed: 13800,
    activeBeneficiaries: 19400,
    urgentNeeds: ['Emergency Food Packets', 'Water Purification Kits', 'First Aid'],
    status: 'Urgent',
    verified: true,
    contact: '1800-425-8622',
  },
];

const MOCK_RELIEF_CAMPS: ReliefCamp[] = [
  {
    id: 'CMP-GUJ-01',
    name: 'Sardar Patel Municipal Evacuation Centre',
    district: 'Surat',
    state: 'Gujarat',
    capacity: 1200,
    occupancy: 840,
    facilities: ['Community Kitchen', '24/7 Power Backup', 'Purified Water', 'Child Care Space'],
    doctorOnSite: true,
    helpline: '1077 (District Collectorate)',
    managedBy: 'Surat Municipal Corporation & SDRF',
  },
  {
    id: 'CMP-MAH-02',
    name: 'Dharavi Sports Complex Disaster Transit Shelter',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    capacity: 2500,
    occupancy: 1890,
    facilities: ['Hot Meals (3x daily)', 'Medical Triage Unit', 'Restrooms', 'Sanitation Kits'],
    doctorOnSite: true,
    helpline: '1916 (BMC Disaster Ops)',
    managedBy: 'BMC & Indian Red Cross Society',
  },
  {
    id: 'CMP-RAJ-03',
    name: 'Maharana Pratap Community Hydration Shelter',
    district: 'Jaipur',
    state: 'Rajasthan',
    capacity: 800,
    occupancy: 310,
    facilities: ['Misting Coolers', 'ORS Dispenser', 'Emergency Rest Beds', 'Ice Packs'],
    doctorOnSite: true,
    helpline: '0141-2385100',
    managedBy: 'District Administration Jaipur',
  },
  {
    id: 'CMP-ASM-04',
    name: 'Brahmaputra High School Flood Relief Camp',
    district: 'Kamrup Metro',
    state: 'Assam',
    capacity: 1500,
    occupancy: 1240,
    facilities: ['Boat Rescue Point', 'Dry Ration Storage', 'Solar Charging', 'Medic Station'],
    doctorOnSite: true,
    helpline: '1070 (State Emergency Ops)',
    managedBy: 'Assam SDMA & NDRF 1st Bn',
  },
];

export default function ReliefNetwork() {
  const { i18n } = useTranslation();
  const { location: userLoc } = useUserLocation();
  const isHindi = i18n.language === 'hi';

  const [activeTab, setActiveTab] = useState<'financial' | 'food' | 'request-aid' | 'shelters' | 'volunteer'>('financial');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Donation Modal State
  const [selectedDonationDrive, setSelectedDonationDrive] = useState<ReliefDrive | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorPan, setDonorPan] = useState<string>('');
  const [donationSuccess, setDonationSuccess] = useState<boolean>(false);

  // SOS Aid Request State
  const [sosFormData, setSosFormData] = useState({
    name: '',
    phone: '',
    city: userLoc.cityName || '',
    landmark: '',
    hazard: 'Flooding',
    peopleCount: 2,
    needs: ['Food & Clean Water', 'Medical Attention'],
    notes: '',
  });
  const [sosSubmittedId, setSosSubmittedId] = useState<string | null>(null);

  // Filter relief drives
  const filteredDrives = MOCK_RELIEF_DRIVES.filter((drive) => {
    const matchSearch =
      drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDonationSuccess(true);
  };

  const handleSosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `SOS-${Date.now().toString().slice(-6)}`;
    setSosSubmittedId(newId);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-[1500px] mx-auto">
      {/* ── Page Header & Hero Capsule ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d2a27] via-[#24211f] to-[#1a1816] text-white p-6 sm:p-8 border border-[#443e39]/80 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[11.5px] font-black uppercase tracking-wider">
            <HeartHandshake size={14} className="animate-pulse" />
            <span>{isHindi ? 'राष्ट्रीय आपदा सहायता और राहत नेटवर्क' : 'National Crisis Aid & Disaster Relief Network'}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight text-white leading-tight">
                {isHindi
                  ? 'आपदा राहत: एनजीओ, सरकार और नागरिकों का एकीकृत सहायता मंच'
                  : 'Providing Aid in Severe Events — Connect NGOs, Government & Citizens'}
              </h1>
              <p className="text-[13px] sm:text-[14px] text-stone-300 leading-relaxed font-medium">
                {isHindi
                  ? 'गंभीर मौसम आपदाओं में प्रत्यक्ष वित्तीय सहायता, आपातकालीन भोजन और राहत सामग्री पहुंचाएं, अथवा संकट में तुरंत सहायता का अनुरोध करें।'
                  : 'Direct financial contributions, emergency ration logistics, shelter mapping, and instant SOS distress requests for disaster-affected communities.'}
              </p>
            </div>

            {/* Quick Emergency Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={() => setActiveTab('request-aid')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-black shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
              >
                <AlertTriangle size={15} />
                <span>{isHindi ? 'आपातकालीन सहायता मांगें (SOS)' : 'Request Urgent Aid (SOS)'}</span>
              </button>

              <button
                onClick={() => setActiveTab('financial')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[13px] font-black shadow-lg shadow-amber-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Heart size={15} />
                <span>{isHindi ? 'राहत कोष में दान करें' : 'Donate to Relief Fund'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#443e39]/70 text-stone-300">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                {isHindi ? 'सक्रिय राहत अभियान' : 'Active Relief Drives'}
              </span>
              <span className="text-[20px] font-black text-white">
                {isHindi ? '४२ सत्यापित' : '42 Verified'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                {isHindi ? 'सक्रिय राहत शिविर' : 'Relief Camps Active'}
              </span>
              <span className="text-[20px] font-black text-emerald-300">
                {isHindi ? '६८ केंद्र' : '68 Centers'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center justify-start gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'financial'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Heart size={16} />
          <span>{isHindi ? 'वित्तीय सहायता और फंड' : 'Financial Aid & Funds'}</span>
        </button>

        <button
          onClick={() => setActiveTab('food')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'food'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils size={16} />
          <span>{isHindi ? 'भोजन, राशन और स्वच्छ जल' : 'Food, Ration & Clean Water'}</span>
        </button>

        <button
          onClick={() => setActiveTab('request-aid')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'request-aid'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <AlertTriangle size={16} />
          <span>{isHindi ? 'आपातकालीन सहायता मांगें (SOS)' : 'Request Aid / SOS Distress'}</span>
        </button>

        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shelters'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Home size={16} />
          <span>{isHindi ? 'राहत शिविर और आश्रय' : 'Relief Camps & Shelters'}</span>
        </button>

        <button
          onClick={() => setActiveTab('volunteer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'volunteer'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users size={16} />
          <span>{isHindi ? 'एनजीओ और स्वयंसेवक पंजीकरण' : 'NGO & Volunteer Hub'}</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: FINANCIAL AID & RELIEF FUNDS
         ════════════════════════════════════════════════════════════ */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2">
                <Heart className="text-rose-600" size={20} />
                <span>{isHindi ? 'सत्यापित गंभीर आपदा राहत अभियान' : 'Verified Severe Disaster Relief Drives'}</span>
              </h2>
              <p className="text-[12.5px] text-slate-500">
                {isHindi
                  ? 'तत्काल 80G आयकर छूट रसीद के साथ 100% प्रत्यक्ष आपदा राहत निधि।'
                  : '100% direct pass-through disaster relief fundings with instant 80G tax exemption receipts.'}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? 'शहर या आपदा अनुसार खोजें...' : 'Search drive by city or disaster...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-[12.5px] bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDrives.map((drive) => {
              const progressPct = drive.targetAmount
                ? Math.min(100, Math.round(((drive.raisedAmount || 0) / drive.targetAmount) * 100))
                : 75;

              return (
                <div
                  key={drive.id}
                  className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle size={12} />
                        <span>{drive.hazardCategory}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {drive.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            <ShieldCheck size={12} />
                            <span>{isHindi ? 'सरकार / एनजीओ सत्यापित' : 'Govt / NGO Verified'}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {drive.id}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[16px] font-black text-slate-900 leading-snug">
                        {drive.title}
                      </h3>
                      <p className="text-[12px] text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                        <Building2 size={13} className="text-amber-600" />
                        <span>{drive.organization}</span>
                        <span>•</span>
                        <MapPin size={13} className="text-slate-400" />
                        <span>{drive.location}</span>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-extrabold">
                        <span className="text-slate-600">
                          {isHindi ? 'एकत्रित:' : 'Raised:'}{' '}
                          <strong className="text-slate-900">₹{(drive.raisedAmount || 0).toLocaleString()}</strong>
                        </span>
                        <span className="text-amber-600">
                          {progressPct}% {isHindi ? 'प्राप्त' : 'Funded'}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {isHindi ? 'लक्ष्य:' : 'Goal:'} ₹{(drive.targetAmount || 0).toLocaleString()}
                        </span>
                        <span>
                          {drive.activeBeneficiaries.toLocaleString()}{' '}
                          {isHindi ? 'नागरिक लाभान्वित' : 'Citizens Impacted'}
                        </span>
                      </div>
                    </div>

                    {/* Urgent Needs Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10.5px] font-bold text-slate-400">
                        {isHindi ? 'अति आवश्यक सामग्री:' : 'Immediate Supplies:'}
                      </span>
                      {drive.urgentNeeds.map((need) => (
                        <span
                          key={need}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-bold border border-slate-200"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Donate CTA button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {isHindi ? 'सीधी हेल्पलाइन:' : 'Direct Helpline:'}{' '}
                      <strong className="text-slate-800">{drive.contact}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDonationDrive(drive);
                        setDonationSuccess(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-[12.5px] font-extrabold shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <Heart size={14} />
                      <span>{isHindi ? 'राहत कोष में दान करें' : 'Donate Relief Funds'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 2: FOOD, RATION & CLEAN WATER LOGISTICS
         ════════════════════════════════════════════════════════════ */}
      {activeTab === 'food' && (
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-3xl border border-amber-200 bg-amber-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-black text-[15px]">
                <Utensils size={18} className="text-amber-700" />
                <span>
                  {isHindi
                    ? 'आपदा राशन आपूर्ति और सामुदायिक रसोई वितरण'
                    : 'Disaster Ration Supply & Community Kitchen Dispatch'}
                </span>
              </div>
              <p className="text-[12px] text-amber-800 font-medium">
                {isHindi
                  ? 'तैयार भोजन, पोषण बिस्कुट, शिशु आहार और स्वच्छ पेयजल टैंकरों का व्यापक समन्वय।'
                  : 'Coordination for ready-to-eat meals, high-calorie survival biscuits, baby nutrition, and bulk clean drinking water tankers.'}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('volunteer')}
              className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black text-[12.5px] shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isHindi ? '+ भोजन / आपूर्ति साझेदार के रूप में जुड़ें' : '+ Register as Food / Supply Partner'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_RELIEF_DRIVES.map((item) => (
              <div key={item.id} className="glass-card p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">
                    🍲 {isHindi ? 'भोजन एवं राशन केंद्र' : 'Meal & Ration Hub'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">{item.location}</span>
                </div>

                <div>
                  <h3 className="text-[15px] font-black text-slate-900">{item.title}</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">{item.organization}</p>
                </div>

                {/* Ration counters */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {isHindi ? 'वितरित पैकेट' : 'Packets Distributed'}
                    </span>
                    <span className="text-[18px] font-black text-amber-700">
                      {(item.foodPacketsDistributed || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {isHindi ? 'लक्ष्य संख्या' : 'Target Goal'}
                    </span>
                    <span className="text-[18px] font-black text-slate-800">
                      {(item.foodPacketsGoal || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11.5px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Droplets size={14} className="text-sky-600 shrink-0" />
                    <span>
                      {isHindi ? 'स्वच्छ पेयजल:' : 'Clean Drinking Water:'}{' '}
                      <strong>{isHindi ? 'क्लोरीन उपचारित टैंकर सक्रिय' : 'Chlorine Treated Tankers Live'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-600 shrink-0" />
                    <span>
                      {isHindi ? 'वितरण समय:' : 'Serving Hours:'}{' '}
                      <strong>{isHindi ? 'प्रतिदिन सुबह 06:00 – रात्रि 10:00' : '06:00 AM – 10:00 PM Daily'}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {isHindi ? 'रसोई / आपूर्ति प्रभारी' : 'Drop-off / Kitchen Incharge'}
                  </span>
                  <span className="font-mono text-[12px] font-black text-slate-900">{item.contact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: REQUEST EMERGENCY AID (CITIZEN SOS DISTRESS FORM)
         ════════════════════════════════════════════════════════════ */}
      {activeTab === 'request-aid' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
            <div className="flex items-center gap-2 font-black text-[16px]">
              <AlertTriangle className="text-rose-600" size={20} />
              <span>{isHindi ? 'नागरिक आपातकालीन संकट अनुरोध (SOS)' : 'Citizen Emergency Relief Request (SOS)'}</span>
            </div>
            <p className="text-[12.5px] text-rose-800/90 font-medium">
              {isHindi
                ? 'यदि आप या आपका समुदाय फंसे हुए हैं और आपातकालीन भोजन, स्वच्छ पानी, या तत्काल चिकित्सा सहायता की आवश्यकता है, तो यह फॉर्म भरें। आपका अनुरोध तुरंत स्थानीय जिला प्रशासन, एनडीआरएफ और राहत दलों को भेजा जाएगा।'
                : 'If you or your community are stranded, in need of emergency food, clean water, or urgent medical supplies during a severe weather incident, submit this form. Your request is prioritized to local district administration, NDRF, and responding NGO units.'}
            </p>
          </div>

          {sosSubmittedId ? (
            <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-300">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-[20px] font-black text-emerald-900">
                  {isHindi ? 'राहत अनुरोध सफलतापूर्वक दर्ज हुआ' : 'Relief Request Logged Successfully'}
                </h3>
                <p className="text-[13px] text-emerald-800 mt-1">
                  {isHindi
                    ? 'आपका संकट टिकट स्थानीय आपातकालीन समन्वयकों और राहत दलों को प्रेषित कर दिया गया है।'
                    : 'Your SOS distress ticket has been dispatched to local emergency coordinators and responding relief teams.'}
                </p>
              </div>
              <div className="inline-block p-3 rounded-2xl bg-white border border-emerald-200 font-mono text-[14px] font-black text-emerald-900">
                {isHindi ? 'टिकट क्रमांक' : 'Ticket ID'}: {sosSubmittedId}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSosSubmittedId(null);
                    setSosFormData({
                      name: '',
                      phone: '',
                      city: userLoc.cityName || '',
                      landmark: '',
                      hazard: 'Flooding',
                      peopleCount: 2,
                      needs: ['Food & Clean Water'],
                      notes: '',
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[13px] transition-all cursor-pointer"
                >
                  {isHindi ? 'अन्य अनुरोध दर्ज करें' : 'Submit Another Request'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSosSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-700 uppercase tracking-wider block">
                    {isHindi ? 'आपका नाम / संपर्क व्यक्ति *' : 'Your Name / Contact Person *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={sosFormData.name}
                    onChange={(e) => setSosFormData({ ...sosFormData, name: e.target.value })}
                    placeholder={isHindi ? 'उदा. रमेश पटेल' : 'e.g. Ramesh Patel'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-700 uppercase tracking-wider block">
                    {isHindi ? 'सीधा मोबाइल नंबर *' : 'Direct Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={sosFormData.phone}
                    onChange={(e) => setSosFormData({ ...sosFormData, phone: e.target.value })}
                    placeholder={isHindi ? 'उदा. +91 98765 43210' : 'e.g. +91 98765 43210'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-700 uppercase tracking-wider block">
                    {isHindi ? 'स्थान / शहर *' : 'Location / City *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={sosFormData.city}
                    onChange={(e) => setSosFormData({ ...sosFormData, city: e.target.value })}
                    placeholder={isHindi ? 'उदा. सूरत, गुजरात' : 'e.g. Surat, Gujarat'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-700 uppercase tracking-wider block">
                    {isHindi ? 'प्रभावित व्यक्तियों की संख्या' : 'Number of Affected Persons'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sosFormData.peopleCount}
                    onChange={(e) => setSosFormData({ ...sosFormData, peopleCount: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-slate-700 uppercase tracking-wider block">
                  {isHindi ? 'सटीक पता / लैंडमार्क *' : 'Precise Landmark / Street Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={sosFormData.landmark}
                  onChange={(e) => setSosFormData({ ...sosFormData, landmark: e.target.value })}
                  placeholder={isHindi ? 'उदा. पुराने पुल के पास, भवन 4, दूसरी मंजिल' : 'e.g. Near Old River Bridge, Building 4, 2nd floor'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black text-slate-700 uppercase tracking-wider block">
                  {isHindi ? 'अति आवश्यक आवश्यकताएं (लागू सभी चुनें)' : 'Urgent Needs (Select all that apply)'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { en: 'Emergency Food / Ration', hi: 'आपातकालीन भोजन / राशन' },
                    { en: 'Clean Drinking Water', hi: 'स्वच्छ पेयजल' },
                    { en: 'Medical / First Aid', hi: 'चिकित्सा / प्राथमिक उपचार' },
                    { en: 'Infant Formula / Milk', hi: 'शिशु आहार / दूध' },
                    { en: 'Boat Rescue / Evacuation', hi: 'नाव बचाव / सुरक्षित निकासी' },
                    { en: 'Elderly Assistance', hi: 'वरिष्ठ नागरिक सहायता' },
                  ].map((item) => {
                    const isSelected = sosFormData.needs.includes(item.en);
                    return (
                      <button
                        type="button"
                        key={item.en}
                        onClick={() => {
                          if (isSelected) {
                            setSosFormData({ ...sosFormData, needs: sosFormData.needs.filter((n) => n !== item.en) });
                          } else {
                            setSosFormData({ ...sosFormData, needs: [...sosFormData.needs, item.en] });
                          }
                        }}
                        className={`p-2 rounded-xl text-[12px] font-bold text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 text-rose-900 border-rose-300 ring-1 ring-rose-300 font-black'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {isHindi ? item.hi : item.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-slate-700 uppercase tracking-wider block">
                  {isHindi ? 'अतिरिक्त विवरण / स्थिति' : 'Additional Situation Details'}
                </label>
                <textarea
                  rows={3}
                  value={sosFormData.notes}
                  onChange={(e) => setSosFormData({ ...sosFormData, notes: e.target.value })}
                  placeholder={
                    isHindi
                      ? 'बाढ़ का जलस्तर, फंसे हुए लोग, आपातकालीन स्थिति बताएं...'
                      : 'Describe flood water depth, trapped individuals, medical emergencies...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-[14px] shadow-md shadow-rose-600/30 transition-all cursor-pointer active:scale-98"
              >
                🚨 {isHindi ? 'आपातकालीन संकट (SOS) सहायता अनुरोध भेजें' : 'Submit Emergency SOS Aid Request'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 4: RELIEF CAMPS & SHELTERS
         ════════════════════════════════════════════════════════════ */}
      {activeTab === 'shelters' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2">
              <Home className="text-amber-600" size={20} />
              <span>{isHindi ? 'सक्रिय सरकारी एवं एनजीओ आपदा आश्रय स्थल' : 'Active Government & NGO Disaster Evacuation Centers'}</span>
            </h2>
            <p className="text-[12.5px] text-slate-500">
              {isHindi
                ? 'चिकित्सा कर्मी, भोजन आपूर्ति, स्वच्छता और विद्युत बैकअप से सुसज्जित सत्यापित सुरक्षित शिविर।'
                : 'Verified safe shelters equipped with medical staff, food supply, sanitation, and power backup.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_RELIEF_CAMPS.map((camp) => {
              const occupancyPct = Math.round((camp.occupancy / camp.capacity) * 100);
              const isHigh = occupancyPct > 80;

              return (
                <div key={camp.id} className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {camp.district}, {camp.state}
                      </span>
                      <h3 className="text-[16px] font-black text-slate-900 mt-1 leading-snug">{camp.name}</h3>
                      <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
                        {isHindi ? 'प्रबंधन:' : 'Managed by'} {camp.managedBy}
                      </p>
                    </div>

                    {camp.doctorOnSite && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 shrink-0">
                        <ShieldCheck size={12} />
                        <span>{isHindi ? 'चिकित्सक उपस्थित' : 'Doctor On-Site'}</span>
                      </span>
                    )}
                  </div>

                  {/* Occupancy meter */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600">{isHindi ? 'आश्रय क्षमता:' : 'Shelter Capacity:'}</span>
                      <span className={isHigh ? 'text-rose-600 font-black' : 'text-emerald-700 font-black'}>
                        {camp.occupancy} / {camp.capacity} {isHindi ? 'व्यक्ति' : 'Persons'} ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isHigh ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Facilities list */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {camp.facilities.map((fac) => (
                      <span key={fac} className="px-2 py-0.5 rounded-md bg-white text-slate-700 text-[11px] font-bold border border-slate-200">
                        ✓ {fac}
                      </span>
                    ))}
                  </div>

                  {/* Direct Contact Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11.5px] text-slate-500 font-medium">
                      {isHindi ? 'आपातकालीन नियंत्रण:' : 'Emergency Control:'}
                    </span>
                    <a
                      href={`tel:${camp.helpline}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold flex items-center gap-1.5 transition-all"
                    >
                      <PhoneCall size={13} className="text-amber-400" />
                      <span>{camp.helpline}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 5: VOLUNTEER & NGO HUB
         ════════════════════════════════════════════════════════════ */}
      {activeTab === 'volunteer' && (
        <div className="max-w-2xl mx-auto glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <h2 className="text-[20px] font-black text-slate-900">
              {isHindi ? 'एनजीओ और नागरिक स्वयंसेवक नेटवर्क' : 'NGO & Citizen Volunteer Network'}
            </h2>
            <p className="text-[13px] text-slate-500">
              {isHindi
                ? 'जमीनी रसद, चिकित्सा सहायता, बचाव परिवहन या भोजन पैकेजिंग के लिए आपदा प्रतिक्रिया टीमों से जुड़ें।'
                : 'Join disaster response teams for ground logistics, medical aid, rescue transport, or food packaging.'}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(
                isHindi
                  ? 'आपदा राहत स्वयंसेवक के रूप में पंजीकरण करने के लिए धन्यवाद! स्थानीय समन्वयक जमीनी आवश्यकताओं के अनुसार आपसे संपर्क करेंगे।'
                  : 'Thank you for registering as a disaster relief volunteer! Local coordinators will contact you based on immediate ground requirements.'
              );
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-700 uppercase">
                  {isHindi ? 'पूरा नाम / संस्था का नाम' : 'Full Name / Organization'}
                </label>
                <input
                  required
                  type="text"
                  placeholder={isHindi ? 'उदा. अनन्या शर्मा' : 'e.g. Ananya Sharma'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-700 uppercase">
                  {isHindi ? 'संपर्क मोबाइल नंबर' : 'Contact Mobile Number'}
                </label>
                <input
                  required
                  type="tel"
                  placeholder={isHindi ? '+91 98765 00000' : '+91 98765 00000'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-700 uppercase">
                  {isHindi ? 'मूल स्थान (शहर / जिला)' : 'Base Location (City/District)'}
                </label>
                <input
                  required
                  type="text"
                  placeholder={isHindi ? 'उदा. सूरत / अहमदाबाद' : 'e.g. Surat / Ahmedabad'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-700 uppercase">
                  {isHindi ? 'स्वयंसेवक भूमिका / क्षमता' : 'Volunteer Role Capability'}
                </label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] bg-white">
                  <option>{isHindi ? 'चिकित्सा / प्राथमिक चिकित्सा कर्मी' : 'Medical / First Aid Responder'}</option>
                  <option>{isHindi ? 'भोजन एवं राशन पैकेजिंग' : 'Food & Supply Packaging'}</option>
                  <option>{isHindi ? '४x४ वाहन / नाव बचाव ऑपरेटर' : '4x4 / Boat Rescue Vehicle Operator'}</option>
                  <option>{isHindi ? 'मनोवैज्ञानिक और विस्थापित सहायता' : 'Psychological & Evacuee Support'}</option>
                  <option>{isHindi ? 'सामान्य जमीनी स्वयंसेवक' : 'General Ground Volunteer'}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-black text-[14px] shadow-sm transition-all cursor-pointer"
            >
              ✓ {isHindi ? 'स्वयंसेवक पंजीकरण पूर्ण करें' : 'Complete Volunteer Registration'}
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          DONATION MODAL (Instant Transparent UPI & 80G Receipt)
         ════════════════════════════════════════════════════════════ */}
      {selectedDonationDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="text-rose-600" size={20} />
                <h3 className="text-[17px] font-black text-slate-900">
                  {isHindi ? 'प्रत्यक्ष आपदा राहत योगदान' : 'Direct Disaster Relief Donation'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDonationDrive(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {donationSuccess ? (
              <div className="py-6 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[20px] font-black text-slate-900">
                    {isHindi ? 'आपके योगदान के लिए हार्दिक धन्यवाद!' : 'Thank You for Your Generosity!'}
                  </h4>
                  <p className="text-[13px] text-slate-600">
                    {isHindi ? (
                      <>
                        <strong>{selectedDonationDrive.title}</strong> के लिए आपका{' '}
                        <strong>₹{(customAmount ? parseInt(customAmount) : donationAmount).toLocaleString()}</strong> का सहयोग
                        सफलतापूर्वक प्राप्त हुआ।
                      </>
                    ) : (
                      <>
                        Your contribution of{' '}
                        <strong>₹{(customAmount ? parseInt(customAmount) : donationAmount).toLocaleString()}</strong> to{' '}
                        <strong>{selectedDonationDrive.title}</strong> has been processed successfully.
                      </>
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left text-[12px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isHindi ? 'लेन-देन आईडी:' : 'Transaction ID:'}</span>
                    <span className="font-mono font-bold text-slate-900">TXN-{Date.now().toString().slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isHindi ? '80G आयकर छूट:' : '80G Tax Exemption:'}</span>
                    <span className="font-bold text-emerald-700">
                      {isHindi ? 'पात्र (रसीद ईमेल की गई)' : 'Eligible (Receipt Emailed)'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDonationDrive(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-[13px] cursor-pointer"
                >
                  {isHindi ? 'बंद करें' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleDonateSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
                  {isHindi ? 'लाभार्थी:' : 'Beneficiary:'}{' '}
                  <strong>{selectedDonationDrive.title}</strong> ({selectedDonationDrive.organization})
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-700 uppercase">
                    {isHindi ? 'योगदान राशि चुनें (INR)' : 'Select Contribution Amount (INR)'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setDonationAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-2 rounded-xl text-[13px] font-black border transition-all cursor-pointer ${
                          donationAmount === amt && !customAmount
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={isHindi ? 'या ₹ में अन्य राशि दर्ज करें' : 'Or enter custom amount in ₹'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      {isHindi ? 'दाता का नाम (रसीद हेतु)' : 'Donor Name (For Receipt)'}
                    </label>
                    <input
                      required
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder={isHindi ? 'आपका पूरा नाम' : 'Your Full Name'}
                      className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      {isHindi ? 'पैन नंबर (80G छूट हेतु)' : 'PAN Number (For 80G Tax Exemption)'}
                    </label>
                    <input
                      type="text"
                      value={donorPan}
                      onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px] uppercase"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <QrCode size={16} className="text-slate-800" />
                    <span>{isHindi ? 'तत्काल UPI / QR / नेटबैंकिंग / कार्ड' : 'Instant UPI / QR / NetBanking / Cards'}</span>
                  </div>
                  <span className="text-emerald-700 font-bold">{isHindi ? 'शून्य प्लेटफॉर्म शुल्क' : 'Zero Platform Fee'}</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-black text-[14px] shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                >
                  {isHindi
                    ? `योगदान जारी रखें ₹${(customAmount ? parseInt(customAmount) : donationAmount).toLocaleString()}`
                    : `Proceed with Contribution ₹${(customAmount ? parseInt(customAmount) : donationAmount).toLocaleString()}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
