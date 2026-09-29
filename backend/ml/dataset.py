"""
Dataset loader, generator, and preprocessor for SkySignal 2.0 ML Pipeline.
Supports loading external CSV / JSON data and generating realistic Indian weather
telemetry corpora in bilingual (English & Hindi) formats.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass
from typing import Any, Optional

import pandas as pd
from sklearn.model_selection import train_test_split


CATEGORIES = [
    "rainfall",
    "flooding",
    "thunderstorm",
    "heatwave",
    "fog",
    "dust_storm",
    "strong_wind",
]

SEVERITIES = ["low", "moderate", "severe", "critical"]

# Seed templates for synthetic generation and augmentation
SYNTHETIC_TEMPLATES: dict[str, list[str]] = {
    "rainfall": [
        "Extremely heavy rainfall in {city} since morning, streets are getting wet.",
        "Continuous drizzle and light precipitation observed near {area}.",
        "Cloudburst-like downpour in {city}. Rain gauge records 85mm in 1 hour.",
        "Monsoon showers causing reduced visibility and wet roads in {area}.",
        "{city} में आज सुबह से मूसलाधार बारिश हो रही है। चारों तरफ पानी ही पानी है।",
        "हल्की वर्षा और बूंदाबांदी शुरू हो गई है {area} में।",
        "तेज बारिश के कारण जनजीवन प्रभावित हुआ है {city} के निकट।",
    ],
    "flooding": [
        "Severe waterlogging in {area}, water level reached 3 feet high.",
        "River overflowed and submerged the low-lying colonies in {city}.",
        "Cars submerged in underpass near {area}. Flash flood warning issued.",
        "Houses flooded in sector 4 of {city} due to poor drainage.",
        "{city} में भीषण बाढ़ की स्थिति है, निचले इलाके पूरी तरह जलमग्न हो चुके हैं।",
        "{area} में भारी जलभराव के कारण गाड़ियां डूब गई हैं।",
        "नालों के उफान पर आने से कॉलोनियों में पानी भर गया है {city} में।",
    ],
    "thunderstorm": [
        "Violent thunderstorm with frequent lightning strikes in {city}.",
        "Hailstorm damaging crops and parked vehicles in {area}.",
        "Loud thunder claps and severe squall shaking window panes in {city}.",
        "Lightning strike reported near transmission tower in {area}.",
        "{city} में भयंकर आंधी-तूफान के साथ आकाशीय बिजली चमक रही है।",
        "ओलावृष्टि से फसलों को भारी नुकसान पहुंचा है {area} क्षेत्र में।",
        "गरज और चमक के साथ तेज अंधड़ चल रहा है {city} में।",
    ],
    "heatwave": [
        "Scorching heatwave in {city}, mercury hits 47.5 degrees Celsius.",
        "Severe Loo winds blowing across {area}. Avoid stepping outside.",
        "Extreme temperature rise, heat exhaustion alerts active in {city}.",
        "Searing sun and record breaking heat recorded at {area} weather station.",
        "{city} में भीषण गर्मी और लू का प्रकोप जारी है, पारा 48 डिग्री पार पहुंचा।",
        "गर्म हवाओं (लू) के कारण दोपहर में सड़कें वीरान हो गई हैं {area} में।",
        "अत्यधिक तापमान से लोग बेहाल हैं {city} में।",
    ],
    "fog": [
        "Dense fog engulfs {city}, airport visibility drops to less than 50 meters.",
        "Heavy smog and zero visibility causing traffic pileups on highway near {area}.",
        "Thick winter morning fog covering all major junctions in {city}.",
        "Shallow mist turning into dense smog during evening rush hour in {area}.",
        "{city} में घना कोहरा छाया हुआ है, विजिबिलिटी 20 मीटर से भी कम रह गई है।",
        "धुंध और स्मॉग के कारण हाईवे पर गाड़ियों की रफ्तार थमी {area} के पास।",
        "सुबह से ही सफेद चादर की तरह कोहरा छाया है {city} में।",
    ],
    "dust_storm": [
        "Massive dust storm hits {city}, sky turns orange-brown with zero visibility.",
        "High-velocity sandstorm blowing across {area} with blinding dust.",
        "Intense haboob approaching {city}, heavy suspended particulate matter.",
        "Dust devil and sudden gust of sand causing difficulty in breathing in {area}.",
        "{city} में भयंकर धूल भरी आंधी चली, दिन में ही अंधेरा छा गया।",
        "रेतीले तूफान से जनजीवन अस्त-व्यस्त हुआ {area} में।",
        "तेज धूल भरी हवाएं चल रही हैं {city} के पश्चिमी भाग में।",
    ],
    "strong_wind": [
        "Gale-force winds uprooting trees and electric poles in {city}.",
        "Cyclonic gusts exceeding 100 km/h recorded along the coastline near {area}.",
        "Strong squalls tearing down billboards and tin roofs in {city}.",
        "Fierce wind gusts making two-wheeler driving dangerous in {area}.",
        "{city} में तेज हवाओं से पेड़ और बिजली के खंभे उखड़ गए।",
        "चक्रवाती तूफान के चलते 90 किमी/घंटा की रफ्तार से हवाएं चल रही हैं {area} में।",
        "अंधड़ और तेज झोंकों से भारी नुकसान हुआ {city} में।",
    ],
}

CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Ahmedabad", "Jaipur", "Lucknow", "Patna", "Hyderabad", "Bhopal", "Guwahati", "Shimla", "Srinagar"]
AREAS = ["Central Junction", "Ring Road", "Sector 18", "Civil Lines", "MG Road", "Airport Highway", "Old City", "Railway Station", "Outer Bypass"]


def generate_synthetic_weather_dataset(n_samples: int = 1400) -> pd.DataFrame:
    """
    Generates a balanced, realistic bilingual weather telemetry dataset.
    """
    records = []
    samples_per_cat = n_samples // len(CATEGORIES)

    for cat in CATEGORIES:
        templates = SYNTHETIC_TEMPLATES[cat]
        for _ in range(samples_per_cat):
            tmpl = random.choice(templates)
            city = random.choice(CITIES)
            area = random.choice(AREAS)
            text = tmpl.format(city=city, area=area)

            # Assign realistic severity based on category and keywords
            if any(w in text.lower() or w in text for w in ["cloudburst", "मूसलाधार", "submerged", "डूब", "उखड़", "48", "uprooting", "zero visibility", "भयंकर"]):
                severity = random.choice(["severe", "critical"])
            elif any(w in text.lower() or w in text for w in ["light", "drizzle", "बूंदाबांदी", "shallow", "mist"]):
                severity = "low"
            else:
                severity = random.choice(["moderate", "severe"])

            # Misinformation probability simulation (ground truth flag)
            # ~5% spam/misinformation edge cases
            is_misleading = 1 if random.random() < 0.06 else 0
            if is_misleading:
                text = f"[FAKE/UNVERIFIED] {text} click bit.ly/promo for live alerts"

            records.append({
                "text": text,
                "category": cat,
                "severity": severity,
                "is_misleading": is_misleading,
                "language": "hi" if any(ord(c) > 127 for c in text) else "en",
            })

    df = pd.DataFrame(records)
    return df.sample(frac=1.0, random_state=42).reset_index(drop=True)


def load_or_generate_dataset(
    csv_path: Optional[str] = None,
    n_synthetic_if_missing: int = 1400,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Loads dataset from CSV if provided, else generates synthetic weather corpus.
    Returns (train_df, val_df, test_df) with stratified splits.
    """
    if csv_path:
        try:
            df = pd.read_csv(csv_path)
            print(f"[Dataset] Successfully loaded {len(df)} records from {csv_path}")
        except Exception as e:
            print(f"[Dataset] Failed to load {csv_path} ({e}). Falling back to synthetic corpus.")
            df = generate_synthetic_weather_dataset(n_synthetic_if_missing)
    else:
        df = generate_synthetic_weather_dataset(n_synthetic_if_missing)

    # Train / Val / Test split (70% / 15% / 15%)
    train_df, test_val_df = train_test_split(
        df, test_size=0.30, random_state=42, stratify=df["category"]
    )
    val_df, test_df = train_test_split(
        test_val_df, test_size=0.50, random_state=42, stratify=test_val_df["category"]
    )

    return train_df, val_df, test_df
