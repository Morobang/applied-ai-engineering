import pickle
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import io
import os

# ── Load model artifacts ───────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "spending_model.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        artifacts = pickle.load(f)
    pipeline       = artifacts["pipeline"]
    categories     = artifacts["categories"]
    model_accuracy = artifacts["accuracy"]
    print(f"Model loaded. Accuracy: {model_accuracy} | Categories: {categories}")
except FileNotFoundError:
    raise RuntimeError("spending_model.pkl not found. Run notebook.ipynb first.")

# ── App ────────────────────────────────────────────────────────
app = FastAPI(
    title="Smart Spending Analyzer API",
    description="Categorizes bank transactions and surfaces spending insights — Applied AI Engineering",
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
    date: str
    description: str
    amount: float

class TransactionList(BaseModel):
    transactions: list[Transaction]

    class Config:
        json_schema_extra = {
            "example": {
                "transactions": [
                    {"date": "2024-03-01", "description": "CHECKERS FOURWAYS", "amount": 456.50},
                    {"date": "2024-03-02", "description": "UBER TRIP SANDTON", "amount": 89.00},
                    {"date": "2024-03-03", "description": "NETFLIX MONTHLY", "amount": 169.00},
                    {"date": "2024-03-05", "description": "MTN DATA BUNDLE", "amount": 149.00},
                ]
            }
        }

# ── Helpers ───────────────────────────────────────────────────
def classify_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Classify each transaction description into a spending category."""
    descriptions  = df["description"].tolist()
    predictions   = pipeline.predict(descriptions)
    probabilities = pipeline.predict_proba(descriptions)
    confidences   = probabilities.max(axis=1)

    df["category"]   = predictions
    df["confidence"] = confidences.round(4)
    return df

def generate_insights(df: pd.DataFrame) -> dict:
    """Generate spending insights from categorized transactions."""
    df_copy          = df.copy()
    df_copy["date"]  = pd.to_datetime(df_copy["date"])
    df_copy["month"] = df_copy["date"].dt.to_period("M").astype(str)

    total_spend = float(df_copy["amount"].sum())

    by_category = df_copy.groupby("category")["amount"].agg(["sum", "count", "mean"])
    by_category.columns = ["total", "count", "avg_transaction"]
    by_category = by_category.sort_values("total", ascending=False)
    by_category["percentage"] = (by_category["total"] / total_spend * 100).round(1)

    monthly = df_copy.groupby("month")["amount"].sum().reset_index()
    monthly.columns = ["month", "total_spend"]

    top5          = df_copy.nlargest(5, "amount")[["date", "description", "amount", "category"]]
    top5["date"]  = top5["date"].dt.strftime("%Y-%m-%d")
    top_merchants = df_copy["description"].value_counts().head(5).to_dict()

    return {
        "total_spend":        round(total_spend, 2),
        "total_transactions": len(df_copy),
        "avg_transaction":    round(float(df_copy["amount"].mean()), 2),
        "by_category":        by_category.round(2).to_dict("index"),
        "monthly_trend":      monthly.to_dict("records"),
        "top_transactions":   top5.to_dict("records"),
        "top_merchants":      top_merchants,
    }

# ── Routes ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service":        "Smart Spending Analyzer API",
        "status":         "online",
        "model_accuracy": model_accuracy,
        "categories":     categories,
        "docs":           "/docs",
    }

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True}

@app.get("/model/info")
def model_info():
    return {
        "model_type":  "TF-IDF + Random Forest Pipeline",
        "accuracy":    model_accuracy,
        "categories":  categories,
        "description": "Classifies bank transaction descriptions into spending categories using NLP",
    }

@app.get("/categories")
def get_categories():
    """Returns all supported spending categories."""
    return {"categories": categories}

@app.post("/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file with columns: date, description, amount
    Returns categorized transactions and spending insights.

    When a user uploads their bank statement on the portfolio site,
    this endpoint receives the file, classifies every transaction,
    and returns a full spending breakdown.
    """
    try:
        contents = await file.read()
        df       = pd.read_csv(io.BytesIO(contents))

        # Normalize column names — handle different bank CSV formats
        df.columns = df.columns.str.lower().str.strip()

        # Try to find the required columns
        col_map = {}
        for col in df.columns:
            if col in ["date", "posting date", "transaction date"]:
                col_map["date"] = col
            elif col in ["description", "original description", "merchant"]:
                col_map["description"] = col
            elif col in ["amount", "money out", "debit"]:
                col_map["amount"] = col

        if len(col_map) < 3:
            raise HTTPException(
                status_code=400,
                detail=f"CSV must have date, description, and amount columns. Found: {df.columns.tolist()}"
            )

        df = df.rename(columns={v: k for k, v in col_map.items()})
        df = df[["date", "description", "amount"]].dropna()
        df["amount"] = pd.to_numeric(df["amount"].astype(str).str.replace(",", ""), errors="coerce")
        df = df[df["amount"] > 0].reset_index(drop=True)

        if len(df) == 0:
            raise HTTPException(status_code=400, detail="No valid transactions found in CSV")

        df       = classify_transactions(df)
        insights = generate_insights(df)

        return {
            "status":                  "success",
            "transactions_processed":  len(df),
            "categorized_transactions": df.to_dict("records"),
            "insights":                insights,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze/json")
def analyze_json(data: TransactionList):
    """
    Alternative endpoint — accepts JSON instead of a CSV file.
    Used by the portfolio demo for quick testing without file upload.
    """
    try:
        df = pd.DataFrame([t.dict() for t in data.transactions])

        if len(df) == 0:
            raise HTTPException(status_code=400, detail="No transactions provided")

        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        df           = df[df["amount"] > 0].reset_index(drop=True)
        df           = classify_transactions(df)
        insights     = generate_insights(df)

        return {
            "status":                  "success",
            "transactions_processed":  len(df),
            "categorized_transactions": df.to_dict("records"),
            "insights":                insights,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")