/* ═══════════════════════════════════════════════════════
   SkySignal — Event Intelligence Detail Sheet
   Slide-over drawer opening smoothly from the right edge.
   - Citizen View: AI Fusion Confidence, Brief Description, Photos & Videos only
   - Analyst / Admin View: Full meteorological telemetry (Doppler dBZ, Stage Meter, Admin Actions)
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  ShieldCheck,
  MapPin,
  Radio,
  AlertTriangle,
  CheckCircle2,
  GitMerge,
  Ban,
  TrendingUp,
  Sparkles,
  Eye,
  Send,
  Share2,
  Copy,
  Check,
  MessageSquare,
  ThumbsUp,
  UserCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from '../../data/mock';
import { translateEventTitle, LIFECYCLE_HI } from '../../lib/hindiTranslations';
import type { WeatherCategory, Severity, LifecycleStatus, WeatherEvent, EventComment } from '../../types/weather';
import {
  getSynthesizedIncidentDescription,
  getEventComments,
  addEventComment,
  deleteEventComment,
  toggleCommentUpvote,
} from '../../services/incidentIntelligence';

interface EventDetailSheetProps {
  event: WeatherEvent | any | null;
  onClose: () => void;
  onStatusChange?: (eventId: string, newStatus: LifecycleStatus) => void;
}

const LIFECYCLE_STAGES: LifecycleStatus[] = [
  'detected',
  'emerging',
  'confirmed',
  'active',
  'declining',
  'resolved',
];

type EvidenceTab = 'media' | 'sensors' | 'citizen';

export default function EventDetailSheet({
  event,
  onClose,
  onStatusChange,
}: EventDetailSheetProps) {
  const { isAdmin, user } = useAuth();
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [activeTab, setActiveTab] = useState<EvidenceTab>('media');
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<LifecycleStatus>(
    event?.lifecycle_status || event?.status || 'active'
  );
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [comments, setComments] = useState<EventComment[]>(() =>
    getEventComments(event?.id || 'EVT-GENERIC')
  );
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState(user?.name || '');
  const [commentRole, setCommentRole] = useState('Local Resident');
  const [commentTag, setCommentTag] = useState('Ground Observation');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);

  useEffect(() => {
    if (!event) return;
    setComments(getEventComments(event.id || 'EVT-GENERIC'));

    const handleSyncPayload = (payload: any) => {
      if (!payload) return;
      if (payload.type === 'comment_deleted') {
        setComments((prev) => prev.filter((c) => c.id !== payload.commentId));
      } else if (payload.type === 'comment_added' && payload.eventId === (event.id || 'EVT-GENERIC')) {
        setComments((prev) => {
          if (prev.some((c) => c.id === payload.comment.id)) return prev;
          return [payload.comment, ...prev];
        });
      } else if (payload.type === 'comment_upvoted') {
        setComments(getEventComments(event.id || 'EVT-GENERIC'));
      }
    };

    // 1. Current window custom event listener
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      handleSyncPayload(customEvent.detail);
    };
    window.addEventListener('skysignal:comment-sync', handleCustomEvent);

    // 2. Cross-tab and cross-portal BroadcastChannel listener
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('skysignal_comments_sync_channel');
        channel.onmessage = (msgEvent) => {
          handleSyncPayload(msgEvent.data);
        };
      } catch {}
    }

    // 3. Storage event fallback across browser sessions
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes('skysignal_comments') || e.key?.includes('skysignal_deleted')) {
        setComments(getEventComments(event.id || 'EVT-GENERIC'));
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('skysignal:comment-sync', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
      channel?.close();
    };
  }, [event?.id]);

  if (!event) return null;

  const catMeta = CATEGORY_CONFIG[event.category as WeatherCategory] || {
    icon: '🌧️',
    color: '#0284c7',
    bgColor: '#e0f2fe',
  };

  const sevMeta = SEVERITY_CONFIG[event.severity as Severity] || {
    label: 'Moderate',
    icon: '▲',
    className: 'badge-severity-moderate',
  };

  const city = event.city ?? event.location?.name ?? 'National Capital';
  const state = event.state ?? event.location?.state ?? 'India';
  const confidence = event.confidence ?? 88;
  const sourceCount = event.independent_source_count ?? event.sources ?? 3;
  const hasContradiction = event.has_contradiction ?? false;
  const bayesianPrior = (Math.max(0.85, Math.min(0.99, confidence / 100 + 0.022))).toFixed(3);

  const currentStageIndex = LIFECYCLE_STAGES.indexOf(currentStatus);

  const categoryImages: Record<string, string[]> = {
    rainfall: ['/images/rain/1.jpg', '/images/rain/2.jpg', '/images/rain/3.jpg', '/images/rain/4.jpg'],
    flooding: ['/images/flooding/1.jpg', '/images/flooding/2.jpg', '/images/flooding/3.jpg', '/images/flooding/4.jpg'],
    thunderstorm: ['/images/thunderstorm/1.jpg', '/images/thunderstorm/2.jpg'],
    fog: ['/images/fog/1.jpg', '/images/fog/2.jpg', '/images/fog/3.jpg', '/images/fog/4.jpg'],
    'dust storm': ['/images/duststorms/1.jpg', '/images/duststorms/2.jpg', '/images/duststorms/3.jpg', '/images/duststorms/4.jpg', '/images/duststorms/5.jpg'],
    'strong wind': ['/images/strong_wind/1.jpg', '/images/rain/3.jpg'],
    heatwave: ['/images/duststorms/2.jpg', '/images/duststorms/4.jpg'],
  };

  const catKey = (event.category || 'rainfall').toLowerCase();
  const fallbackList = categoryImages[catKey] || categoryImages.rainfall;

  const mediaList =
    event.media_urls && event.media_urls.length > 0
      ? event.media_urls
      : event.media_url
      ? [event.media_url]
      : fallbackList;

  const labels = [
    'Field Sensor / Geotag',
    'Citizen Upload #1',
    'Station Telemetry Cam',
    'Citizen Upload #2',
    'Aerial / Drone View',
  ];

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  const synthesizedDesc = getSynthesizedIncidentDescription(event);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newCmt = addEventComment(event.id || 'EVT-GENERIC', {
      userName: commentName.trim() || user?.name || 'Local Citizen',
      userRole: commentRole,
      tag: commentTag,
      text: commentText.trim(),
    });

    setComments((prev) => [newCmt, ...prev]);
    setCommentText('');
    setShowCommentForm(false);
    triggerToast('Your ground update was posted to live community discussion!');
  };

  const handleToggleUpvote = (commentId: string) => {
    const isNowUpvoted = toggleCommentUpvote(commentId);
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            hasUpvoted: isNowUpvoted,
            upvotes: isNowUpvoted ? c.upvotes + 1 : Math.max(0, c.upvotes - 1),
          };
        }
        return c;
      })
    );
  };

  const handleDeleteComment = (commentId: string) => {
    const ok = deleteEventComment(commentId, event.id || 'EVT-GENERIC');
    if (ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      triggerToast('Comment removed by analyst moderation.');
    }
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/#weather-status`;
    }
    return 'https://skysignal.gov.in';
  };

  const getShareText = () => {
    const sevLabel = (event.severity || 'moderate').toUpperCase();
    const catLabel = (event.category || 'Weather Incident').toUpperCase();

    return `⚠️ *SkySignal Live Weather Alert*
📍 *Location:* ${city}, ${state}
🌧️ *Hazard:* ${catLabel} [${sevLabel} SEVERITY]
⚡ *AI Confidence:* ${confidence}% (${sourceCount} corroborating data streams)

📝 *Multi-Source Fused Ground Report:*
${synthesizedDesc}

🛰️ *Track Live Doppler Radar & Telemetry:*
${getShareUrl()}`;
  };

  const handleShareWhatsApp = () => {
    const text = getShareText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerToast('Opening WhatsApp to share live alert...');
  };

  const handleShareTelegram = () => {
    const text = getShareText();
    const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerToast('Opening Telegram to broadcast alert...');
  };

  const handleShareTwitter = () => {
    const tweetText = `⚠️ SkySignal Weather Alert: ${event.title} in ${city}, ${state} (${(event.severity || 'moderate').toUpperCase()})\n⚡ AI Confidence: ${confidence}%\n\nTrack live Doppler radar:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(getShareUrl())}&hashtags=SkySignal,WeatherAlert,${city.replace(/[^a-zA-Z0-9]/g, '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    triggerToast('Opening X (Twitter) to publish alert...');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `SkySignal Weather Alert: ${event.title}`,
          text: getShareText(),
          url: getShareUrl(),
        });
        triggerToast('Weather alert shared successfully!');
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const text = getShareText();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      triggerToast('Alert summary & live radar link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Admin Action Handlers
  const handlePromoteLifecycle = () => {
    const nextIndex = Math.min(LIFECYCLE_STAGES.length - 1, currentStageIndex + 1);
    const nextStage = LIFECYCLE_STAGES[nextIndex];
    setCurrentStatus(nextStage);
    onStatusChange?.(event.id, nextStage);
    triggerToast(`Event ${event.id} lifecycle advanced to "${nextStage.toUpperCase()}".`);
  };

  const handleMergeEvent = () => {
    triggerToast(`Event ${event.id} marked for canonical fusion review in /duplicates.`);
  };

  const handleInvalidateEvent = () => {
    setCurrentStatus('resolved');
    onStatusChange?.(event.id, 'resolved');
    triggerToast(`Event ${event.id} invalidated and marked as Resolved / False Alarm.`);
  };

  const handleFlyToIncidentLocation = () => {
    const targetLat = event.lat ?? (event as any)?.location?.lat ?? 20.5937;
    const targetLng = event.lon ?? (event as any)?.lng ?? (event as any)?.location?.lng ?? 78.9629;
    window.dispatchEvent(
      new CustomEvent('skysignal:recenter-map', {
        detail: {
          lat: targetLat,
          lng: targetLng,
          zoom: 15,
          name: event.title,
          eventId: event.id,
        },
      })
    );
    const weatherStatusElem = document.getElementById('weather-status');
    if (weatherStatusElem) {
      weatherStatusElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onClose();
  };

  const sheetContent = (
    <>
      {/* Backdrop — screen-covering dimming background */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-[100] w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Event details for ${event.title}`}
      >
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xs shrink-0"
              style={{ backgroundColor: catMeta?.bgColor, color: catMeta?.color }}
            >
              {catMeta?.icon === 'CloudRain' ? '🌧️' : catMeta?.icon === 'Waves' ? '🌊' : catMeta?.icon === 'Thermometer' ? '🌡️' : '⚡'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <span className="font-mono text-[10px] font-black tracking-wide text-sky-700 bg-sky-100/90 px-2 py-0.5 rounded-md">
                    {event.id}
                  </span>
                )}
                <span className="text-[11px] text-slate-500 font-semibold">
                  {isHindi ? 'अपडेट किया गया' : 'Updated'}{' '}
                  {new Date(event.last_updated_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                  IST
                </span>
              </div>
              <h2 className="text-[16px] font-black text-slate-900 tracking-tight mt-0.5 line-clamp-1">
                {isHindi ? translateEventTitle(event.title) : event.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleNativeShare}
              className="p-1.5 rounded-full text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
              title="Share weather alert"
              aria-label="Share alert"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Action Notification Toast ── */}
        {actionToast && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-bold flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{actionToast}</span>
            </div>
            <button onClick={() => setActionToast(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-[13px]">
          {/* Location & Status Pill Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <button
              onClick={handleFlyToIncidentLocation}
              className="flex items-center gap-2 hover:bg-sky-50 px-2 py-1 rounded-xl transition-all cursor-pointer group text-left"
              title={isHindi ? 'मानचित्र पर देखें' : 'View on GeoRadar Map'}
            >
              <MapPin size={16} className="text-sky-600 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-slate-900 group-hover:text-sky-700">
                {city}, {state}
              </span>
              <span className="text-[10px] font-bold text-sky-600 underline ml-1 hidden sm:inline">
                {isHindi ? 'मानचित्र पर दिखाएँ' : 'Show on Map'}
              </span>
            </button>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase flex items-center gap-1 ${
                event.severity === 'severe'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : event.severity === 'moderate'
                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span>{sevMeta?.icon}</span>
              <span>
                {isHindi
                  ? event.severity === 'severe'
                    ? 'गंभीर'
                    : event.severity === 'moderate'
                    ? 'मध्यम'
                    : 'सामान्य'
                  : event.severity}
              </span>
            </span>
          </div>

          {/* ── AI FUSION CONFIDENCE CARD (Matches exact design) ── */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-emerald-50/40 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <ShieldCheck size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  {isHindi ? 'एआई संलयन विश्वसनीयता' : 'AI Fusion Confidence'}
                </span>
                <div className="text-[28px] font-black text-slate-900 leading-none mt-0.5">
                  {confidence}%
                </div>
                {isAdmin && (
                  <span className="text-[11.5px] text-emerald-700 font-bold mt-1 inline-block">
                    {isHindi
                      ? `${sourceCount} स्वतंत्र डेटा स्रोतों द्वारा सत्यापित`
                      : `Corroborated by ${sourceCount} independent source streams`}
                  </span>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">Bayesian Prior</span>
                <span className="font-mono font-black text-[13px] text-slate-700">{bayesianPrior}</span>
              </div>
            )}
          </div>

          {/* ── INCIDENT OVERVIEW ── */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              {isHindi ? 'घटना अवलोकन' : 'Incident Overview'}
            </span>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 shadow-2xs">
              {/* Source breakdown badges */}
              <div className="flex items-center gap-2 flex-wrap text-[10.5px] font-bold">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                  <span>📱</span>
                  <span>
                    {event.evidence_summary?.citizen_reports || 23}+ {isHindi ? 'नागरिक रिपोर्टें' : 'Citizen Reports'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>🛰️</span>
                  <span>{isHindi ? 'आईएमडी डॉप्लर एवं एडब्ल्यूएस' : 'IMD Doppler & AWS Radar'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  <span>📸</span>
                  <span>
                    {event.evidence_summary?.social_posts || 45}+ {isHindi ? 'सोशल मीडिया अपडेट्स' : 'Insta/X Reels'}
                  </span>
                </span>
              </div>

              {/* Simple, clear ground description */}
              <p className="text-[13.5px] text-slate-800 leading-relaxed font-medium">
                {synthesizedDesc}
              </p>
            </div>
          </div>

          {/* ── BROADCAST & SHARE WEATHER ALERT (WhatsApp, Telegram, X, Copy) ── */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 border-2 border-sky-100 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Share2 size={13} />
                </div>
                <span className="text-[11.5px] font-black text-slate-800 uppercase tracking-wider">
                  {isHindi ? 'चेतावनी साझा एवं प्रसारित करें' : 'Share & Broadcast Alert'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSharePreview(!showSharePreview)}
                className="text-[11px] text-sky-600 hover:text-sky-800 font-bold underline decoration-dotted cursor-pointer"
              >
                {showSharePreview
                  ? isHindi
                    ? 'पूर्वावलोकन छिपाएं'
                    : 'Hide Message Preview'
                  : isHindi
                  ? 'संदेश पूर्वावलोकन देखें'
                  : 'Preview Message'}
              </button>
            </div>

            {/* Social Sharing 1-Click Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* WhatsApp Button */}
              <button
                onClick={handleShareWhatsApp}
                type="button"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-[12px] shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
                title="Share instantly on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp</span>
              </button>

              {/* Telegram Button */}
              <button
                onClick={handleShareTelegram}
                type="button"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1e8bc0] text-white font-black text-[12px] shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
                title="Broadcast alert on Telegram"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/>
                </svg>
                <span>Telegram</span>
              </button>

              {/* X / Twitter Button */}
              <button
                onClick={handleShareTwitter}
                type="button"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0f1419] hover:bg-black text-white font-black text-[12px] shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
                title="Post alert on X (formerly Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X</span>
              </button>

              {/* Copy Full Alert Link & Text */}
              <button
                onClick={handleCopyLink}
                type="button"
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-[12px] border transition-all cursor-pointer active:scale-95 shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-sky-50 text-sky-700 border-sky-300'
                }`}
                title="Copy complete alert summary & radar link to clipboard"
              >
                {copied ? <Check size={14} className="shrink-0" /> : <Copy size={14} className="shrink-0" />}
                <span>{copied ? (isHindi ? 'कॉपी हो गया!' : 'Copied!') : (isHindi ? 'अलर्ट कॉपी करें' : 'Copy Alert')}</span>
              </button>
            </div>

            {/* Expandable Formatted Message Preview */}
            {showSharePreview && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 animate-fade-in">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                  {isHindi ? 'प्रसारण संदेश प्रारूप:' : 'Formatted Broadcast Payload:'}
                </span>
                <pre className="text-[11.5px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {getShareText()}
                </pre>
              </div>
            )}
          </div>

          {/* ── CITIZEN VIEW: PHOTOS & VIDEOS EVIDENCE ONLY ── */}
          {!isAdmin && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[12px] font-black text-slate-800 uppercase tracking-wider">
                  {isHindi ? 'फोटो एवं मीडिया साक्ष्य' : 'Photos & Media Evidence'}
                </span>
                <span className="text-[11px] text-sky-600 font-bold">
                  {mediaList.length} {isHindi ? 'सत्यापित तस्वीरें' : 'Verified Photos'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {mediaList.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewMedia(url)}
                    className="relative group h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs hover:border-sky-400 transition-all"
                  >
                    <img
                      src={url}
                      alt={`${event.title} - Evidence #${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = fallbackList[0] || '/images/rain/1.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold gap-1.5 transition-opacity">
                      <Eye size={15} />
                      <span>{isHindi ? `निरीक्षण करें (${idx + 1}/${mediaList.length})` : `Inspect (${idx + 1}/${mediaList.length})`}</span>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9.5px] font-semibold tracking-wide">
                      {labels[idx % labels.length]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANALYST / ADMIN VIEW ONLY: METEOROLOGICAL TELEMETRY & TABS ── */}
          {isAdmin && (
            <div className="space-y-4 pt-1">
              {/* Status & Severity Badges + Lifecycle Stage Meter */}
              <div className="glass-card p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {isHindi ? 'जीवनचक्र चरण:' : 'Lifecycle Stage:'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase bg-slate-900 text-white">
                      {isHindi ? (LIFECYCLE_HI[currentStatus] || currentStatus) : currentStatus}
                    </span>
                  </div>
                  <span className="text-sky-600 font-mono text-[10px] font-bold">
                    {isHindi ? `चरण ${currentStageIndex + 1} / ६` : `Stage ${currentStageIndex + 1} of 6`}
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {LIFECYCLE_STAGES.map((stg, idx) => {
                    const isPastOrCurrent = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stg} className="space-y-1">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCurrent
                              ? 'bg-sky-600 ring-2 ring-sky-300'
                              : isPastOrCurrent
                              ? 'bg-sky-400'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[9px] block text-center truncate font-bold uppercase ${
                            isCurrent ? 'text-sky-700 font-black' : isPastOrCurrent ? 'text-slate-600' : 'text-slate-300'
                          }`}
                          title={stg}
                        >
                          {isHindi ? (LIFECYCLE_HI[stg] || stg) : stg.slice(0, 4)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contradiction Banner (if sensor disagrees with reports) */}
              {hasContradiction && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80 text-amber-900 space-y-1.5 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2 font-black text-[12px] text-amber-800">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <span>{isHindi ? 'सेंसर एवं नागरिक रिपोर्ट विरोधाभास चेतावनी' : 'Sensor & Crowd Contradiction Warning'}</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-relaxed font-medium">
                    {isHindi
                      ? 'स्वचालित मौसम सेंसर और नागरिक रिपोर्ट में भिन्नता है: नागरिकों ने भारी जलभराव दर्ज किया है जबकि स्टेशन सेंसर मध्यम वर्षा माप रहा है। सार्वजनिक चेतावनी पूर्व विश्लेषक सत्यापन आवश्यक है।'
                      : 'Official automated sensor network diverges from incoming crowd reports: Citizen telemetry reports localized inundation (>2 ft), while local Doppler automated rain gauge reads moderate accumulation. Analyst verification required before public escalation.'}
                  </p>
                </div>
              )}

              {/* Evidence Summary Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-center gap-4 text-[12px] font-bold">
                    <button
                      onClick={() => setActiveTab('media')}
                      className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
                        activeTab === 'media'
                          ? 'border-sky-600 text-sky-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isHindi ? 'फोटो एवं मीडिया' : 'Photos & Media'}
                    </button>
                    <button
                      onClick={() => setActiveTab('sensors')}
                      className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
                        activeTab === 'sensors'
                          ? 'border-sky-600 text-sky-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isHindi ? 'डॉप्लर एवं एडब्ल्यूएस सेंसर' : 'Doppler & AWS Sensors'}
                    </button>
                    <button
                      onClick={() => setActiveTab('citizen')}
                      className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
                        activeTab === 'citizen'
                          ? 'border-sky-600 text-sky-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isHindi ? 'नागरिक रिपोर्टें' : 'Citizen Reports'}
                    </button>
                  </div>
                </div>

                {/* Tab 1: Photos & Media */}
                {activeTab === 'media' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-2.5">
                      {mediaList.map((url: string, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewMedia(url)}
                          className="relative group h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs hover:border-sky-400 transition-all"
                        >
                          <img
                            src={url}
                            alt={`${event.title} - Evidence #${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = fallbackList[0] || '/images/rain/1.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold gap-1.5 transition-opacity">
                            <Eye size={15} />
                            <span>Inspect ({idx + 1}/{mediaList.length})</span>
                          </div>
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold tracking-wide">
                            {labels[idx % labels.length]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                      <Sparkles size={13} className="text-sky-600" />
                      Click any thumbnail to inspect high-resolution ground truth evidence in lightbox.
                    </p>
                  </div>
                )}

                {/* Tab 2: Doppler & AWS Sensors */}
                {activeTab === 'sensors' && (
                  <div className="space-y-3 animate-fade-in text-[12px]">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <Radio size={14} className="text-emerald-600" />
                          Doppler Radar Reflectivity
                        </span>
                        <span className="font-mono text-emerald-700 font-black">52.4 dBZ</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Santacruz Doppler Station (DWR-MUM-01) · Beam elevation 0.5°
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Rain Gauge Rate
                        </span>
                        <div className="font-mono text-[14px] font-black text-slate-900 mt-0.5">
                          68.2 mm/hr
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Peak Wind Gust
                        </span>
                        <div className="font-mono text-[14px] font-black text-slate-900 mt-0.5">
                          54 km/h
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Citizen Reports */}
                {activeTab === 'citizen' && (
                  <div className="space-y-2.5 animate-fade-in text-[12px]">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-slate-400">dev-abc123</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                          Verified
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium italic text-[11px]">
                        "Water level has risen to knee height on main road near Dadar station. Vehicles stranded."
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-slate-400">dev-lmn456</span>
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold uppercase">
                          Corroborated
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium italic text-[11px]">
                        "Heavy rain in Andheri East. Metro station underpass waterlogged. Trains running 15 min late."
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── LIVE COMMUNITY DISCUSSION & CITIZEN GROUND COMMENTS ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-sky-600" />
                <span className="text-[12.5px] font-black text-slate-900 uppercase tracking-wider">
                  {isHindi ? 'नागरिक चर्चा एवं टिप्पणियां' : 'Live Citizen Discussion & Comments'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-black">
                  {comments.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11.5px] font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>{showCommentForm ? (isHindi ? 'रद्द करें' : 'Cancel') : (isHindi ? 'जमीनी स्थिति साझा करें' : 'Post Ground Update')}</span>
              </button>
            </div>

            {/* New Comment Submission Form */}
            {showCommentForm && (
              <form
                onSubmit={handlePostComment}
                className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-200 space-y-3 animate-fade-in shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-black text-slate-800">
                    {isHindi ? 'लाइव जमीनी अवलोकन साझा करें' : 'Share Live Ground Observation'}
                  </span>
                  <span className="text-[10.5px] text-slate-500 font-semibold">
                    {isHindi ? 'सभी नागरिकों एवं राहत दलों को दिखाई देगा' : 'Visible to all citizens & responders'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder={isHindi ? 'आपका नाम / हैंडल' : 'Your Name / Handle'}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                  />

                  <select
                    value={commentRole}
                    onChange={(e) => setCommentRole(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Local Resident">{isHindi ? 'स्थानीय निवासी' : 'Local Resident'}</option>
                    <option value="Local Commuter">{isHindi ? 'दैनिक यात्री / चालक' : 'Local Commuter / Driver'}</option>
                    <option value="Emergency Volunteer">{isHindi ? 'आपातकालीन स्वयंसेवक' : 'Emergency Volunteer'}</option>
                    <option value="Field Observer">{isHindi ? 'क्षेत्रीय पर्यवेक्षक' : 'Field Observer'}</option>
                    <option value="Meteorology Student">{isHindi ? 'मौसम विज्ञान छात्र / पर्यवेक्षक' : 'Student / Spotter'}</option>
                  </select>

                  <select
                    value={commentTag}
                    onChange={(e) => setCommentTag(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Waterlogged">{isHindi ? '🌊 जलभराव' : '🌊 Waterlogged'}</option>
                    <option value="Traffic Halted">{isHindi ? '🚦 यातायात अवरुद्ध' : '🚦 Traffic Halted / Slow'}</option>
                    <option value="Tree / Pole Fallen">{isHindi ? '⚠️ पेड़ / खंभा गिरा' : '⚠️ Obstruction / Fallen Tree'}</option>
                    <option value="Power Outage">{isHindi ? '⚡ बिजली गुल' : '⚡ Power / Feeder Outage'}</option>
                    <option value="Water Receding">{isHindi ? '✅ पानी उतर रहा है' : '✅ Water Receding / Clear'}</option>
                    <option value="Ground Observation">{isHindi ? '📍 सामान्य अवलोकन' : '📍 General Ground Update'}</option>
                  </select>
                </div>

                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isHindi
                      ? `${city} में वर्तमान जमीनी स्थिति (पानी का स्तर, सड़क की स्थिति, बारिश) का विवरण दें...`
                      : `Describe current situation on ground in ${city} (e.g. water depth, road status, rain intensity)...`
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                  required
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {isHindi ? `जियोटैग: ${city}, ${state}` : `Geotagged to ${city}, ${state}`}
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[12px] font-extrabold shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>{isHindi ? 'अपडेट प्रकाशित करें' : 'Publish Update'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-2.5">
              {comments.map((cmt) => (
                <div
                  key={cmt.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-sky-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center font-bold text-[11px]">
                        {cmt.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[12.5px] text-slate-900">
                            {cmt.userName}
                          </span>
                          {cmt.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                              <UserCheck size={11} className="text-sky-600" />
                              {isHindi ? 'सत्यापित' : 'Verified'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {cmt.userRole || (isHindi ? 'नागरिक' : 'Citizen')} · {cmt.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {cmt.tag && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                          {cmt.tag}
                        </span>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(cmt.id)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                          title="Delete comment (Analyst Moderation)"
                        >
                          <Trash2 size={12} className="text-rose-500" />
                          <span>{isHindi ? 'हटाएं' : 'Delete'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[12.5px] text-slate-800 leading-relaxed font-medium pl-9">
                    {cmt.text}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 pl-9 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleUpvote(cmt.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        cmt.hasUpvoted
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ThumbsUp size={12} className={cmt.hasUpvoted ? 'fill-current' : ''} />
                      <span>{isHindi ? `मददगार (${cmt.upvotes})` : `Helpful (${cmt.upvotes})`}</span>
                    </button>

                    <span className="text-[10.5px] text-slate-400 font-mono">
                      {isHindi ? 'जमीनी सत्यापित' : 'Ground Corroborated'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer Actions Section ── */}
        <div className="p-5 border-t border-slate-200 bg-slate-50/90 space-y-3">
          {isAdmin ? (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-2 font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-sky-600" />
                  {isHindi
                    ? `प्रमाणित विश्लेषक कार्यवाहियां (${user?.name || 'कर्तव्य अधिकारी'})`
                    : `Authenticated Analyst Actions (${user?.name || 'Duty Forecaster'})`}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isHindi ? 'भूमिका: व्यवस्थापक' : `Role: ${user?.role || 'Admin'}`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handlePromoteLifecycle}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Advance event lifecycle stage"
                >
                  <TrendingUp size={13} />
                  <span>{isHindi ? 'आगे बढ़ाएं' : 'Promote'}</span>
                </button>

                <button
                  onClick={handleMergeEvent}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Merge into duplicate cluster"
                >
                  <GitMerge size={13} />
                  <span>{isHindi ? 'विलय करें' : 'Merge'}</span>
                </button>

                <button
                  onClick={handleInvalidateEvent}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Invalidate as false positive"
                >
                  <Ban size={13} />
                  <span>{isHindi ? 'अमान्य करें' : 'Invalidate'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <a
                href="#report"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[12.5px] font-black shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={14} />
                <span>{isHindi ? 'इस क्षेत्र के लिए नागरिक रिपोर्ट सबमिट करें' : 'Submit Citizen Report for this Area'}</span>
              </a>

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[12.5px] transition-colors cursor-pointer"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Media Lightbox Modal (Above drawer at z-[110]) ── */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
              <span className="text-[13px] font-bold text-white flex items-center gap-2">
                <Sparkles size={15} className="text-sky-400" />
                {isHindi ? 'घटना जमीनी साक्ष्य लाइटबॉक्स' : 'Event Ground Observation Lightbox'}
              </span>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/50">
              <img
                src={previewMedia}
                alt={isHindi ? 'विस्तृत जमीनी साक्ष्य' : 'Enlarged observation'}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(sheetContent, document.body)
    : sheetContent;
}
