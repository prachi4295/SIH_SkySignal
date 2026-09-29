"""
SkySignal 2.0 — End-to-End Ingestion & ML Pipeline Demonstration.

Demonstrates:
  1. Reading incoming raw JSON telemetry batch.
  2. Passing through Tier 0 Cheap Operations (Pre-Filter).
  3. Passing valid clean data through Tier 1 Calibrated ML Models.
  4. Decision Routing (Confirmed Event / Under Review / Discarded).
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime

if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import joblib
from backend.app.pipeline.pre_filter import CheapPreFilter


def run_pipeline_demo(json_path: str = "backend/data/demo_weather_stream.json"):
    print("=" * 80)
    print("      SKYSIGNAL 2.0 — INGESTION PIPELINE & ML DEMONSTRATION")
    print("=" * 80)

    # 1. Load Demo Data
    with open(json_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"\n[LOADED] {len(records)} incoming raw telemetry records from: {json_path}")

    # 2. Load Models & Filter
    pre_filter = CheapPreFilter(enforce_geo_bounds=True)
    bundle_path = "backend/models_saved/skysignal_ml_bundle.joblib"
    
    if not os.path.exists(bundle_path):
        print("\n[INFO] Training ML model bundle first...")
        from backend.ml.train import run_training_pipeline
        run_training_pipeline()

    bundle = joblib.load(bundle_path)
    cat_model = bundle["category_model"]
    sev_model = bundle["severity_model"]
    trust_model = bundle["trust_model"]

    # 3. Process Batch
    passed_records = []
    discarded_records = []
    total_cheap_us = 0.0
    total_ml_ms = 0.0

    print("\n" + "-" * 80)
    print(f"{'ID':<9} | {'SOURCE':<18} | {'TIER 0 CHEAP FILTER':<28} | {'ACTION'}")
    print("-" * 80)

    for item in records:
        record_id = item["id"]
        source = item["source"]
        text = item.get("text", "")
        lat = item.get("latitude")
        lon = item.get("longitude")
        ts_str = item.get("timestamp")
        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00")) if ts_str else None
        sensor_data = item.get("sensor_data")

        # Step 1: Tier 0 Cheap Filter
        t0 = time.perf_counter()
        res = pre_filter.evaluate(
            text=text,
            latitude=lat,
            longitude=lon,
            timestamp=ts,
            sensor_data=sensor_data,
        )
        elapsed_us = (time.perf_counter() - t0) * 1_000_000
        total_cheap_us += elapsed_us

        if not res.passed:
            discarded_records.append((item, res))
            print(f"{record_id:<9} | {source:<18} | REJECT: {res.gate_failed:<19} | [DISCARDED - $0 Spent]")
            print(f"          └─ Reason: {res.rejection_reason}")
        else:
            # Step 2: Tier 1 ML Inference
            t1 = time.perf_counter()
            pred_cat = cat_model.predict([res.sanitized_text])[0]
            cat_probs = cat_model.predict_proba([res.sanitized_text])[0]
            cat_conf = max(cat_probs)

            pred_sev = sev_model.predict([res.sanitized_text])[0]
            misleading_prob = trust_model.predict_proba([res.sanitized_text])[0][1]
            elapsed_ms = (time.perf_counter() - t1) * 1000
            total_ml_ms += elapsed_ms

            # Step 3: Lifecycle Routing Decision
            if cat_conf < 0.60 or misleading_prob > 0.40:
                routing = "ROUTE -> Analyst Verification Queue (Under Review)"
            else:
                routing = "ROUTE -> Spatial Event Fusion Engine (Active)"

            passed_records.append({
                "id": record_id,
                "text": text,
                "predicted_category": pred_cat,
                "category_confidence": round(float(cat_conf), 3),
                "predicted_severity": pred_sev,
                "misleading_risk": round(float(misleading_prob), 3),
                "routing": routing,
            })

            print(f"{record_id:<9} | {source:<18} | PASSED ({elapsed_us:5.1f} us)           | [FORWARD TO ML]")

    # 4. Show ML Predictions for Passed Telemetry
    print("\n" + "=" * 80)
    print("      TIER 1 ML INFERENCE RESULTS (ON CLEAN VERIFIED TELEMETRY)")
    print("=" * 80)

    for p in passed_records:
        print(f"\n[Record {p['id']}] Text: \"{p['text']}\"")
        print(f"  ├─ Predicted Category : {p['predicted_category'].upper()} (Confidence: {p['category_confidence']*100:.1f}%)")
        print(f"  ├─ Predicted Severity : {p['predicted_severity'].upper()}")
        print(f"  ├─ Misinformation Risk: {p['misleading_risk']*100:.1f}%")
        print(f"  └─ Next Pipeline Step : {p['routing']}")

    # 5. Summary Statistics & Cost Savings
    print("\n" + "=" * 80)
    print("      PIPELINE SUMMARY & COMPUTATIONAL SAVINGS")
    print("=" * 80)
    print(f"  Total Ingested Records    : {len(records)}")
    print(f"  Rejected by Cheap Filter  : {len(discarded_records)} ({len(discarded_records)/len(records)*100:.0f}%) [Blocked spam, bad GPS, sensor spikes, stale data]")
    print(f"  Processed by ML Engine    : {len(passed_records)} ({len(passed_records)/len(records)*100:.0f}%)")
    print(f"  Avg Tier 0 Filter Latency : {total_cheap_us / len(records):.2f} microseconds (~{total_cheap_us / len(records) / 1000:.4f} ms)")
    print(f"  Avg Tier 1 ML Latency     : {total_ml_ms / max(1, len(passed_records)):.2f} milliseconds")
    print("  Cost Saved                : 100% of discarded records never hit expensive AI/GPU/Cloud APIs!")
    print("=" * 80)


if __name__ == "__main__":
    run_pipeline_demo()
