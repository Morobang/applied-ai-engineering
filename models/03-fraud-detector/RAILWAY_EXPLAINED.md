# Railway — What it is and why we need it

## The problem without Railway

Right now your FastAPI server only runs when:
1. Your laptop is on
2. You have run `uvicorn api:app --reload` in your terminal

The moment you close that terminal — the API is gone. Nobody can reach it.

So if a recruiter opens your portfolio site at 9pm and clicks "Analyze transaction →" on the fraud detector demo, they get nothing. The button just fails silently because your laptop is off.

**Railway keeps your API running 24/7 on a real server in the cloud.**

---

## Real example — what Railway actually does

**Before Railway:**
```
Recruiter visits your site
Clicks "Analyze transaction →"
Next.js tries to call: http://localhost:8000/predict
                                    ↑
                              This is YOUR laptop.
                              Recruiter cannot reach your laptop.
                              Demo fails.
```

**After Railway:**
```
Recruiter visits your site
Clicks "Analyze transaction →"
Next.js calls: https://fraud-detector.up.railway.app/predict
                                    ↑
                              This is Railway's server.
                              Always on. Always reachable.
                              Demo works perfectly.
```

---

## What Railway does step by step

```
1. You push your code to GitHub
         ↓
2. Railway detects the new commit automatically
         ↓
3. Railway reads your requirements.txt
   and installs all Python packages on their server
         ↓
4. Railway runs: uvicorn api:app --host 0.0.0.0 --port $PORT
         ↓
5. Your API is live at a public URL — forever
         ↓
6. Every time you push a change to GitHub
   Railway automatically redeploys — no manual steps
```

---

## Why the first deployment failed

Railway looked at the ROOT of your repo and saw this:

```
applied-ai-engineering/
├── frontend/       ← Next.js app
├── models/         ← Python models
├── shared/         ← utilities
└── README.md
```

It got confused — it could not figure out what to run because there is no `api.py` or `requirements.txt` at the root level. Those files are inside `models/03-fraud-detector/`.

**The fix:** In Railway settings, set Root Directory to `models/03-fraud-detector`

Now Railway only looks inside that folder and finds exactly what it needs — `api.py`, `requirements.txt`, and `Procfile`.

---

## How to fix it — exact steps

1. Go to your Railway project dashboard
2. Click on your service
3. Click **Settings**
4. Find **Root Directory** → type: `models/03-fraud-detector`
5. Find **Custom Start Command** → type: `uvicorn api:app --host 0.0.0.0 --port $PORT`
6. Click **Deploy**

Wait 2-3 minutes. Railway will install your packages and start the server.

---

## After deployment — testing it works

Railway gives you a URL like:
```
https://applied-ai-engineering-production.up.railway.app
```

Open it in your browser. You should see:
```json
{
  "service": "Fraud Detection API",
  "status": "online",
  "model_roc_auc": 0.9727
}
```

Then test a prediction directly:
```
https://your-url.up.railway.app/docs
```

Same as `localhost:8000/docs` but now it is live on the internet.

---

## Connecting it to your Vercel site

Once you have the Railway URL, go to your Vercel project:

**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add:
```
Name:  NEXT_PUBLIC_FRAUD_API_URL
Value: https://your-railway-url.up.railway.app
```

Redeploy on Vercel. Now when a user clicks "Analyze transaction →" on your portfolio, the request goes to Railway, your real model scores it, and the result appears on screen.

---

## Free tier

Railway's free tier gives you $5 of compute credit per month. A lightweight FastAPI server uses roughly $0.50-1.00 per month — well within the free limit for a portfolio project.

The server sleeps after 30 minutes of inactivity to save resources. When someone hits it again, it wakes up in about 5 seconds. For a portfolio demo this is completely fine.
