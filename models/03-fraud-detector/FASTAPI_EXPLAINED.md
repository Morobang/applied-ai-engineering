# FastAPI — What it is and why we need it

## The problem without FastAPI

You trained a model in Python. It lives in `fraud_model.pkl` on your laptop.

Your portfolio website lives on Vercel — a completely different server, thousands of kilometres away.

These two cannot talk to each other directly. The website has no way to say "hey Python, score this transaction for me."

**FastAPI is the bridge that connects them.**

---

## Real example — what happens when a user uses the demo

Here is exactly what happens when someone visits your portfolio site and uses the Fraud Detector demo:

**Step 1 — User opens the project page**
```
User visits: applied-ai-engineering.vercel.app/projects/fraud-detector
They see the demo section with two input fields:
  - Transaction Amount (€)
  - Time (seconds from start)
```

**Step 2 — User fills in a transaction and clicks "Analyze transaction →"**
```
They type:
  Amount: 2500.00
  Time:   43200

They hit the button.
```

**Step 3 — Next.js sends a request to FastAPI**
```
The button click triggers this in DemoRunner.tsx:

  fetch('https://your-railway-url.up.railway.app/predict', {
    method: 'POST',
    body: JSON.stringify({ amount: 2500.00, time: 43200 })
  })

This is a POST request — the website is knocking on FastAPI's door
and handing it the transaction details.
```

**Step 4 — FastAPI receives the request and runs the model**
```
api.py receives: { "amount": 2500.00, "time": 43200 }

It does three things:
  1. Builds the feature vector the model expects
  2. Passes it through Isolation Forest → gets anomaly score
  3. Passes result through Logistic Regression → gets fraud probability
```

**Step 5 — FastAPI sends back the result**
```json
{
  "fraud_probability": 1.0,
  "risk_level": "CRITICAL",
  "anomaly_score": 0.108,
  "flagged": true,
  "model_version": "roc_auc=0.9727"
}
```

**Step 6 — The website shows the result to the user**
```
The demo section updates in real time:

  Fraud probability:  100%        ← shown in red
  Anomaly score:      10.8%
  Decision:           FLAGGED     ← shown in red
  Risk badge:         CRITICAL RISK

The probability bar animates to 100% in red.
```

The whole thing — from button click to result on screen — takes under a second.

---

## What is `localhost:8000/docs`?

When you ran `uvicorn api:app --reload` on your machine, you opened FastAPI locally. `localhost` means your own computer. `8000` is the port — think of it as a door number.

The `/docs` page is a free testing UI that FastAPI auto-generates. Instead of building the website first, you can test your API directly in the browser.

That is exactly what you did — you went to `/docs`, clicked `POST /predict`, pasted `{ "amount": 2500.00, "time": 43200 }`, hit Execute, and saw `CRITICAL RISK` come back. You were confirming the door works before connecting the website to it.

---

## Why FastAPI specifically?

- Fast — one of the fastest Python web frameworks available
- The `/docs` testing page is generated automatically — zero extra work
- Validates incoming data automatically — if someone sends `{ "amount": "hello" }` it rejects it before the model even sees it
- Industry standard for ML APIs — used by Uber, Netflix, Microsoft

---

## The four endpoints in our API

| Endpoint | What triggers it |
|----------|-----------------|
| `GET /` | Nobody — just confirms the service is online |
| `GET /health` | Railway uses this to check if the server is still alive |
| `GET /model/info` | The model performance section on the project page |
| `POST /predict` | User clicks "Analyze transaction →" on the demo |
