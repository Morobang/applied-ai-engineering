# How the whole system works — full flow

This document explains the complete journey from "user opens the site" to "user sees a fraud score." Every tool, every step, and why each one exists.

---

## The full picture

```
┌─────────────────────────────────────────────────────────┐
│                     YOUR LAPTOP                          │
│                                                          │
│  notebook.ipynb  →  trains model  →  fraud_model.pkl    │
│                                                          │
│  git push  →  sends code to GitHub                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      GITHUB                              │
│                                                          │
│  applied-ai-engineering/                                 │
│  ├── frontend/          ← Vercel reads this              │
│  └── models/03-fraud-detector/  ← Railway reads this    │
└─────────────────────────────────────────────────────────┘
              ↓                        ↓
┌─────────────────────┐    ┌──────────────────────────┐
│       VERCEL         │    │         RAILWAY           │
│                      │    │                           │
│  Hosts your Next.js  │    │  Runs your FastAPI server │
│  portfolio website   │    │  + fraud_model.pkl        │
│                      │    │                           │
│  URL:                │    │  URL:                     │
│  applied-ai-         │    │  fraud-detector.          │
│  engineering.        │    │  up.railway.app           │
│  vercel.app          │    │                           │
└─────────────────────┘    └──────────────────────────┘
              ↑                        ↑
              └──────────┬─────────────┘
                         │
                    USER'S BROWSER
```

---

## Step by step — what happens when a user uses the demo

### Step 1 — User opens your portfolio

```
User types: applied-ai-engineering.vercel.app
            ↓
Vercel serves the Next.js homepage
            ↓
User sees: 10 project cards on the homepage
```

No Python involved yet. This is just HTML/CSS/JavaScript served by Vercel.

---

### Step 2 — User clicks on Fraud Detector

```
User clicks the "Fraud Detection System" project card
            ↓
Next.js loads: /projects/fraud-detector/page.tsx
            ↓
User sees the full project page:
  - The problem section
  - The dataset explanation
  - How the model works
  - Every decision explained (accordion)
  - Model performance stats
  - The live demo section at the bottom
```

Still no Python. All of this is static content rendered by Next.js on Vercel.

---

### Step 3 — User reads through the page

```
User reads about PCA and why V1-V28 are anonymous
User reads why we train Isolation Forest on legit only
User clicks the accordion items to understand each decision
User sees the ROC-AUC score of 0.9743
User scrolls down to the live demo section
```

This is the educational part of the project. The user understands what they are about to test.

---

### Step 4 — User enters a transaction

```
User sees two input fields:
  Transaction Amount (€): [ 2500.00 ]
  Time (seconds):         [ 43200   ]

User can also click "Generate random transaction"
which fills in a random amount and time automatically.
```

---

### Step 5 — User clicks "Analyze transaction →"

```
User clicks the button
            ↓
React state: setLoading(true)  ← button shows "Analyzing..."
            ↓
Next.js runs this code:

  fetch('https://fraud-detector.up.railway.app/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 2500.00, time: 43200 })
  })

This is an HTTP POST request leaving Vercel's servers
and travelling to Railway's servers.
```

---

### Step 6 — Railway receives the request

```
FastAPI on Railway receives: { "amount": 2500.00, "time": 43200 }
            ↓
Pydantic validates the data — checks that amount and time
are numbers, not strings or missing values
            ↓
api.py calls: build_feature_vector(2500.00, 43200)
            ↓
This creates a numpy array of 30 values:
  [0, 0, 0, ... 28 zeros ..., amount_scaled, time_scaled]
  (V1-V28 are zeros as neutral placeholders for the demo)
```

---

### Step 7 — The model scores the transaction

```
Step 7a — Isolation Forest
  iso_forest.score_samples(X)
            ↓
  Returns a negative number — more negative = more anomalous
  We flip the sign so higher = more suspicious
  We normalize to 0-1 range
  Result: anomaly_score = 0.108  (10.8% anomaly — moderately unusual)

Step 7b — Logistic Regression
  lr_model.predict_proba(X_combined)
            ↓
  Takes the anomaly score + all original features
  Outputs fraud probability: 1.0  (100% — this looks like fraud)
```

---

### Step 8 — FastAPI sends back the result

```
Railway sends this JSON back to Vercel:

{
  "fraud_probability": 1.0,
  "risk_level": "CRITICAL",
  "anomaly_score": 0.108,
  "flagged": true,
  "model_version": "roc_auc=0.9727"
}
```

---

### Step 9 — The website shows the result

```
Next.js receives the response
            ↓
React state: setResult(data), setLoading(false)
            ↓
The result box appears on screen:

  ┌─────────────────────────────────────────┐
  │ Result                    CRITICAL RISK  │
  │                                          │
  │  100.0%        10.8%        FLAGGED      │
  │  Fraud prob    Anomaly      Decision     │
  │                                          │
  │  [████████████████████████████] 100%     │
  │  0% ──── fraud probability ──── 100%     │
  └─────────────────────────────────────────┘
```

Total time from button click to result: under 1 second.

---

## Why each tool exists

| Tool | Lives where | Does what |
|------|-------------|-----------|
| `notebook.ipynb` | Your laptop | Trains the model, creates `fraud_model.pkl` |
| `fraud_model.pkl` | Railway server | The trained model — loaded once when the server starts |
| `api.py` | Railway server | Receives transactions, runs the model, returns results |
| Railway | Cloud server | Keeps the API running 24/7 with a public URL |
| `page.tsx` | Vercel | The project page the user reads and interacts with |
| `DemoRunner.tsx` | Vercel | The component that calls the Railway API |
| Vercel | Cloud server | Hosts the Next.js website with a public URL |
| GitHub | Cloud storage | Source of truth — Railway and Vercel both pull from here |

---

## The one-line summary

> You trained a model on your laptop → pushed it to GitHub → Railway runs it as an API → your Vercel website calls that API → users see live fraud predictions on your portfolio.
