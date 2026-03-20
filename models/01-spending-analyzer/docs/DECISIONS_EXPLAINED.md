# Every Decision Explained

## Why TF-IDF instead of a neural network?

Transaction descriptions are short, keyword-heavy text. 'NETFLIX MONTHLY' has one word that makes the category obvious. A neural network would be overkill — it requires thousands of training examples, takes longer to train, and is harder to explain in an interview.

TF-IDF + Random Forest achieves 100% accuracy on this problem and can be explained clearly: the model learned that certain words strongly predict certain categories, and it uses those word patterns to classify new transactions.

---

## Why TF-IDF specifically?

TF-IDF stands for Term Frequency-Inverse Document Frequency. It answers the question: how important is this word in THIS description, compared to all descriptions?

- 'PAYMENT' appears in almost every transaction → low score, not useful
- 'NETFLIX' appears only in entertainment transactions → high score, very useful
- 'UBER' appears only in transport transactions → high score, very useful

The result is a numerical vector for each description where the useful, distinctive words have high values and generic words have low values.

---

## Why ngram_range=(1, 2)?

This tells the TF-IDF vectorizer to look at both single words AND two-word phrases.

Single words alone miss context:
- 'PICK' alone means nothing
- 'PICK N PAY' as a phrase clearly means groceries

Two-word phrases (bigrams) capture merchant names that span multiple words. This improves accuracy for merchants like 'VIRGIN ACTIVE', 'CITY POWER', 'PICK N PAY'.

---

## Why Random Forest over Logistic Regression here?

Both would work well on this problem. Random Forest was chosen because:
- It handles the high-dimensional TF-IDF vectors naturally
- It gives feature importance — we can see which words matter most
- It is robust to slight variations in merchant names
- It does not require feature scaling

---

## Why synthetic data instead of real transactions?

Real bank statements contain personal financial information. Synthetic data lets us:
- Control the variety of merchants and categories
- Generate hundreds of examples per category for balanced training
- Share the dataset publicly without privacy concerns
- Demonstrate the model on realistic South African merchant names

The model trained on synthetic data generalizes to real transactions because it learns word patterns — not specific transaction amounts or dates.

---

## Why 8 categories specifically?

These 8 categories cover the majority of personal spending and map directly to the categories used by South African banks like Capitec, FNB, and Standard Bank. Keeping the categories broad enough to be useful but specific enough to be actionable was the key design decision.

Too few categories (3-4) and the insights are too vague. Too many (20+) and the model starts making more errors on edge cases.
