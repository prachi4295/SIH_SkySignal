/* ═══════════════════════════════════════════════════════
   SkySignal — Privacy Policy & Data Governance Charter
   DPDPA 2023 Compliant citizen data rights, EXIF stripping & location telemetry transparency
   ═══════════════════════════════════════════════════════ */

import { ShieldCheck, Lock, EyeOff, Database, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyPage() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d2a27] via-[#24211f] to-[#1a1816] text-white p-6 sm:p-8 border border-[#443e39]/80 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11.5px] font-black uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>DPDPA 2023 & MoES Data Governance Charter</span>
          </div>

          <h1 className="text-[24px] sm:text-[30px] font-black tracking-tight text-white leading-tight">
            {isHindi
              ? 'स्काईसिग्नल गोपनीयता नीति और डेटा सुरक्षा ढांचा'
              : 'SkySignal Privacy Policy & Meteorological Data Protection'}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-stone-300 leading-relaxed font-medium">
            {isHindi
              ? 'नागरिक सुरक्षा, स्थान गोपनीयता, स्वचालित EXIF मेटाडेटा निष्कासन और पारदर्शी मौसम पूर्वानुमान के प्रति हमारी प्रतिबद्धता।'
              : 'Our commitment to citizen privacy, location obfuscation, automated photo EXIF scrubbing, and strict adherence to India’s Digital Personal Data Protection Act.'}
          </p>
          <div className="text-[11px] text-stone-400 font-semibold pt-1">
            Effective Date: September 2026 · Version: 2.1-DPDP
          </div>
        </div>
      </div>

      {/* ── 4 Core Privacy Pillars ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <EyeOff size={20} />
          </div>
          <h3 className="text-[15px] font-black text-slate-900">
            {isHindi ? 'शून्य निरंतर ट्रैकिंग' : 'Zero Continuous Tracking'}
          </h3>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            {isHindi
              ? 'GPS स्थान केवल निकटवर्ती तूफान अलर्ट और रिपोर्ट दर्ज करने के समय ऑन-डिमांड पूछा जाता है। कोई निरंतर पृष्ठभूमि मूवमेंट ट्रैक नहीं किया जाता।'
              : 'GPS location is queried strictly on-demand for proximity storm alerting and report submission. No persistent background movement logs are recorded.'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <h3 className="text-[15px] font-black text-slate-900">
            {isHindi ? 'स्वचालित EXIF एवं मीडिया निष्कासन' : 'Automated EXIF & Media Scrubbing'}
          </h3>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            {isHindi
              ? 'नागरिकों द्वारा अपलोड की गई प्रत्येक तस्वीर या वीडियो से डिवाइस आईडी, कैमरा सीरियल और सटीक जीपीएस मेटाडेटा स्वचालित रूप से हटा दिया जाता है।'
              : 'Every photo or video evidence uploaded by citizens undergoes server-side metadata stripping, purging device IDs, camera serials, and exact GPS headers.'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Lock size={20} />
          </div>
          <h3 className="text-[15px] font-black text-slate-900">
            {isHindi ? 'एंड-टू-एंड एन्क्रिप्टेड ट्रांसमिशन' : 'End-to-End Encrypted Feeds'}
          </h3>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            {isHindi
              ? 'क्लाइंट ब्राउज़र, काफ्का एज ब्रोकर्स और आईएमडी विश्लेषक टर्मिनलों के बीच सभी टेलीमेट्री संचार TLS 1.3 एवं SHA-256 डिजिटल सील द्वारा सुरक्षित हैं।'
              : 'All telemetry transmissions between client browsers, Kafka edge brokers, and IMD analyst terminals are encrypted via TLS 1.3 with SHA-256 signatures.'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Database size={20} />
          </div>
          <h3 className="text-[15px] font-black text-slate-900">
            {isHindi ? 'भूमिका आधारित गोपनीयता पृथक्करण' : 'Role-Based Forensics Isolation'}
          </h3>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            {isHindi
              ? 'मूल नागरिक संपर्क नंबर और रिपोर्टर पहचान केवल प्रमाणित मौसम विज्ञानियों तक सीमित है और सार्वजनिक रूप से कभी प्रदर्शित नहीं की जाती।'
              : 'Raw citizen contact numbers and reporter handles are restricted exclusively to authenticated IMD operational forecasters and never exposed to the public.'}
          </p>
        </div>
      </div>

      {/* ── Policy Sections ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-slate-800 text-[13px] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-[17px] font-black text-slate-900">
            {isHindi ? '१. एकत्रित की जाने वाली जानकारी एवं उद्देश्य' : '1. Information We Collect & Purpose'}
          </h2>
          <p className="text-slate-600">
            {isHindi
              ? 'स्काईसिग्नल सार्वजनिक आपदा जोखिम न्यूनीकरण (DRR) के अधिदेश के तहत कार्य करता है। प्लेटफ़ॉर्म का उपयोग करते समय, हम एकत्रित करते हैं:'
              : 'SkySignal operates under the mandate of public disaster risk reduction (DRR). When you utilize the platform, we collect:'}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <strong>{isHindi ? 'मौसम संबंधी अवलोकन:' : 'Meteorological Observations:'}</strong>{' '}
              {isHindi
                ? 'अवलोकित आपदा प्रकार (वर्षा तीव्रता, हवा के झोंके, जलभराव, ओलावृष्टि, लू सूचकांक)।'
                : 'Observed hazard types (rainfall intensity, wind gusts, localized water logging, hail, heat index).'}
            </li>
            <li>
              <strong>{isHindi ? 'स्थान एवं समय निर्देशांक:' : 'Spatiotemporal Coordinates:'}</strong>{' '}
              {isHindi
                ? 'डॉपलर रडार सत्यापन हेतु घटना क्षेत्र से बंधे भौगोलिक अक्षांश और देशांतर।'
                : 'Geographic latitude and longitude bound strictly to the incident zone for Doppler radar corroboration.'}
            </li>
            <li>
              <strong>{isHindi ? 'ऐच्छिक साक्ष्य मीडिया:' : 'Optional Media Evidence:'}</strong>{' '}
              {isHindi
                ? 'नागरिकों द्वारा स्वेच्छा से प्रदान की गई घटना की तस्वीरें एवं क्षति का विवरण।'
                : 'Incident photographs and damage descriptions provided voluntarily by citizens.'}
            </li>
            <li>
              <strong>{isHindi ? 'राहत / सहायता विवरण:' : 'Relief / Aid Submissions:'}</strong>{' '}
              {isHindi
                ? 'आपदा राहत समन्वय हेतु स्वेच्छा से प्रदान किए गए संपर्क नाम और आपातकालीन फोन नंबर।'
                : 'Contact person names and emergency phone numbers provided voluntarily for disaster relief coordination.'}
            </li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h2 className="text-[17px] font-black text-slate-900">
            {isHindi ? '२. DPDPA 2023 अधिनियम का अनुपालन' : '2. Compliance with DPDPA 2023'}
          </h2>
          <p className="text-slate-600">
            {isHindi
              ? 'भारत के डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDPA 2023) के तहत नागरिकों को अपनी जानकारी पर पूर्ण संप्रभुता प्राप्त है:'
              : 'Under India’s Digital Personal Data Protection Act (DPDPA 2023), citizens possess full sovereignty over their submitted information:'}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              <strong>{isHindi ? 'हटाने का अधिकार:' : 'Right to Erase:'}</strong>{' '}
              {isHindi
                ? 'आप किसी भी समय अपनी नागरिक रिपोर्ट या राहत अनुरोध को हटाने का अनुरोध कर सकते हैं।'
                : 'You may request the deletion of any citizen report or relief request at any time.'}
            </li>
            <li>
              <strong>{isHindi ? 'उद्देश्य सीमांकन:' : 'Purpose Limitation:'}</strong>{' '}
              {isHindi
                ? 'टेलीमेट्री का उपयोग केवल मौसम मॉडलिंग, आपदा पूर्व चेतावनी और राहत प्रेषण के लिए किया जाता है।'
                : 'Telemetry is used strictly for meteorological modeling, disaster early warning, and relief dispatch.'}
            </li>
            <li>
              <strong>{isHindi ? 'कोई व्यावसायिक मुद्रीकरण नहीं:' : 'No Commercial Monetization:'}</strong>{' '}
              {isHindi
                ? 'किसी भी उपयोगकर्ता डेटा को कभी भी विज्ञापनों के लिए मुद्रीकृत या तीसरे पक्ष के दलालों को साझा नहीं किया जाता।'
                : 'No user data is ever monetized, shared with advertisers, or transferred to third-party data brokers.'}
            </li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h2 className="text-[17px] font-black text-slate-900">
            {isHindi ? '३. डेटा संरक्षण अधिकारी से संपर्क' : '3. Contact Data Protection Officer'}
          </h2>
          <p className="text-slate-600">
            {isHindi
              ? 'गोपनीयता अथवा डेटा विलोपन अनुरोधों के लिए हमारे नियुक्त लोकपाल से संपर्क करें:'
              : 'For inquiries regarding telemetry privacy or data deletion requests, contact our designated privacy ombudsman:'}
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[12px] space-y-1 font-semibold text-slate-700">
            <div>
              {isHindi
                ? 'डेटा संरक्षण कार्यालय — राष्ट्रीय मौसम आसूचना गेटवे'
                : 'Data Protection Office — National Weather Intelligence Gateway'}
            </div>
            <div>
              {isHindi
                ? 'पृथ्वी विज्ञान मंत्रालय / भारत मौसम विज्ञान विभाग'
                : 'Ministry of Earth Sciences / India Meteorological Department'}
            </div>
            <div>
              Email: <strong className="text-amber-700">privacy@skysignal.imd.gov.in</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
