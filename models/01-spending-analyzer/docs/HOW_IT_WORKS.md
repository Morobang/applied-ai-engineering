# How the Spending Analyzer Works

## The problem

Most people have no idea where their money actually goes. They know their salary comes in and their balance goes down — but the breakdown is invisible unless you manually go through every single transaction and add it up yourself.

This system reads a bank statement CSV, classifies every transaction automatically, and gives you a clear picture of your spending.

---

## Real example — what happens when a user uploads a CSV

**Step 1 — User visits the project page**
```
User opens: applied-ai-engineering.vercel.app/projects/spending-analyzer
They see the demo section with a file upload area
```

**Step 2 — User uploads their bank statement CSV**
```
They drag and drop a CSV file with columns:
  date        | description              | amount
  2024-03-01  | CHECKERS FOURWAYS MALL   | 456.50
  2024-03-02  | UBER TRIP SANDTON        | 89.00
  2024-03-03  | NETFLIX MONTHLY SUB      | 169.00
  2024-03-05  | MTN DATA BUNDLE          | 149.00
```

**Step 3 — Next.js sends the file to FastAPI**
```
The upload triggers a POST request to:
  https://spending-analyzer.up.railway.app/analyze

The CSV file is sent as multipart form data.
```

**Step 4 — FastAPI processes the file**
```
api.py receives the CSV and does three things:
  1. Parses each row into date, description, amount
  2. Passes every description through the ML pipeline
  3. Runs the insights engine on the categorized data
```

**Step 5 — The model classifies each transaction**
```
'CHECKERS FOURWAYS MALL'  → Food & Groceries  (98% confidence)
'UBER TRIP SANDTON'       → Transport         (99% confidence)
'NETFLIX MONTHLY SUB'     → Entertainment     (100% confidence)
'MTN DATA BUNDLE'         → Utilities         (97% confidence)
```

**Step 6 — The insights engine summarizes everything**
```json
{
  "total_spend": 8432.50,
  "total_transactions": 20,
  "by_category": {
    "Food & Groceries": { "total": 1876.00, "percentage": 22.2 },
    "Transport":        { "total": 1205.00, "percentage": 14.3 },
    "Entertainment":    { "total": 497.00,  "percentage": 5.9  }
  },
  "top_transactions": [...],
  "monthly_trend": [...]
}
```

**Step 7 — The website renders the results**
```
User sees:
  - A pie chart of spending by category
  - A bar chart of monthly spending trend
  - A table of categorized transactions
  - Their top 5 biggest expenses
  - Their most visited merchants
```

The whole thing — upload to results — takes under 2 seconds.

---

## Why NLP for categorization?

Transaction descriptions are raw text — 'CHECKERS FOURWAYS', 'UBER* TRIP', 'NETFLIX.COM'. A traditional rule-based system would need a manually maintained list of every possible merchant name. That list would never be complete and would break every time a new merchant appears.

A text classifier learns the patterns automatically. It figures out that anything containing 'UBER', 'BOLT', or 'PETROL' belongs to Transport — without being explicitly told. It generalizes to new merchants it has never seen before.

---

## The 8 spending categories

| Category | Example transactions |
|----------|---------------------|
| Food & Groceries | Checkers, Woolworths Food, KFC, Uber Eats |
| Transport | Uber, Bolt, Engen Petrol, Gautrain |
| Entertainment | Netflix, Showmax, DSTV, Spotify, Cinema |
| Shopping | Takealot, Zara, Mr Price, Apple Store |
| Utilities | Eskom, MTN airtime, Vodacom, Fibre internet |
| Health | Clicks Pharmacy, Dischem, Gym, Doctor |
| Education | UNISA fees, Udemy, Books, School fees |
| Transfers | Payments to people, savings transfers |
