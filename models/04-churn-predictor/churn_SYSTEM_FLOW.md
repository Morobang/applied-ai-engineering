# Customer Churn Predictor — How the whole system works

## What this project does

A telecom company has thousands of customers. Every month some of them cancel their subscription — this is called **churn**. The problem is the company only finds out a customer is leaving when they actually cancel. By then it is too late to do anything.

This model solves that. It runs on every customer and predicts their churn probability **before** they cancel. Any customer above 70% gets flagged for a retention team to call with a special offer. The model also explains exactly **why** each customer is at risk using SHAP values.

---

## What is different about this project vs the fraud detector

| | Fraud Detector | Churn Predictor |
|---|---|---|
| Learning type | Unsupervised — never saw fraud labels | Supervised — learned from known outcomes |
| Main model | Isolation Forest + Logistic Regression | XGBoost |
| Output | Fraud probability | Churn probability + SHAP explanation |
| Demo input | Amount + time | Full customer profile |
| Key feature | Anomaly detection | Explainability |

---

## The full system flow

### Step 1 — User opens the project page

```
User visits: applied-ai-engineering.vercel.app/projects/churn-predictor
            ↓
They see the full educational page:
  - Why churn prediction matters
  - What the dataset contains
  - How XGBoost works
  - What SHAP values are
  - Model performance stats
  - Live demo at the bottom
```

### Step 2 — User fills in a customer profile

```
Unlike the fraud detector which only needed Amount and Time,
this demo takes a full customer profile:

  Tenure (months):        [ 8      ]
  Monthly Charges ($):    [ 89.50  ]
  Contract type:          [ Month-to-month ▼ ]
  Internet Service:       [ Fiber optic ▼ ]
  Tech Support:           [ No ▼ ]
  Senior Citizen:         [ No ▼ ]

User can also click "Generate random customer" to auto-fill.
```

### Step 3 — User clicks "Predict churn risk →"

```
Button click triggers in Next.js:

  fetch('https://churn-predictor.up.railway.app/predict', {
    method: 'POST',
    body: JSON.stringify({
      tenure: 8,
      MonthlyCharges: 89.50,
      Contract: 'Month-to-month',
      InternetService: 'Fiber optic',
      TechSupport: 'No',
      SeniorCitizen: 0,
      ... other features
    })
  })
```

### Step 4 — FastAPI receives and scores the customer

```
api.py receives the customer data
            ↓
Encodes categorical features using saved LabelEncoders
(same encoding used during training)
            ↓
Runs through XGBoost → churn probability: 0.87
            ↓
Runs SHAP explainer → top factors driving the prediction
            ↓
Returns JSON response
```

### Step 5 — FastAPI returns the result with explanation

```json
{
  "churn_probability": 0.87,
  "risk_level": "HIGH",
  "flagged": true,
  "top_reasons": [
    { "feature": "Contract", "impact": 0.563, "direction": "increases_churn" },
    { "feature": "tenure", "impact": 0.426, "direction": "increases_churn" },
    { "feature": "MonthlyCharges", "impact": 0.389, "direction": "increases_churn" },
    { "feature": "TechSupport", "impact": -0.276, "direction": "reduces_churn" }
  ],
  "model_version": "roc_auc=0.8413"
}
```

### Step 6 — Website shows the result

```
┌─────────────────────────────────────────────────────┐
│ Result                                   HIGH RISK   │
│                                                      │
│  87.0%              FLAGGED FOR RETENTION            │
│  Churn probability                                   │
│                                                      │
│  [████████████████████████░░░░] 87%                  │
│                                                      │
│  Why this customer is at risk:                       │
│                                                      │
│  ↑ Month-to-month contract    +56%  pushes churn up  │
│  ↑ Only 8 months tenure       +43%  pushes churn up  │
│  ↑ High monthly charges       +39%  pushes churn up  │
│  ↓ Has tech support           -28%  pushes churn down│
└─────────────────────────────────────────────────────┘
```

This SHAP breakdown is what makes this demo stand out. Not just a score — a full explanation.

---

## Why each tool exists

| Tool | Does what |
|------|-----------|
| `notebook.ipynb` | Trains XGBoost, generates SHAP values, saves `churn_model.pkl` |
| `churn_model.pkl` | Contains the trained model, SHAP explainer, and label encoders |
| `api.py` | Receives customer data, runs prediction, returns churn probability + SHAP reasons |
| Railway | Keeps the API live 24/7 with a public URL |
| `page.tsx` | The project page with educational content and live demo |
| Vercel | Hosts the Next.js site |

---

## What SHAP means in plain English

SHAP stands for SHapley Additive exPlanations. The name is complicated but the idea is simple.

Every prediction starts from a baseline — the average churn rate across all customers (about 26%). Then each feature either pushes the probability up or down from that baseline.

```
Start:  26% (average churn rate)

Contract = Month-to-month    → +34%  (very high risk signal)
tenure = 8 months            → +28%  (new customers churn more)
MonthlyCharges = $89.50      → +19%  (high charges = more likely to leave)
TechSupport = Yes            → -10%  (support reduces churn)
Has Partner = Yes            → -6%   (partners tend to stay)

Final prediction: 91%
```

This is exactly what a retention team needs. Instead of just "this customer will churn", they know "this customer will churn because of their contract type and high charges — so offer them a 20% discount on an annual contract."

---

## The one-line summary

> You trained XGBoost on 7,043 customers → saved it with SHAP explainer → FastAPI serves predictions with reasons → Vercel shows the full explanation to anyone who visits your portfolio.
