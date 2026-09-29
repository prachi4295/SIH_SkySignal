/* ═══════════════════════════════════════════════════════
   SkySignal — Duplicate Review Page
   NLP Spatiotemporal Fusion Engine Showcase
   Cluster Header with Syntactic Similarity Index,
   3-Column Evidence Comparison (Citizen vs. Twitter/X vs. News RSS),
   and "Confirm & Merge Cluster" Action preserving provenance.
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Copy,
  GitMerge,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  Split,
  X,
  FileText,
  MessageCircle,
  Smartphone,
  Eye,
  Check,
  Undo2,
} from 'lucide-react';
import { getDuplicateClusters } from '../services/mockApi';
import { CATEGORY_CONFIG } from '../data/mock';
import type { DuplicateCluster, Report } from '../types/weather';
import { translateCategory } from '../lib/hindiTranslations';

interface MergedClusterRecord {
  clusterId: string;
  locationName: string;
  mergedAt: string;
  canonicalEventId: string;
  contributingReportIds: string[];
}

export default function DuplicateReview() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [clusters, setClusters] = useState<DuplicateCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [mergedRecords, setMergedRecords] = useState<Map<string, MergedClusterRecord>>(new Map());
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'merged'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getDuplicateClusters();
      setClusters(data);
      setLoading(false);
    }
    load();
  }, []);

  // Merge handler
  const handleMergeCluster = (cluster: DuplicateCluster) => {
    const canonicalId = `EVT-${cluster.id.replace('DUP-', 'CANON-')}`;
    const reportIds = cluster.reports.map((r) => r.id);

    setMergedRecords((prev) => {
      const next = new Map(prev);
      next.set(cluster.id, {
        clusterId: cluster.id,
        locationName: cluster.location_name,
        mergedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        canonicalEventId: canonicalId,
        contributingReportIds: reportIds,
      });
      return next;
    });

    setToastMessage(
      `Cluster ${cluster.id} in ${cluster.location_name} fused into Canonical Event #${canonicalId}. All ${reportIds.length} source provenances preserved.`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Undo merge
  const handleUndoMerge = (clusterId: string) => {
    setMergedRecords((prev) => {
      const next = new Map(prev);
      next.delete(clusterId);
      return next;
    });
    setToastMessage(`Unmerged cluster ${clusterId}. Reports restored to triage queue.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keep separate
  const handleKeepSeparate = (clusterId: string, locationName: string) => {
    setToastMessage(`Cluster ${clusterId} in ${locationName} marked as distinct co-occurring events.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Categorize 3 columns for each cluster
  const getEvidenceColumns = (reports: Report[]) => {
    const citizen = reports.find((r) => r.source_platform === 'citizen_app') || reports[0];
    const social = reports.find((r) => r.source_platform === 'twitter' || r.source_platform === 'youtube') || reports[1] || reports[0];
    const news = reports.find((r) => r.source_platform === 'news' || r.source_platform === 'imd_official') || reports[2] || reports[1] || reports[0];

    return { citizen, social, news };
  };

  const pendingCount = clusters.filter((c) => !mergedRecords.has(c.id)).length;
  const mergedCount = mergedRecords.size;

  const displayClusters = clusters.filter((c) => {
    const isMerged = mergedRecords.has(c.id);
    if (activeFilter === 'pending') return !isMerged;
    if (activeFilter === 'merged') return isMerged;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <Copy size={22} className="text-sky-600" />
          <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
            {isHindi ? 'डुप्लिकेट समीक्षा' : 'Duplicate Review'}
          </h1>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Engine Showcase & Summary Metric Bar ── */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {isHindi ? 'लंबित फ़्यूज़न समीक्षा' : 'Pending Fusion Review'}
            </span>
            <div className="text-[24px] font-black text-slate-900">
              {pendingCount} {isHindi ? 'क्लस्टर' : 'Clusters'}
            </div>
          </div>

          <div className="h-9 w-px bg-slate-200 hidden sm:block" />

          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {isHindi ? 'मानक घटना में विलयित' : 'Fused into Canonical Events'}
            </span>
            <div className="text-[24px] font-black text-emerald-600">
              {mergedCount} {isHindi ? 'विलयित' : 'Merged'}
            </div>
          </div>

          <div className="h-9 w-px bg-slate-200 hidden sm:block" />

          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {isHindi ? 'समानता सीमा' : 'Similarity Threshold'}
            </span>
            <div className="text-[24px] font-black text-purple-600">
              &gt; 0.85 {isHindi ? 'कोसाइन' : 'Cosine'}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-[11px] font-bold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isHindi ? `सभी क्लस्टर (${clusters.length})` : `All Clusters (${clusters.length})`}
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isHindi ? `लंबित (${pendingCount})` : `Pending (${pendingCount})`}
          </button>
          <button
            onClick={() => setActiveFilter('merged')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'merged'
                ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            {isHindi ? `विलयित (${mergedCount})` : `Merged (${mergedCount})`}
          </button>
        </div>
      </div>

      {/* ── Clusters List ── */}
      {loading ? (
        <div className="glass-card py-20 text-center text-slate-400">
          {isHindi ? 'एनएलपी डुप्लिकेट क्लस्टर लोड हो रहे हैं...' : 'Loading NLP spatiotemporal duplicate clusters...'}
        </div>
      ) : displayClusters.length === 0 ? (
        <div className="glass-card py-16 text-center text-slate-400 rounded-2xl border border-slate-200">
          {isHindi ? 'इस दृश्य में कोई डुप्लिकेट क्लस्टर नहीं मिला।' : 'No duplicate clusters found in this view.'}
        </div>
      ) : (
        <div className="space-y-6">
          {displayClusters.map((cluster) => {
            const isMerged = mergedRecords.has(cluster.id);
            const mergeRecord = mergedRecords.get(cluster.id);
            const similarityPct = Math.round(cluster.similarity_score * 100);
            const { citizen, social, news } = getEvidenceColumns(cluster.reports);

            // Determine dominant category
            const dominantCategory = citizen?.event_category || 'rainfall';
            const catConfig = CATEGORY_CONFIG[dominantCategory];

            return (
              <div
                key={cluster.id}
                className={`glass-card rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm ${
                  isMerged
                    ? 'border-emerald-300/80 bg-emerald-50/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* ── Cluster Header ── */}
                <div className="p-5 border-b border-slate-100/90 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-[11px] font-black text-sky-700 px-2.5 py-0.5 bg-sky-100 rounded-lg">
                        {cluster.id}
                      </span>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-[15px] font-black text-slate-900">
                        <MapPin size={16} className="text-sky-600" />
                        <span>{cluster.location_name}</span>
                      </div>

                      {/* Category Pill */}
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize flex items-center gap-1"
                        style={{ backgroundColor: catConfig?.bgColor, color: catConfig?.color }}
                      >
                        <span>{catConfig?.icon}</span>
                        <span>{translateCategory(dominantCategory, isHindi)}</span>
                      </span>

                      {/* Merged Status Badge */}
                      {isMerged && (
                        <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                          <Check size={13} />
                          <span>{isHindi ? `विलयित #${mergeRecord?.canonicalEventId}` : `Fused into #${mergeRecord?.canonicalEventId}`}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] text-slate-500">
                      {isHindi
                        ? '1.8 किमी के दायरे में 12 मिनट के भीतर 3 स्वतंत्र चैनलों द्वारा परस्पर पुष्टीकृत।'
                        : 'Cross-corroborated by 3 independent channels within 12 minutes across a 1.8km radius.'}
                    </p>
                  </div>

                  {/* Similarity Index Metric & Spatiotemporal Window */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-[12px]">
                        <Layers size={17} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {isHindi ? 'सिंटैक्टिक समानता' : 'Syntactic Similarity'}
                        </div>
                        <div className="text-[14px] font-black text-purple-700">
                          {similarityPct}% {isHindi ? 'टेक्स्ट मिलान' : 'Text Match'}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hidden sm:flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-black text-[12px]">
                        <Clock size={17} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {isHindi ? 'समय अंतराल' : 'Time Delta'}
                        </div>
                        <div className="text-[14px] font-black text-sky-700">
                          &lt; 8 {isHindi ? 'मिनट' : 'mins'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── 3-Column Evidence Comparison ── */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ── Column 1: Citizen Report ── */}
                  <div className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-sky-700 font-bold text-[12px]">
                          <Smartphone size={16} />
                          <span>1. {isHindi ? 'जमीनी नागरिक टेलीमेट्री' : 'Ground Citizen Telemetry'}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                          {citizen?.id || 'RPT-001'}
                        </span>
                      </div>

                      {/* Photo / Media Preview */}
                      {citizen?.media_urls && citizen.media_urls.length > 0 && (
                        <div
                          onClick={() => setPreviewMedia(citizen.media_urls[0])}
                          className="relative group/photo h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer"
                        >
                          <img
                            src={citizen.media_urls[0]}
                            alt="Citizen ground truth"
                            className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-bold gap-1">
                            <Eye size={15} />
                            <span>{isHindi ? 'फोटो देखें' : 'Inspect Photo'}</span>
                          </div>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold">
                            {isHindi ? 'जियोटैग फोटो' : 'Geotagged Photo'}
                          </span>
                        </div>
                      )}

                      {/* Witness Statement */}
                      <blockquote className="text-[12px] text-slate-800 italic leading-relaxed bg-sky-50/40 p-3 rounded-xl border border-sky-100">
                        "{citizen?.raw_text || 'Water level has risen to knee height on main road near station.'}"
                      </blockquote>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isHindi ? 'डिवाइस आईडी:' : 'Device ID:'}</span>
                        <span className="font-mono font-bold text-slate-700">{citizen?.source_handle || 'dev-abc123'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isHindi ? 'विश्वसनीयता सूचकांक:' : 'Reliability Index:'}</span>
                        <span className="font-bold text-emerald-600">{isHindi ? '96% जमीनी सत्य' : '96% Ground Truth'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Column 2: X / Twitter ── */}
                  <div className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-[12px]">
                          <MessageCircle size={16} />
                          <span>2. {isHindi ? 'स्थानीय सोशल स्ट्रीम' : 'Vernacular Social Stream'}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                          {social?.id || 'RPT-002'}
                        </span>
                      </div>

                      {/* Photo / Media Preview if available */}
                      {social?.media_urls && social.media_urls.length > 0 && (
                        <div
                          onClick={() => setPreviewMedia(social.media_urls[0])}
                          className="relative group/photo h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer"
                        >
                          <img
                            src={social.media_urls[0]}
                            alt="Social upload"
                            className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-bold gap-1">
                            <Eye size={15} />
                            <span>{isHindi ? 'पोस्ट मीडिया देखें' : 'Inspect Post Media'}</span>
                          </div>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold">
                            {isHindi ? 'सोशल मीडिया अपलोड' : 'Social Media Upload'}
                          </span>
                        </div>
                      )}

                      {/* Vernacular Post Quote with Hashtags */}
                      <blockquote className="text-[12px] text-slate-800 leading-relaxed bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                        "{social?.raw_text || 'Massive waterlogging near Dadar TT. Roads completely submerged. Stay home everyone! #MumbaiRains #Flooding'}"
                      </blockquote>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isHindi ? 'अकाउंट हैंडल:' : 'Account Handle:'}</span>
                        <span className="font-bold text-sky-600">{social?.source_handle || '@MumbaiRains'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isHindi ? 'भ्रामक संभावना:' : 'P(Misleading):'}</span>
                        <span className="font-mono font-bold text-slate-700">
                          {((social?.p_misleading || 0.08) * 100).toFixed(0)}% {isHindi ? '(कम जोखिम)' : '(Low Risk)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Column 3: Regional News RSS / Institutional ── */}
                  <div className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-[12px]">
                          <FileText size={16} />
                          <span>3. {isHindi ? 'संरचित समाचार आरएसएस / एजेंसी' : 'Structured News RSS / Agency'}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                          {news?.id || 'RPT-003'}
                        </span>
                      </div>

                      {/* Structured News Bulletin Extract */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-2 min-h-[144px] flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>{isHindi ? 'आधिकारिक प्रसारण विज्ञप्ति' : 'Official Broadcast Release'}</span>
                        </div>
                        <p className="text-[12px] text-slate-800 leading-relaxed font-medium">
                          "{news?.raw_text || 'IMD issues red alert for Mumbai as heavy rainfall continues. BMC deploys NDRF teams in low-lying areas of Dadar and Sion.'}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isHindi ? 'प्रकाशक:' : 'Publisher:'}</span>
                        <span className="font-bold text-slate-700">{news?.source_handle || 'NDTV Mumbai Bureau'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isHindi ? 'एजेंसी प्रामाणिकता:' : 'Agency Authority:'}</span>
                        <span className="font-bold text-emerald-600">{isHindi ? '99% प्रमाणित' : '99% Validated'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Action Bar: "Confirm & Merge Cluster" ── */}
                <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Layers size={14} className="text-purple-600" />
                    <span>
                      {isHindi
                        ? 'सिग्नलों को मिलाने से प्रत्येक स्रोत आईडी को अनुक्रमित करते हुए एक मानक घटना में विलय हो जाता है।'
                        : 'Collapsing signals merges text vectors into a single canonical event while indexing each source ID.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    {isMerged ? (
                      <button
                        onClick={() => handleUndoMerge(cluster.id)}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[12px] font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Undo2 size={15} />
                        <span>{isHindi ? 'फ़्यूज़न पूर्ववत करें' : 'Undo Fusion'}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleKeepSeparate(cluster.id, cluster.location_name)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Split size={14} />
                          <span>{isHindi ? 'अलग रखें' : 'Keep Separate'}</span>
                        </button>

                        <button
                          onClick={() => handleMergeCluster(cluster)}
                          className="px-4.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <GitMerge size={16} />
                          <span>{isHindi ? 'क्लस्टर की पुष्टि और विलय करें' : 'Confirm & Merge Cluster'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Media Lightbox Modal (Portal to body at z-[110]) ── */}
      {previewMedia &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setPreviewMedia(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
                <span className="text-[13px] font-bold text-white flex items-center gap-2">
                  <Eye size={15} className="text-purple-400" />
                  {isHindi ? 'क्लस्टर अवलोकन मीडिया लाइटबॉक्स' : 'Cluster Observation Media Lightbox'}
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
                  alt="High-resolution attachment inspection"
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
                />
              </div>

              <div className="p-4 bg-slate-900 text-center text-slate-400 text-[12px] border-t border-slate-800">
                {isHindi
                  ? 'स्थानिक-कालिक क्लस्टर में पुष्टीकृत घटना फोटो साक्ष्य।'
                  : 'Corroborated incident photo evidence fused in spatiotemporal cluster.'}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
