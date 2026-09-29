"""
SkySignal 2.0 — Machine Learning Training Pipeline.

Trains and evaluates:
  1. Weather Event Category Classifier (7 classes: rainfall, flooding, thunderstorm,
     heatwave, fog, dust_storm, strong_wind) with probability calibration.
  2. Weather Severity Predictor (4 levels: low, moderate, severe, critical).
  3. Misinformation / Trust Risk Estimator (P_misleading).

Outputs production-ready serialized model artifacts and benchmark metrics.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    f1_score,
)
from sklearn.pipeline import Pipeline

from backend.ml.dataset import CATEGORIES, SEVERITIES, load_or_generate_dataset


class SkySignalMLTrainer:
    """
    Orchestrates end-to-end training, calibration, validation, and serialization.
    """

    def __init__(self, output_dir: str = "backend/models_saved"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.category_pipeline: Pipeline | None = None
        self.severity_pipeline: Pipeline | None = None
        self.trust_pipeline: Pipeline | None = None

    def build_text_pipeline(self) -> Pipeline:
        """
        Builds a multilingual TF-IDF vectorizer + Calibrated Linear Classifier.
        Uses word n-grams (1-3) & char n-grams (2-5) for high accuracy across
        English, Hindi (Devanagari), and Hinglish transliterations.
        """
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            analyzer="word",
            min_df=2,
            sublinear_tf=True,
            norm="l2",
        )
        base_clf = LogisticRegression(
            C=2.0,
            max_iter=1000,
            class_weight="balanced",
            solver="lbfgs",
            random_state=42,
        )
        calibrated_clf = CalibratedClassifierCV(
            estimator=base_clf,
            method="sigmoid",
            cv=3,
        )
        return Pipeline([
            ("tfidf", vectorizer),
            ("clf", calibrated_clf),
        ])

    def train_category_model(self, train_df: pd.DataFrame, val_df: pd.DataFrame) -> dict[str, Any]:
        """Trains and validates the primary 7-class weather category model."""
        print("\n" + "=" * 60)
        print("  TRAINING WEATHER CATEGORY CLASSIFIER (7 CLASSES)")
        print("=" * 60)

        pipeline = self.build_text_pipeline()
        t0 = time.time()
        pipeline.fit(train_df["text"], train_df["category"])
        train_time = time.time() - t0

        # Evaluate on validation set
        val_preds = pipeline.predict(val_df["text"])
        macro_f1 = f1_score(val_df["category"], val_preds, average="macro")

        print(f"[OK] Training finished in {train_time:.2f}s")
        print(f"[OK] Validation Macro F1 Score: {macro_f1:.4f}\n")
        print("Detailed Classification Report:")
        report_dict = classification_report(
            val_df["category"], val_preds, target_names=sorted(train_df["category"].unique()), output_dict=True
        )
        print(classification_report(val_df["category"], val_preds))

        self.category_pipeline = pipeline
        return {
            "macro_f1": float(macro_f1),
            "train_time_sec": float(train_time),
            "report": report_dict,
        }

    def train_severity_model(self, train_df: pd.DataFrame, val_df: pd.DataFrame) -> dict[str, Any]:
        """Trains the 4-level meteorological severity classifier."""
        print("\n" + "=" * 60)
        print("  TRAINING SEVERITY ESTIMATION MODEL (4 LEVELS)")
        print("=" * 60)

        pipeline = self.build_text_pipeline()
        pipeline.fit(train_df["text"], train_df["severity"])

        val_preds = pipeline.predict(val_df["text"])
        macro_f1 = f1_score(val_df["severity"], val_preds, average="macro")
        print(f"[OK] Severity Validation Macro F1: {macro_f1:.4f}\n")

        self.severity_pipeline = pipeline
        return {"severity_macro_f1": float(macro_f1)}

    def train_trust_model(self, train_df: pd.DataFrame, val_df: pd.DataFrame) -> dict[str, Any]:
        """Trains the Misinformation / Spam Risk probability model."""
        print("\n" + "=" * 60)
        print("  TRAINING MISINFORMATION / TRUST RISK MODEL (P_misleading)")
        print("=" * 60)

        pipeline = self.build_text_pipeline()
        pipeline.fit(train_df["text"], train_df["is_misleading"])

        val_preds = pipeline.predict(val_df["text"])
        f1 = f1_score(val_df["is_misleading"], val_preds, zero_division=0)
        print(f"[OK] Misleading Detection F1: {f1:.4f}\n")

        self.trust_pipeline = pipeline
        return {"misleading_f1": float(f1)}

    def save_artifacts(self, metrics: dict[str, Any]) -> str:
        """Serializes trained models and saves metadata."""
        bundle = {
            "category_model": self.category_pipeline,
            "severity_model": self.severity_pipeline,
            "trust_model": self.trust_pipeline,
            "categories": CATEGORIES,
            "severities": SEVERITIES,
            "trained_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "version": "2.0.0",
        }

        artifact_path = self.output_dir / "skysignal_ml_bundle.joblib"
        joblib.dump(bundle, artifact_path, compress=3)
        print(f"[OK] Model bundle saved to: {artifact_path}")

        # Save metrics JSON
        metrics_path = self.output_dir / "training_metrics.json"
        with open(metrics_path, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)
        print(f"[OK] Metrics saved to: {metrics_path}")

        return str(artifact_path)


def run_training_pipeline(csv_path: str | None = None, n_samples: int = 1400) -> None:
    """Main execution entry point."""
    print("[INFO] Initializing SkySignal 2.0 ML Pipeline...")
    train_df, val_df, test_df = load_or_generate_dataset(csv_path, n_samples)
    print(f"Dataset summary: Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}")

    trainer = SkySignalMLTrainer(output_dir="backend/models_saved")
    cat_metrics = trainer.train_category_model(train_df, val_df)
    sev_metrics = trainer.train_severity_model(train_df, val_df)
    trust_metrics = trainer.train_trust_model(train_df, val_df)

    all_metrics = {
        **cat_metrics,
        **sev_metrics,
        **trust_metrics,
        "dataset_size": len(train_df) + len(val_df) + len(test_df),
    }

    trainer.save_artifacts(all_metrics)
    print("\n[SUCCESS] ML Training Pipeline completed successfully!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train SkySignal ML Models")
    parser.add_argument("--data", type=str, default=None, help="Path to CSV dataset")
    parser.add_argument("--samples", type=int, default=1400, help="Number of synthetic samples if no CSV")
    args = parser.parse_args()

    run_training_pipeline(csv_path=args.data, n_samples=args.samples)
