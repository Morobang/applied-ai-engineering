import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# ── Load model artifacts ───────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "safety_model.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        artifacts = pickle.load(f)
    model         = artifacts["model"]
    label_encoder = artifacts["label_encoder"]
    feature_cols  = artifacts["feature_cols"]
    classes       = artifacts["classes"]
    model_accuracy = artifacts["accuracy"]
    print(f"Model loaded. Accuracy: {model_accuracy}")
except FileNotFoundError:
    raise RuntimeError("safety_model.pkl not found. Run notebook.ipynb first.")

# ── App ────────────────────────────────────────────────────────
app = FastAPI(
    title="Personal Safety AI API",
    description="Detects dangerous situations from phone sensor data — Applied AI Engineering",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ───────────────────────────────────────────────────
class SensorReading(BaseModel):
    """
    Raw sensor features from phone accelerometer and gyroscope.
    In a real app these would come from the phone sensors directly.
    For the demo we use pre-computed feature vectors from the dataset.
    """
    features: list[float]
    hour: int = 14
    duration_minutes: int = 5
    previous_activity: str = None

    class Config:
        json_schema_extra = {
            "example": {
                "features": [0.0] * 561,
                "hour": 23,
                "duration_minutes": 30,
                "previous_activity": "WALKING"
            }
        }

class ScenarioRequest(BaseModel):
    """
    Simplified demo endpoint — takes a scenario name
    instead of raw sensor data. Used by the portfolio demo.
    """
    scenario: str
    hour: int = 14

    class Config:
        json_schema_extra = {
            "example": {
                "scenario": "sudden_fall",
                "hour": 23
            }
        }

class SafetyResult(BaseModel):
    activity: str
    confidence: float
    danger_score: int
    alert_level: str
    action: str
    reasons: list

# ── Danger scoring engine ─────────────────────────────────────
def calculate_danger_score(
    activity: str,
    hour: int,
    duration_minutes: int,
    previous_activity: str = None,
    activity_confidence: float = 1.0
) -> dict:
    score   = 0
    reasons = []

    is_night = hour >= 22 or hour <= 5
    is_late  = hour >= 20 or hour <= 7

    if previous_activity in ['WALKING', 'WALKING_UPSTAIRS', 'WALKING_DOWNSTAIRS'] \
       and activity == 'LAYING':
        score += 50
        reasons.append('Sudden transition from walking to laying — possible fall')

    if activity == 'LAYING':
        if is_night and duration_minutes > 30:
            score += 55
            reasons.append(f'Laying for {duration_minutes} min at night — possible incapacitation')
        elif is_night and duration_minutes > 15:
            score += 35
            reasons.append(f'Laying for {duration_minutes} min at night')
        elif not is_night and duration_minutes > 20:
            score += 40
            reasons.append(f'Laying for {duration_minutes} min during the day — unusual')

    if activity == 'STANDING':
        if duration_minutes > 20 and is_night:
            score += 35
            reasons.append(f'Standing still for {duration_minutes} min at night')
        elif duration_minutes > 30:
            score += 20
            reasons.append(f'Standing still for {duration_minutes} min')

    if activity == 'SITTING':
        if is_night and duration_minutes > 45:
            score += 25
            reasons.append(f'Sitting for {duration_minutes} min at night')

    if is_night and score > 0:
        score = int(score * 1.3)
        reasons.append('Night time increases risk level')

    if activity_confidence < 0.6:
        score = int(score * 1.1)
        reasons.append('Low sensor confidence')

    score = min(score, 100)

    if score >= 70:
        alert_level = 'CRITICAL'
        action      = 'Send alert to trusted contact immediately'
    elif score >= 45:
        alert_level = 'WARNING'
        action      = 'Send check-in notification to user'
    elif score >= 20:
        alert_level = 'CAUTION'
        action      = 'Monitor closely'
    else:
        alert_level = 'SAFE'
        action      = 'No action needed'

    if not reasons:
        reasons.append('Normal activity pattern detected')

    return {
        'danger_score': score,
        'alert_level':  alert_level,
        'action':       action,
        'reasons':      reasons,
    }

# ── Pre-built scenarios for demo ──────────────────────────────
SCENARIOS = {
    'walking_home': {
        'activity': 'WALKING',
        'duration_minutes': 15,
        'previous_activity': None,
        'label': 'Walking home normally'
    },
    'sudden_fall': {
        'activity': 'LAYING',
        'duration_minutes': 5,
        'previous_activity': 'WALKING',
        'label': 'Suddenly laying after walking'
    },
    'standing_still_night': {
        'activity': 'STANDING',
        'duration_minutes': 25,
        'previous_activity': None,
        'label': 'Standing still for 25 min at night'
    },
    'laying_long_night': {
        'activity': 'LAYING',
        'duration_minutes': 40,
        'previous_activity': None,
        'label': 'Laying for 40 min at night'
    },
    'sitting_late': {
        'activity': 'SITTING',
        'duration_minutes': 50,
        'previous_activity': None,
        'label': 'Sitting for 50 min late at night'
    },
}

# ── Routes ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "Personal Safety AI API",
        "status": "online",
        "model_accuracy": model_accuracy,
        "activities_supported": classes,
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True}

@app.get("/model/info")
def model_info():
    return {
        "model_type": "Random Forest Classifier",
        "accuracy": model_accuracy,
        "features": len(feature_cols),
        "classes": classes,
        "training_data": "UCI Human Activity Recognition dataset",
        "samples": 7352,
    }

@app.get("/scenarios")
def get_scenarios():
    """Returns available demo scenarios."""
    return {"scenarios": list(SCENARIOS.keys())}

@app.post("/predict/scenario", response_model=SafetyResult)
def predict_scenario(request: ScenarioRequest):
    """
    Demo endpoint — takes a scenario name and hour,
    returns a danger assessment without needing raw sensor data.
    Perfect for the portfolio demo.
    """
    if request.scenario not in SCENARIOS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario. Available: {list(SCENARIOS.keys())}"
        )

    s        = SCENARIOS[request.scenario]
    activity = s['activity']
    result   = calculate_danger_score(
        activity=activity,
        hour=request.hour,
        duration_minutes=s['duration_minutes'],
        previous_activity=s['previous_activity'],
        activity_confidence=0.95,
    )

    return SafetyResult(
        activity=activity,
        confidence=0.95,
        danger_score=result['danger_score'],
        alert_level=result['alert_level'],
        action=result['action'],
        reasons=result['reasons'],
    )

@app.post("/predict/sensors", response_model=SafetyResult)
def predict_sensors(reading: SensorReading):
    """
    Full endpoint — takes raw sensor feature vector,
    classifies the activity, then scores the danger.
    """
    try:
        if len(reading.features) != len(feature_cols):
            raise HTTPException(
                status_code=400,
                detail=f"Expected {len(feature_cols)} features, got {len(reading.features)}"
            )

        X          = pd.DataFrame([reading.features], columns=feature_cols)
        pred_enc   = model.predict(X)[0]
        pred_proba = model.predict_proba(X)[0]
        activity   = label_encoder.inverse_transform([pred_enc])[0]
        confidence = float(pred_proba.max())

        result = calculate_danger_score(
            activity=activity,
            hour=reading.hour,
            duration_minutes=reading.duration_minutes,
            previous_activity=reading.previous_activity,
            activity_confidence=confidence,
        )

        return SafetyResult(
            activity=activity,
            confidence=round(confidence, 4),
            danger_score=result['danger_score'],
            alert_level=result['alert_level'],
            action=result['action'],
            reasons=result['reasons'],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")