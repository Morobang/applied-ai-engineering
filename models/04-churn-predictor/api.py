import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# ── Load model artifacts ───────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "churn_model.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        artifacts = pickle.load(f)
    model          = artifacts["model"]
    explainer      = artifacts["explainer"]
    encoders       = artifacts["encoders"]
    feature_cols   = artifacts["feature_cols"]
    model_roc_auc  = artifacts["roc_auc"]
    model_avg_prec = artifacts["avg_precision"]
    print(f"Model loaded. ROC-AUC: {model_roc_auc} | Avg Precision: {model_avg_prec}")
except FileNotFoundError:
    raise RuntimeError("churn_model.pkl not found. Run notebook.ipynb first.")

# ── App ────────────────────────────────────────────────────────
app = FastAPI(
    title="Customer Churn Prediction API",
    description="Predicts churn probability with SHAP explanations — Applied AI Engineering",
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
class Customer(BaseModel):
    gender: str = "Male"
    SeniorCitizen: int = 0
    Partner: str = "No"
    Dependents: str = "No"
    tenure: int = 12
    PhoneService: str = "Yes"
    MultipleLines: str = "No"
    InternetService: str = "Fiber optic"
    OnlineSecurity: str = "No"
    OnlineBackup: str = "No"
    DeviceProtection: str = "No"
    TechSupport: str = "No"
    StreamingTV: str = "No"
    StreamingMovies: str = "No"
    Contract: str = "Month-to-month"
    PaperlessBilling: str = "Yes"
    PaymentMethod: str = "Electronic check"
    MonthlyCharges: float = 70.0
    TotalCharges: float = 840.0

    class Config:
        json_schema_extra = {
            "example": {
                "gender": "Male",
                "SeniorCitizen": 0,
                "Partner": "No",
                "Dependents": "No",
                "tenure": 3,
                "PhoneService": "Yes",
                "MultipleLines": "No",
                "InternetService": "Fiber optic",
                "OnlineSecurity": "No",
                "OnlineBackup": "No",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "No",
                "StreamingMovies": "No",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Electronic check",
                "MonthlyCharges": 89.50,
                "TotalCharges": 268.50
            }
        }

class ChurnResult(BaseModel):
    churn_probability: float
    risk_level: str
    will_churn: bool
    top_factors: list
    model_version: str

# ── Helpers ───────────────────────────────────────────────────
def get_risk_level(prob: float) -> str:
    if prob >= 0.75:   return "HIGH"
    elif prob >= 0.45: return "MEDIUM"
    else:              return "LOW"

def encode_customer(customer: Customer) -> pd.DataFrame:
    data = {
        "gender":           customer.gender,
        "SeniorCitizen":    customer.SeniorCitizen,
        "Partner":          customer.Partner,
        "Dependents":       customer.Dependents,
        "tenure":           customer.tenure,
        "PhoneService":     customer.PhoneService,
        "MultipleLines":    customer.MultipleLines,
        "InternetService":  customer.InternetService,
        "OnlineSecurity":   customer.OnlineSecurity,
        "OnlineBackup":     customer.OnlineBackup,
        "DeviceProtection": customer.DeviceProtection,
        "TechSupport":      customer.TechSupport,
        "StreamingTV":      customer.StreamingTV,
        "StreamingMovies":  customer.StreamingMovies,
        "Contract":         customer.Contract,
        "PaperlessBilling": customer.PaperlessBilling,
        "PaymentMethod":    customer.PaymentMethod,
        "MonthlyCharges":   customer.MonthlyCharges,
        "TotalCharges":     customer.TotalCharges,
    }

    df = pd.DataFrame([data])

    for col, le in encoders.items():
        if col in df.columns:
            try:
                df[col] = le.transform(df[col])
            except ValueError:
                df[col] = 0

    df = df[feature_cols]
    return df

# ── Routes ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "Customer Churn Prediction API",
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
        "model_type": "XGBoost Classifier",
        "explainability": "SHAP TreeExplainer",
        "roc_auc": model_roc_auc,
        "avg_precision": model_avg_prec,
        "features": len(feature_cols),
        "training_data": "Kaggle Telco Customer Churn dataset",
        "churn_rate": "26.5%",
        "total_customers": 7043,
    }

@app.post("/predict", response_model=ChurnResult)
def predict(customer: Customer):
    """
    Predict churn probability for a customer.
    Returns probability, risk level, and SHAP explanations
    showing exactly WHY the model made this prediction.
    """
    try:
        X          = encode_customer(customer)
        churn_prob = float(model.predict_proba(X)[0][1])

        # SHAP values — explains this specific prediction
        shap_values = explainer.shap_values(X)
        shap_row    = shap_values[0] if isinstance(shap_values, list) else shap_values[0]

        # Build factors list sorted by absolute impact
        factors = []
        for i, col in enumerate(feature_cols):
            factors.append({
                "feature":    col,
                "value":      float(X[col].iloc[0]),
                "shap_value": round(float(shap_row[i]), 4),
                "direction":  "increases churn risk" if shap_row[i] > 0 else "decreases churn risk"
            })

        top_factors = sorted(factors, key=lambda x: abs(x["shap_value"]), reverse=True)[:5]

        return ChurnResult(
            churn_probability=round(churn_prob, 4),
            risk_level=get_risk_level(churn_prob),
            will_churn=churn_prob > 0.5,
            top_factors=top_factors,
            model_version=f"xgboost_roc_auc={model_roc_auc}",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")