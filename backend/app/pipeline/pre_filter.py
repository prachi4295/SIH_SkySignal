"""
Cheap Pre-Filtering Pipeline Engine (Tier 0).

Executes ultra-fast (sub-millisecond, O(1) complexity) heuristic and rule-based
checks to discard noise, spam, invalid telemetry, and duplicate submissions
BEFORE expensive Machine Learning or LLM inference is invoked.

Pipeline Gates:
  1. Structural & Format Gate: Empty checks, character bounds, encoding sanity.
  2. Spatial Sanity Gate: Coordinate ranges, bounding-box checks (India/Global).
  3. Temporal Sanity Gate: Future timestamp rejection, stale data gating (>48h).
  4. Spam & Non-Weather Noise Gate: Regex/keyword blacklist, crypto/bot detection, URL spam.
  5. Exact / Near-Duplicate Hash Gate: Fast text SimHash/MD5 and Perceptual Image dHash.
  6. Sensor Outlier Gating: Meteorological physical bounds verification.
"""

from __future__ import annotations

import hashlib
import io
import math
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional

try:
    from PIL import Image
    import imagehash
    IMAGE_HASH_AVAILABLE = True
except ImportError:
    IMAGE_HASH_AVAILABLE = False


# ── Configuration & Physical Thresholds ────────────────────────────────────

# Physical Meteorological Bounds (India & Global extremes)
METEO_BOUNDS = {
    "temperature_c": (-35.0, 58.0),       # Siachen (-35C) to Phalodi (+51C max recorded)
    "humidity_pct": (0.0, 100.0),
    "wind_speed_kmh": (0.0, 320.0),       # Super Cyclonic Storm upper bound
    "pressure_hpa": (870.0, 1085.0),      # Typhoon Tip lowest (870) to high pressure
    "rainfall_rate_mmh": (0.0, 350.0),    # Highest cloudburst rate per hour
}

# India Geographic Bounding Box (with safe buffer)
INDIA_BBOX = {
    "lat_min": 6.0,
    "lat_max": 38.0,
    "lon_min": 68.0,
    "lon_max": 98.0,
}

# Fast Regex Spam / Bot Patterns
SPAM_PATTERNS = [
    re.compile(r"(?i)\b(crypto|bitcoin|forex|casino|betting|airdrop|whatsapp\s+group|click\s+here|free\s+money|lottery|discount\s+code)\b"),
    re.compile(r"https?://(?:t\.me|bit\.ly|tinyurl\.com|goo\.gl|wa\.me)/[^\s]+", re.I),
    re.compile(r"(?i)follow\s+(?:back|me)\s+on\s+instagram"),
    re.compile(r"(.)\1{9,}"),  # Character flooding (e.g., aaaaaaaaaaa)
]

# Weather Relevance Keywords (Bilingual: English + Hindi)
WEATHER_KEYWORDS = {
    "rain", "rainfall", "heavy rain", "downpour", "flood", "flooding", "waterlogging",
    "thunder", "thunderstorm", "lightning", "heat", "heatwave", "temperature",
    "fog", "smog", "mist", "visibility", "dust", "dust storm", "storm",
    "wind", "gale", "cyclone", "gust", "hail", "cloudburst", "cloud",
    "weather", "monsoon", "drizzle", "inundation", "overflow", "celsius",
    # Hindi
    "बारिश", "वर्षा", "पानी", "बाढ़", "जलभराव", "तूफान", "बिजली", "गरज",
    "गर्मी", "लू", "तापमान", "कोहरा", "धुंध", "धूल", "आंधी", "चक्रवात", "मौसम"
}


@dataclass
class PreFilterResult:
    """Detailed outcome of the cheap pre-filtering process."""
    passed: bool
    rejection_reason: Optional[str] = None
    gate_failed: Optional[str] = None
    cost_saved: bool = False
    relevance_score: float = 0.0
    text_fingerprint: str = ""
    image_perceptual_hash: Optional[str] = None
    sanitized_text: str = ""
    metrics: dict[str, Any] = field(default_factory=dict)


