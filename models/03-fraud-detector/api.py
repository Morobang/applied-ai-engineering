import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# ── Load model artifacts ───────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fraud_model.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        artifacts = pickle.load(f)
    iso_forest     = artifacts["iso_forest"]
    lr_model       = artifacts["lr_model"]
    score_scaler   = artifacts["score_scaler"]
    feature_cols   = artifacts["feature_cols"]
    model_roc_auc  = artifacts["roc_auc"]
    model_avg_prec = artifacts["avg_precision"]
    print(f"Model loaded. ROC-AUC: {model_roc_auc} | Avg Precision: {model_avg_prec}")
except FileNotFoundError:
    raise RuntimeError(
        "fraud_model.pkl not found. "
        "Run notebook.ipynb first to train and save the model."
    )

# ── App ────────────────────────────────────────────────────────
app = FastAPI(
    title="Fraud Detection API",
    description="Real-time transaction fraud scoring — Applied AI Engineering",
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
class Transaction(BaseModel):
    amount: float
    time: float

    class Config:
        json_schema_extra = {
            "example": {"amount": 124.50, "time": 43200}
        }

class PredictionResult(BaseModel):
    fraud_probability: float
    risk_level: str
    anomaly_score: float
    flagged: bool
    model_version: str

# ── Helpers ───────────────────────────────────────────────────
def get_risk_level(prob: float) -> str:
    if prob >= 0.85:   return "CRITICAL"
    elif prob >= 0.60: return "HIGH"
    elif prob >= 0.30: return "MEDIUM"
    else:              return "LOW"

def build_feature_vector(amount: float, time: float) -> np.ndarray:
    """
    Build the feature vector the model expects.
    V1-V28 are PCA components — we use zeros as neutral
    placeholders for the live demo. The Isolation Forest
    anomaly score still captures the amount/time signal.
    Training data mean/std used for scaling Amount and Time.
    """
    amount_scaled = (amount - 88.35)    / 250.12
    time_scaled   = (time   - 94813.86) / 47488.15
    v_features    = [0.0] * 28
    vector        = v_features + [amount_scaled, time_scaled]
    return np.array(vector).reshape(1, -1)

# ── Routes ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "Fraud Detection API",
        "status": "online",
        "model_roc_auc": model_roc_auc,
        "model_avg_precision": model_avg_prec,
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True}

@app.get("/model/info")
def model_info():
    return {
        "model_type": "Isolation Forest + Logistic Regression",
        "roc_auc": model_roc_auc,
        "avg_precision": model_avg_prec,
        "features": len(feature_cols),
        "training_data": "Kaggle Credit Card Fraud Detection dataset",
        "fraud_rate": "0.17%",
        "total_transactions": 284807,
    }

@app.post("/predict", response_model=PredictionResult)
def predict(transaction: Transaction):
    """
    Score a transaction for fraud risk.

    Returns fraud_probability (0–1), risk_level,
    anomaly_score, and a flagged boolean.
    """
    try:
        X = build_feature_vector(transaction.amount, transaction.time)

        # Step 1 — Isolation Forest anomaly score
        raw_score         = -iso_forest.score_samples(X)
        anomaly_score_norm = score_scaler.transform(raw_score.reshape(-1, 1)).flatten()

        # Step 2 — Logistic Regression fraud probability
        X_lr       = np.column_stack([X, anomaly_score_norm])
        fraud_prob = float(lr_model.predict_proba(X_lr)[0][1])
        anomaly    = float(anomaly_score_norm[0])

        return PredictionResult(
            fraud_probability=round(fraud_prob, 4),
            risk_level=get_risk_level(fraud_prob),
            anomaly_score=round(anomaly, 4),
            flagged=fraud_prob > 0.5,
            model_version=f"roc_auc={model_roc_auc}",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")