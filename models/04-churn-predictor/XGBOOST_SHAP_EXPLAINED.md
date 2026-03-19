# XGBoost and SHAP — What they are and why we use them

---

## XGBoost — What it is

XGBoost stands for Extreme Gradient Boosting. The name sounds complex but the idea is straightforward.

Imagine you are trying to predict if a customer will churn. You ask one person to make a guess. They are okay but not great. So you ask a second person to specifically focus on fixing the mistakes the first person made. Then a third person fixes the mistakes the second person made. And so on, 300 times.

By the end you have 300 people working together, each one specializing in the cases the previous ones got wrong. That combined group is far more accurate than any single person.

**That is exactly what XGBoost does — but each "person" is a decision tree.**

---

## What is a decision tree?

A decision tree asks a series of yes/no questions about a customer:

```
Is their contract month-to-month?
├── YES → Is their tenure less than 12 months?
│         ├── YES → Are monthly charges above $70?
│         │         ├── YES → Churn probability: 84%
│         │         └── NO  → Churn probability: 61%
│         └── NO  → Churn probability: 34%
└── NO  → Churn probability: 12%
```

One tree is simple and makes mistakes. XGBoost builds 300 trees where each one focuses on the mistakes of the previous one. The final prediction is a weighted combination of all 300 trees.

---

## Why XGBoost instead of Logistic Regression?

We used Logistic Regression in the fraud detector. Here we use XGBoost. Why?

Churn involves complex interactions between features. For example:

- A customer with high monthly charges alone might not churn
- A customer on a month-to-month contract alone might not churn
- But a customer with BOTH high charges AND a month-to-month contract AND low tenure? Very likely to churn

Logistic Regression struggles with these combinations. XGBoost captures them naturally through its tree structure. That is why it consistently outperforms simpler models on tabular business data like this.

---

## Real example — what XGBoost sees for one customer

```
Customer profile:
  tenure:          8 months
  Contract:        Month-to-month
  MonthlyCharges:  $89.50
  TechSupport:     No
  InternetService: Fiber optic
  SeniorCitizen:   No

XGBoost runs this through 300 trees.
Each tree votes: churn or no churn.
Weighted average of all votes: 87% churn probability.
```

---

## SHAP — What it is

SHAP answers one question: **why did the model make this specific prediction for this specific customer?**

Without SHAP you just get "87% churn probability." Useful, but not actionable.

With SHAP you get:

```
87% churn probability because:

  Month-to-month contract  → pushed probability UP by 34%
  Only 8 months tenure     → pushed probability UP by 28%
  High monthly charges     → pushed probability UP by 19%
  Has tech support         → pushed probability DOWN by 10%
  Has a partner            → pushed probability DOWN by 6%

Net result from 26% baseline: 87%
```

Now a retention team knows exactly what to do — offer this customer an annual contract discount, because that is the single biggest driver of their churn risk.

---

## Real example — what the user sees on your portfolio site

When someone uses the demo on your site and clicks "Predict churn risk →", they do not just get a number. They get a full breakdown:

```
┌─────────────────────────────────────────────────┐
│  Churn probability: 87%          HIGH RISK        │
│                                                   │
│  Why this customer is at risk:                    │
│                                                   │
│  ↑ Month-to-month contract   strongest signal     │
│  ↑ Low tenure (8 months)     new customers leave  │
│  ↑ High monthly charges      value perception     │
│  ↓ Has tech support          reduces risk slightly│
└─────────────────────────────────────────────────┘
```

This is what makes Project 04 stand out in interviews. You are not just showing a model that works — you are showing a model that explains itself. That is what real ML systems in production need to do.

---

## Why does explainability matter in interviews?

When you show this project to a hiring manager at Capitec or Discovery, they will ask: "how do you know the model is making decisions for the right reasons?"

With SHAP you can answer: "I can show you exactly which features drive each prediction and by how much. If the model was relying on something it should not — like customer ID or a data leak — SHAP would expose it."

That answer separates you from candidates who just trained a model and reported an accuracy score.

---

## The difference between global and local explanations

**Global (feature importance chart in Cell 11):**
Across all 1,409 test customers, which features mattered most overall?
Answer: tenure, Contract, MonthlyCharges, TotalCharges

**Local (SHAP waterfall in Cell 13):**
For this specific customer right now, which features drove their prediction?
Answer: their Contract pushed it up the most, their TechSupport pushed it down slightly

Both matter. Global tells you what the model learned. Local tells you why it made a specific decision.