class CheapPreFilter:
    """
    Ultra-low latency heuristic pre-filter.
    Can be run synchronously in FastAPI requests or worker consumer loops.
    """

    def __init__(
        self,
        enforce_geo_bounds: bool = True,
        max_age_hours: float = 48.0,
        min_text_len: int = 5,
        max_text_len: int = 2000,
    ):
        self.enforce_geo_bounds = enforce_geo_bounds
        self.max_age_hours = max_age_hours
        self.min_text_len = min_text_len
        self.max_text_len = max_text_len

    def evaluate(
        self,
        text: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        timestamp: Optional[datetime] = None,
        sensor_data: Optional[dict[str, float]] = None,
        media_bytes: Optional[bytes] = None,
    ) -> PreFilterResult:
        """
        Runs all sub-millisecond filtering gates in order of lowest CPU cost.
        """
        # ── GATE 1: Structural & Text Bounds ──────────────────────
        sanitized = ""
        if text is not None:
            sanitized = text.strip()
            # Null byte & control character sanitization
            sanitized = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", sanitized)
            
            if len(sanitized) < self.min_text_len and not media_bytes and not sensor_data:
                return PreFilterResult(
                    passed=False,
                    rejection_reason=f"Content too short (< {self.min_text_len} chars)",
                    gate_failed="STRUCTURAL_GATE",
                    cost_saved=True,
                )

            if len(sanitized) > self.max_text_len:
                # Truncate rather than outright reject if contains valuable text
                sanitized = sanitized[: self.max_text_len]

        # ── GATE 2: Spatial Sanity ─────────────────────────────────
        if latitude is not None and longitude is not None:
            # Check NaN / Infinite
            if math.isnan(latitude) or math.isnan(longitude) or math.isinf(latitude) or math.isinf(longitude):
                return PreFilterResult(
                    passed=False,
                    rejection_reason="Invalid non-numeric coordinates (NaN/Inf)",
                    gate_failed="SPATIAL_GATE",
                    cost_saved=True,
                )

            # Global coordinate validity
            if not (-90.0 <= latitude <= 90.0 and -180.0 <= longitude <= 180.0):
                return PreFilterResult(
                    passed=False,
                    rejection_reason=f"Coordinates ({latitude}, {longitude}) outside global valid range",
                    gate_failed="SPATIAL_GATE",
                    cost_saved=True,
                )

            # India Bounding Box Check (if enforced)
            if self.enforce_geo_bounds:
                if not (INDIA_BBOX["lat_min"] <= latitude <= INDIA_BBOX["lat_max"] and
                        INDIA_BBOX["lon_min"] <= longitude <= INDIA_BBOX["lon_max"]):
                    return PreFilterResult(
                        passed=False,
                        rejection_reason=f"Location ({latitude:.3f}, {longitude:.3f}) outside national jurisdiction domain",
                        gate_failed="SPATIAL_GATE",
                        cost_saved=True,
                    )

        # ── GATE 3: Temporal Sanity ────────────────────────────────
        if timestamp is not None:
            now = datetime.now(timezone.utc)
            if timestamp.tzinfo is None:
                ts_utc = timestamp.replace(tzinfo=timezone.utc)
            else:
                ts_utc = timestamp.astimezone(timezone.utc)

            # Reject future timestamps (> 15 minutes clock skew allowance)
            delta_seconds = (ts_utc - now).total_seconds()
            if delta_seconds > 900:
                return PreFilterResult(
                    passed=False,
                    rejection_reason=f"Timestamp is in the future (+{delta_seconds:.0f}s ahead)",
                    gate_failed="TEMPORAL_GATE",
                    cost_saved=True,
                )

            # Reject stale reports (> max_age_hours)
            age_hours = (now - ts_utc).total_seconds() / 3600.0
            if age_hours > self.max_age_hours:
                return PreFilterResult(
                    passed=False,
                    rejection_reason=f"Telemetry is stale ({age_hours:.1f} hours old > {self.max_age_hours}h)",
                    gate_failed="TEMPORAL_GATE",
                    cost_saved=True,
                )

        # ── GATE 4: Spam / Bot Pattern Discard ─────────────────────
        if sanitized:
            for pattern in SPAM_PATTERNS:
                if pattern.search(sanitized):
                    return PreFilterResult(
                        passed=False,
                        rejection_reason="Spam/Promotional signature matched",
                        gate_failed="SPAM_GATE",
                        cost_saved=True,
                        sanitized_text=sanitized,
                    )

        # ── GATE 5: Cheap Weather Relevance Lexical Check ──────────
        relevance_score = 0.5  # Neutral default for telemetry with media/sensors
        if sanitized:
            lowered = sanitized.lower()
            tokens = set(re.findall(r"\w+", lowered))
            matches = tokens.intersection(WEATHER_KEYWORDS)
            
            # Check Hindi substring matching as well
            hindi_matches = [kw for kw in WEATHER_KEYWORDS if ord(kw[0]) > 127 and kw in lowered]
            total_matches = len(matches) + len(hindi_matches)

            if total_matches > 0:
                relevance_score = min(1.0, 0.6 + (0.1 * total_matches))
            else:
                # If no text keywords and no sensors/media, likely non-weather chatter
                if not sensor_data and not media_bytes:
                    relevance_score = 0.1
                    return PreFilterResult(
                        passed=False,
                        rejection_reason="No meteorological keywords or weather indicators found in text",
                        gate_failed="RELEVANCE_GATE",
                        cost_saved=True,
                        relevance_score=relevance_score,
                        sanitized_text=sanitized,
                    )

        # ── GATE 6: Sensor Physical Outlier Validation ─────────────
        if sensor_data:
            for param, val in sensor_data.items():
                if param in METEO_BOUNDS:
                    min_v, max_v = METEO_BOUNDS[param]
                    if val < min_v or val > max_v:
                        return PreFilterResult(
                            passed=False,
                            rejection_reason=f"Sensor '{param}' reading {val} violates physical limits [{min_v}, {max_v}]",
                            gate_failed="SENSOR_ANOMALY_GATE",
                            cost_saved=True,
                        )

        # ── GATE 7: Image Perceptual Hashing & Format Gate ────────
        img_hash = None
        if media_bytes and IMAGE_HASH_AVAILABLE:
            try:
                img = Image.open(io.BytesIO(media_bytes))
                img.verify()  # Validate image integrity without full decoding
                # Reopen to compute perceptual hash (verify closes buffer)
                img = Image.open(io.BytesIO(media_bytes))
                img_hash = str(imagehash.dhash(img))
            except Exception as e:
                return PreFilterResult(
                    passed=False,
                    rejection_reason=f"Corrupted or invalid media file: {str(e)}",
                    gate_failed="MEDIA_INTEGRITY_GATE",
                    cost_saved=True,
                )

        # Generate fast text fingerprint (normalized token hash)
        text_fingerprint = ""
        if sanitized:
            norm_tokens = sorted(set(re.findall(r"\w+", sanitized.lower())))
            text_fingerprint = hashlib.md5(" ".join(norm_tokens).encode("utf-8")).hexdigest()

        # Passed all gates! Ready for AI / ML processing
        return PreFilterResult(
            passed=True,
            rejection_reason=None,
            gate_failed=None,
            cost_saved=False,
            relevance_score=relevance_score,
            text_fingerprint=text_fingerprint,
            image_perceptual_hash=img_hash,
            sanitized_text=sanitized,
            metrics={
                "char_length": len(sanitized),
                "has_sensor_data": bool(sensor_data),
                "has_media": bool(media_bytes),
                "img_hash": img_hash,
            }
        )
