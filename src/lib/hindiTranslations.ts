/* ═══════════════════════════════════════════════════════
   SkySignal — Comprehensive Hindi Localization Utilities
   Provides full bilingual translation maps for categories,
   severities, lifecycle states, weather conditions,
   analytics metrics, and incident titles.
   ═══════════════════════════════════════════════════════ */

export const CATEGORY_HI: Record<string, string> = {
  rainfall: 'भारी वर्षा',
  thunderstorm: 'गरज के साथ तूफ़ान',
  flooding: 'बाढ़ / जलभराव',
  heatwave: 'भीषण लू',
  fog: 'घना कोहरा',
  'dust storm': 'धूल भरी आंधी',
  'strong wind': 'तेज आंधी-तूफान',
  all: 'सभी खतरे',
};

export const SEVERITY_HI: Record<string, string> = {
  minor: 'मामूली',
  moderate: 'मध्यम',
  severe: 'गंभीर',
};

export const LIFECYCLE_HI: Record<string, string> = {
  detected: 'पहचाना गया',
  emerging: 'उभरता हुआ',
  confirmed: 'पुष्टीकृत',
  active: 'सक्रिय',
  declining: 'कम होता हुआ',
  resolved: 'समाधानित',
  rejected: 'अस्वीकृत',
};

export const CONDITION_HI: Record<string, string> = {
  'Sunny': 'धूप',
  'Clear': 'साफ मौसम',
  'Partly Cloudy': 'आंशिक बादल',
  'Cloudy': 'बादल छाए रहेंगे',
  'Overcast': 'घने बादल',
  'Rain': 'बारिश',
  'Light Rain': 'हल्की बारिश',
  'Heavy Rain': 'भारी बारिश',
  'Thunderstorm': 'गरज के साथ तूफान',
  'Mist': 'हल्की धुंध',
  'Haze': 'धुंध / कुहासा',
  'Fog': 'घना कोहरा',
  'Hot & Dry': 'गर्म और शुष्क',
  'Severe Heatwave': 'भीषण लू',
  'Dust Storm': 'धूल भरी आंधी',
  'Strong Wind': 'तेज हवाएं',
  'Moderate Rain': 'मध्यम बारिश',
  'Drizzle': 'बूंदाबांदी',
};

export function translateCategory(cat?: string, isHindi?: boolean): string {
  if (!cat) return '';
  if (!isHindi) return cat;
  const key = cat.toLowerCase().trim();
  return CATEGORY_HI[key] || cat;
}

export function translateSeverity(sev?: string, isHindi?: boolean): string {
  if (!sev) return '';
  if (!isHindi) return sev;
  const key = sev.toLowerCase().trim();
  return SEVERITY_HI[key] || sev;
}

export function translateLifecycle(status?: string, isHindi?: boolean): string {
  if (!status) return '';
  if (!isHindi) return status;
  const key = status.toLowerCase().trim();
  return LIFECYCLE_HI[key] || status;
}

export function translateCondition(cond?: string, isHindi?: boolean): string {
  if (!cond) return '';
  if (!isHindi) return cond;
  return CONDITION_HI[cond] || cond;
}

// Translate common incident title patterns to natural Hindi
export function translateEventTitle(title?: string, isHindi?: boolean): string {
  if (!title) return '';
  if (!isHindi) return title;

  const TITLE_MAP: Record<string, string> = {
    'Heavy Rainfall & Flash Waterlogging Warning': 'भारी वर्षा एवं त्वरित जलभराव की चेतावनी',
    'Severe Thunderstorm with Lightning & Hail': 'बिजली चमकने और ओलावृष्टि के साथ भीषण तूफान',
    'Urban Flooding & Low-Lying Inundation': 'शहरी बाढ़ और निचले इलाकों में जलभराव',
    'Severe Heatwave Alert & High Temp Warning': 'भीषण लू का अलर्ट और अत्यधिक तापमान की चेतावनी',
    'Dense Fog & Low Visibility Advisory': 'घना कोहरा और कम दृश्यता की चेतावनी',
    'Dust Storm & High Velocity Wind Squall': 'धूल भरी आंधी और तेज गति की हवाएं',
    'Strong Wind & Gale Force Gust Advisory': 'तेज हवा और प्रचंड झोंकों की सलाह',
    'Cyclonic Squall & Coastal High Surge': 'चक्रवाती तूफान और तटीय ऊंची लहरों की चेतावनी',
    'Intense Thunderstorm Activity': 'तीव्र आंधी-तूफान की गतिविधि',
    'Localized Waterlogging & Traffic Snarls': 'स्थानीय जलभराव और यातायात जाम',
    'Cloudburst & Torrential Downpour': 'बादल फटना और मूसलाधार बारिश',
    'Cold Wave & Dense Morning Fog': 'शीतलहर और सुबह का घना कोहरा',
    'High Velocity Dust Storm': 'उच्च वेग वाली धूल भरी आंधी',
    'Thunderstorm with Squall Winds': 'तेज हवाओं के साथ गरज-चमक',
  };

  if (TITLE_MAP[title]) return TITLE_MAP[title];

  // Dynamic replacements for unknown title compositions
  let res = title;
  res = res.replace(/Heavy Rainfall/gi, 'भारी वर्षा');
  res = res.replace(/Flash Waterlogging/gi, 'त्वरित जलभराव');
  res = res.replace(/Waterlogging/gi, 'जलभराव');
  res = res.replace(/Severe Thunderstorm/gi, 'भीषण तूफान');
  res = res.replace(/Thunderstorm/gi, 'आंधी-तूफान');
  res = res.replace(/Lightning & Hail/gi, 'बिजली और ओलावृष्टि');
  res = res.replace(/Urban Flooding/gi, 'शहरी बाढ़');
  res = res.replace(/Flooding/gi, 'बाढ़');
  res = res.replace(/Severe Heatwave/gi, 'भीषण लू');
  res = res.replace(/Heatwave/gi, 'लू');
  res = res.replace(/Dense Fog/gi, 'घना कोहरा');
  res = res.replace(/Dust Storm/gi, 'धूल भरी आंधी');
  res = res.replace(/Strong Wind/gi, 'तेज हवा');
  res = res.replace(/Warning/gi, 'चेतावनी');
  res = res.replace(/Alert/gi, 'अलर्ट');
  res = res.replace(/Advisory/gi, 'सलाह');
  res = res.replace(/Low-Lying Inundation/gi, 'निचले इलाकों में जलमग्नता');
  res = res.replace(/High Temp Warning/gi, 'अत्यधिक तापमान चेतावनी');
  return res;
}
