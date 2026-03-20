# System Flow — Spending Analyzer

## The full picture

```
YOUR LAPTOP
  notebook.ipynb
  → generates synthetic transaction data
  → trains TF-IDF + Random Forest pipeline
  → saves spending_model.pkl
  → git push to GitHub

GITHUB
  applied-ai-engineering/
  └── models/01-spending-analyzer/
      ├── spending_model.pkl   ← Railway uses this
      ├── api.py               ← Railway runs this
      └── requirements.txt     ← Railway installs these

RAILWAY                          VERCEL
  Runs api.py                    Hosts Next.js site
  Loads spending_model.pkl       User uploads CSV
  POST /analyze endpoint    ←→   Sends file to Railway
  Returns JSON results           Renders charts + table
```

---

## Request flow — step by step

```
1. User uploads CSV on the portfolio site
         ↓
2. Next.js sends POST /analyze with the file
         ↓
3. FastAPI on Railway receives the CSV
         ↓
4. Parses CSV into rows: date, description, amount
         ↓
5. Passes all descriptions through TF-IDF vectorizer
   (converts text to numbers)
         ↓
6. Random Forest classifies each description
   → returns category + confidence for each row
         ↓
7. Insights engine runs on categorized data
   → totals per category, monthly trend, top expenses
         ↓
8. FastAPI returns JSON with:
   - categorized_transactions (list)
   - insights (totals, percentages, trends)
         ↓
9. Next.js renders:
   - Pie chart (category breakdown)
   - Bar chart (monthly trend)
   - Transaction table with categories
   - Top 5 biggest expenses
```

---

## Why each tool exists

| Tool | Does what |
|------|-----------|
| `notebook.ipynb` | Trains and evaluates the model |
| `spending_model.pkl` | The trained pipeline — loaded once when the API starts |
| `api.py` | Receives CSV files, runs the model, returns results |
| Railway | Keeps the API running 24/7 with a public URL |
| Next.js | The portfolio site — handles file upload and renders charts |
| Vercel | Hosts the Next.js site with a public URL |

---

## The one-line summary

> User uploads a bank statement CSV → FastAPI classifies every transaction using NLP → returns a spending breakdown with charts showing exactly where the money went.
