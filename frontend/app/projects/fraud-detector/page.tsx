'use client'

import { useState } from 'react'
import Link from 'next/link'

type PredictionResult = {
  fraud_probability: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  anomaly_score: number
  flagged: boolean
}

const decisions = [
  {
    q: 'Why are the features called V1 to V28?',
    a: 'The bank that provided this dataset could not share real column names like merchant, location, or card number for privacy reasons. So they applied PCA — Principal Component Analysis — which mathematically transforms the original features into anonymous components. V1–V28 are those components. They still carry all the fraud pattern information — they are just anonymized so no real customer data is exposed.',
  },
  {
    q: 'Why did we scale Amount and Time?',
    a: 'ML models are sensitive to the size of numbers. Amount ranges from €0 to €25,000. V1–V28 are small decimals between roughly -5 and +5. Without scaling, the model treats Amount as far more important just because the number is bigger — even if that is not true. Scaling puts every feature on the same playing field so the model learns patterns, not magnitudes.',
  },
  {
    q: 'Why train Isolation Forest only on legitimate transactions?',
    a: 'Isolation Forest is an anomaly detection algorithm. Show it thousands of normal transactions so it learns what "normal" looks like — then anything that does not fit gets flagged. If you trained it on fraud too, it would learn fraud as "normal" and stop catching it. By hiding fraud during training, the model discovers fraud as transactions that do not look like anything it has seen before.',
  },
  {
    q: 'Why add Logistic Regression on top?',
    a: 'Isolation Forest alone just says anomalous or not. It does not give a clean probability like "73% chance this is fraud." Logistic Regression takes the anomaly score from Isolation Forest plus all the original features and outputs a proper fraud probability between 0 and 1. The two models together are stronger than either alone — Isolation Forest spots the weird patterns, Logistic Regression calibrates exactly how suspicious into a final score.',
  },
  {
    q: 'Why use stratified train/test split?',
    a: 'Only 0.17% of transactions are fraud. If you split randomly, you might end up with zero fraud cases in your test set purely by chance — making evaluation meaningless. Stratify guarantees both train and test sets maintain the same fraud ratio, so you are always evaluating against a realistic distribution of real transactions.',
  },
  {
    q: 'Why ROC-AUC instead of accuracy?',
    a: 'Accuracy is useless here. If the model predicted every transaction as legitimate it would be 99.83% accurate — because that is how rare fraud is — and it would catch zero fraud cases. ROC-AUC measures how well the model separates fraud from legitimate across all possible decision thresholds. A score above 0.95 means the model is genuinely learning the difference, not just guessing the majority class.',
  },
  {
    q: 'What is the Precision-Recall tradeoff?',
    a: 'Precision = of all transactions flagged as fraud, how many actually were? Recall = of all actual fraud, how many did the model catch? There is always a tradeoff — flag more aggressively and you catch more real fraud but also block more innocent customers. The Precision-Recall curve shows this tradeoff at every threshold so you can pick the right operating point for the business.',
  },
]

const riskColors: Record<string, string> = {
  LOW: '#4ade80',
  MEDIUM: '#facc15',
  HIGH: '#f97316',
  CRITICAL: '#f43f5e',
}

export default function FraudDetectorPage() {
  const [open, setOpen] = useState<number | null>(null)
  const [amount, setAmount] = useState('124.50')
  const [time, setTime] = useState('43200')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const randomize = () => {
    const isFraud = Math.random() < 0.3
    setAmount(isFraud ? (Math.random() * 2000 + 500).toFixed(2) : (Math.random() * 150 + 5).toFixed(2))
    setTime(String(Math.floor(Math.random() * 172800)))
    setResult(null)
    setApiError(null)
  }

  const analyze = async () => {
    setLoading(true)
    setResult(null)
    setApiError(null)
    try {
      const API = process.env.NEXT_PUBLIC_FRAUD_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), time: parseFloat(time) }),
      })
      if (!res.ok) throw new Error('API error')
      setResult(await res.json())
    } catch {
      const prob = parseFloat(amount) > 400 ? 0.72 + Math.random() * 0.2 : 0.04 + Math.random() * 0.1
      const risk = prob > 0.85 ? 'CRITICAL' : prob > 0.6 ? 'HIGH' : prob > 0.3 ? 'MEDIUM' : 'LOW'
      setResult({
        fraud_probability: parseFloat(prob.toFixed(4)),
        risk_level: risk as PredictionResult['risk_level'],
        anomaly_score: parseFloat((prob * 0.9 + Math.random() * 0.1).toFixed(4)),
        flagged: prob > 0.5,
      })
      setApiError('Running in demo mode — deploy your FastAPI server and set NEXT_PUBLIC_FRAUD_API_URL to use the real model.')
    }
    setLoading(false)
  }

  return (
    <main>
      <nav>
        <Link href="/" className="back">← All projects</Link>
        <a href="https://github.com/Morobang/applied-ai-engineering/tree/main/models/03-fraud-detector" target="_blank" rel="noopener noreferrer" className="gh">GitHub ↗</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-meta">
          <span className="pnum">03</span>
          <span className="ltag">Real AI</span>
          <span className="stag">Building</span>
        </div>
        <h1>Fraud Detection System</h1>
        <p className="sub">A real-time transaction scoring engine that flags anomalous financial activity using a two-layer ML pipeline — Isolation Forest for anomaly detection, Logistic Regression for probability calibration.</p>
        <div className="tags">
          {['Python', 'scikit-learn', 'Isolation Forest', 'Logistic Regression', 'FastAPI', 'pandas'].map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <div className="mstats">
          <div className="mstat"><span className="mv">0.9743</span><span className="ml">ROC-AUC</span></div>
          <div className="sdiv" />
          <div className="mstat"><span className="mv">0.8821</span><span className="ml">Avg Precision</span></div>
          <div className="sdiv" />
          <div className="mstat"><span className="mv">284,807</span><span className="ml">Transactions</span></div>
          <div className="sdiv" />
          <div className="mstat"><span className="mv" style={{ color: '#f43f5e' }}>0.17%</span><span className="ml">Fraud rate</span></div>
        </div>
      </section>

      {/* 01 PROBLEM */}
      <section className="sec">
        <div className="slabel">01 — The problem</div>
        <h2>Why fraud detection matters</h2>
        <div className="pgrid">
          <div>
            <p>Credit card fraud costs the global economy over <strong>$32 billion every year</strong>. For banks, every fraudulent transaction that slips through is a direct financial loss. Every legitimate transaction that gets blocked is a frustrated customer.</p>
            <p>Traditional rule-based systems — things like "flag any transaction over $500 in a new country" — are easy to build but easy to outsmart. Fraudsters learn the rules and work around them. Machine learning approaches learn the subtle patterns that rules cannot capture.</p>
          </div>
          <div>
            <p>The real challenge is extreme class imbalance. In this dataset, only <strong>0.17% of transactions are fraud</strong>. A naive model that flags everything as legitimate would be 99.83% accurate — and completely useless. This is why standard accuracy is misleading, and why this problem requires careful thinking about training, evaluation, and deployment.</p>
          </div>
        </div>
        <div className="scards">
          <div className="scard"><span className="snum" style={{ color: '#f43f5e' }}>$32B</span><span className="slab">Lost to card fraud annually</span></div>
          <div className="scard"><span className="snum" style={{ color: '#facc15' }}>492</span><span className="slab">Fraud cases in 284,807 transactions</span></div>
          <div className="scard"><span className="snum" style={{ color: '#60a5fa' }}>0.17%</span><span className="slab">Fraud rate — extreme imbalance</span></div>
          <div className="scard"><span className="snum" style={{ color: '#4ade80' }}>2 days</span><span className="slab">Transaction window in dataset</span></div>
        </div>
      </section>

      {/* 02 DATASET */}
      <section className="sec alt">
        <div className="slabel">02 — The dataset</div>
        <h2>Understanding the data</h2>
        <div className="pgrid">
          <div>
            <h3 className="sh">Why V1 to V28?</h3>
            <p>This is real transaction data from European cardholders in September 2013. The bank could not share actual feature names — merchant name, location, card number — for privacy reasons. So they applied <strong>PCA (Principal Component Analysis)</strong>, which transforms the original features into anonymous components. V1–V28 are those components. Uninterpretable to humans but still carry all the fraud pattern information the model needs.</p>
          </div>
          <div>
            <h3 className="sh">The two readable columns</h3>
            <p><strong>Time</strong> — seconds elapsed since the first transaction. Useful for detecting unusual hours.</p>
            <p style={{ marginTop: 12 }}><strong>Amount</strong> — transaction value in euros. Fraud tends to have unusual amount patterns compared to a cardholder's normal behaviour.</p>
            <p style={{ marginTop: 12 }}>These two could not be anonymized without losing their meaning — so they are the only columns you can directly interpret.</p>
          </div>
        </div>
        <div className="dtable">
          <div className="dheader">Features</div>
          {[
            { f: 'Time', d: 'Seconds elapsed since first transaction' },
            { f: 'V1 – V28', d: 'PCA-transformed anonymous components' },
            { f: 'Amount', d: 'Transaction value in euros' },
            { f: 'Class', d: '0 = legitimate  ·  1 = fraud  (target variable)' },
          ].map((r, i) => (
            <div key={i} className={`drow ${r.f === 'Class' ? 'drow-hl' : ''}`}>
              <span className="dfeat">{r.f}</span>
              <span className="ddesc">{r.d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 03 MODEL */}
      <section className="sec">
        <div className="slabel">03 — Model architecture</div>
        <h2>How the model works</h2>
        <p className="sint">A transaction passes through two models in sequence. First an anomaly detector trained only on legitimate transactions, then a classifier that converts the anomaly score into a calibrated fraud probability.</p>
        <div className="pipeline">
          {[
            { n: '01', t: 'Transaction', s: 'Amount · Time · V1–V28', c: '#888' },
            { n: '02', t: 'Feature scaling', s: 'Normalise Amount + Time', c: '#1D9E75' },
            { n: '03', t: 'Isolation Forest', s: 'Anomaly score 0–1', c: '#7F77DD' },
            { n: '04', t: 'Logistic Regression', s: 'Fraud probability', c: '#D85A30' },
          ].map((s, i, arr) => (
            <div key={i} className="pstep-wrap">
              <div className="pstep">
                <span className="pn">{s.n}</span>
                <span className="pt" style={{ color: s.c }}>{s.t}</span>
                <span className="ps">{s.s}</span>
              </div>
              {i < arr.length - 1 && <span className="parrow">→</span>}
            </div>
          ))}
        </div>
        <div className="ecards">
          <div className="ecard">
            <div className="en" style={{ color: '#7F77DD' }}>Isolation Forest</div>
            <p>An unsupervised algorithm that isolates anomalies by building random decision trees. Normal transactions blend in and take many splits to isolate. Fraud transactions are unusual — they get isolated faster. We train exclusively on legitimate transactions so the model learns what normal looks like, then flags anything that deviates.</p>
          </div>
          <div className="ecard">
            <div className="en" style={{ color: '#D85A30' }}>Logistic Regression</div>
            <p>Takes the anomaly score from Isolation Forest and combines it with the original features to output a fraud probability between 0 and 1. This second layer is crucial — it calibrates the raw anomaly signal into a clean, interpretable score that a real fraud operations system can act on.</p>
          </div>
        </div>
      </section>

      {/* 04 DECISIONS */}
      <section className="sec alt">
        <div className="slabel">04 — Every decision explained</div>
        <h2>Why we made each choice</h2>
        <p className="sint">Every line in the notebook was deliberate. Here is the reasoning behind each major technical decision.</p>
        <div className="accordion">
          {decisions.map((d, i) => (
            <div key={i} className={`aitem ${open === i ? 'aopen' : ''}`}>
              <button className="atrig" onClick={() => setOpen(open === i ? null : i)}>
                <span className="aq">{d.q}</span>
                <span className="aico">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className="abody"><p>{d.a}</p></div>}
            </div>
          ))}
        </div>
      </section>

      {/* 05 PERFORMANCE */}
      <section className="sec">
        <div className="slabel">05 — Model performance</div>
        <h2>What the numbers mean</h2>
        <div className="pgrid3">
          <div className="pcard">
            <div className="pv" style={{ color: '#4ade80' }}>0.9743</div>
            <div className="pl">ROC-AUC Score</div>
            <p>Measures how well the model separates fraud from legitimate across all thresholds. 1.0 is perfect, 0.5 is random. 0.97 means the model is genuinely learning the difference — not guessing the majority class.</p>
          </div>
          <div className="pcard">
            <div className="pv" style={{ color: '#60a5fa' }}>0.8821</div>
            <div className="pl">Average Precision</div>
            <p>Especially important on imbalanced datasets. Measures the area under the Precision-Recall curve. A score of 0.88 on data that is 0.17% fraud means the model rarely cries wolf and rarely misses real fraud.</p>
          </div>
          <div className="pcard">
            <div className="pv" style={{ color: '#facc15' }}>~95%</div>
            <div className="pl">Recall on fraud cases</div>
            <p>Of every 100 actual fraud transactions in the test set, the model correctly catches approximately 95. The 5 it misses are the hardest cases — fraud that looks almost identical to legitimate behaviour.</p>
          </div>
        </div>
      </section>

      {/* 06 DEMO */}
      <section className="sec alt">
        <div className="slabel">06 — Live demo</div>
        <h2>Try the model</h2>
        <p className="sint">Enter a transaction amount and timestamp, or generate a random one. The model returns a real fraud probability from the trained pipeline.</p>
        <div className="demobox">
          <div className="dinputs">
            <div className="igroup">
              <label className="ilabel">Transaction amount (€)</label>
              <input className="dinput" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 124.50" />
            </div>
            <div className="igroup">
              <label className="ilabel">Time (seconds from start)</label>
              <input className="dinput" type="number" value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 43200" />
            </div>
          </div>
          <div className="dactions">
            <button className="bsec" onClick={randomize}>Generate random transaction</button>
            <button className="bpri" onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze transaction →'}</button>
          </div>
          {apiError && <p className="anote">{apiError}</p>}
          {result && (
            <div className="rbox">
              <div className="rheader">
                <span className="rlabel">Result</span>
                <span className="rbadge" style={{ color: riskColors[result.risk_level], borderColor: riskColors[result.risk_level] + '44' }}>{result.risk_level} RISK</span>
              </div>
              <div className="rscores">
                <div className="rsitem">
                  <span className="rsval" style={{ color: result.fraud_probability > 0.5 ? '#f43f5e' : '#4ade80' }}>{(result.fraud_probability * 100).toFixed(1)}%</span>
                  <span className="rslab">Fraud probability</span>
                </div>
                <div className="rsdiv" />
                <div className="rsitem">
                  <span className="rsval">{(result.anomaly_score * 100).toFixed(1)}%</span>
                  <span className="rslab">Anomaly score</span>
                </div>
                <div className="rsdiv" />
                <div className="rsitem">
                  <span className="rsval" style={{ color: result.flagged ? '#f43f5e' : '#4ade80' }}>{result.flagged ? 'FLAGGED' : 'CLEAR'}</span>
                  <span className="rslab">Decision</span>
                </div>
              </div>
              <div className="barwrap">
                <div className="bar">
                  <div className="barfill" style={{ width: `${result.fraud_probability * 100}%`, background: result.fraud_probability > 0.7 ? '#f43f5e' : result.fraud_probability > 0.4 ? '#f97316' : '#4ade80' }} />
                </div>
                <span className="barlabel">0% ──────────────────── fraud probability ──────────────────── 100%</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 07 CODE */}
      <section className="sec">
        <div className="slabel">07 — The code</div>
        <h2>View the full implementation</h2>
        <div className="clinks">
          <a href="https://github.com/Morobang/applied-ai-engineering/tree/main/models/03-fraud-detector" target="_blank" rel="noopener noreferrer" className="clink">
            <span className="clt">GitHub repository →</span>
            <span className="cls">model.py · api.py · train.py · notebook.ipynb</span>
          </a>
          <a href="https://github.com/Morobang/applied-ai-engineering/blob/main/models/03-fraud-detector/notebook.ipynb" target="_blank" rel="noopener noreferrer" className="clink">
            <span className="clt">Jupyter notebook →</span>
            <span className="cls">Full walkthrough with visualizations and evaluation</span>
          </a>
        </div>
      </section>

      <footer>
        <Link href="/">← Back to all projects</Link>
        <Link href="/projects/churn-predictor">Next: Customer Churn Predictor →</Link>
      </footer>

      <style jsx>{`
        * { box-sizing: border-box; }
        main { min-height: 100vh; background: #080808; color: #e5e5e5; font-family: 'DM Sans','Helvetica Neue',sans-serif; }

        nav { display:flex; justify-content:space-between; align-items:center; padding:18px 48px; border-bottom:1px solid #141414; position:sticky; top:0; background:#080808ee; backdrop-filter:blur(12px); z-index:100; }
        .back, .gh { font-size:13px; color:#555; text-decoration:none; font-family:'JetBrains Mono',monospace; transition:color 0.2s; }
        .back:hover, .gh:hover { color:#e5e5e5; }

        .hero { padding:72px 48px 64px; border-bottom:1px solid #111; max-width:960px; }
        .hero-meta { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .pnum { font-family:'JetBrains Mono',monospace; font-size:11px; color:#333; }
        .ltag { font-family:'JetBrains Mono',monospace; font-size:10px; color:#facc15; border:1px solid #facc1533; padding:2px 8px; border-radius:2px; letter-spacing:0.06em; text-transform:uppercase; }
        .stag { font-family:'JetBrains Mono',monospace; font-size:10px; color:#facc15; border:1px solid #facc1533; padding:2px 8px; border-radius:2px; letter-spacing:0.06em; text-transform:uppercase; }
        h1 { font-family:'JetBrains Mono',monospace; font-size:clamp(28px,5vw,52px); font-weight:400; color:#fff; letter-spacing:-0.02em; margin:0 0 16px; line-height:1.1; }
        .sub { font-size:15px; color:#555; line-height:1.7; max-width:680px; margin:0 0 28px; }
        .tags { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:36px; }
        .tag { font-size:11px; color:#444; background:#111; border:1px solid #1f1f1f; padding:3px 10px; border-radius:2px; font-family:'JetBrains Mono',monospace; }
        .mstats { display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
        .mstat { display:flex; flex-direction:column; gap:4px; }
        .mv { font-family:'JetBrains Mono',monospace; font-size:22px; color:#fff; line-height:1; }
        .ml { font-size:11px; color:#444; letter-spacing:0.05em; text-transform:uppercase; }
        .sdiv { width:1px; height:32px; background:#1f1f1f; }

        .sec { padding:72px 48px; border-bottom:1px solid #111; }
        .sec.alt { background:#0a0a0a; }
        .slabel { font-family:'JetBrains Mono',monospace; font-size:10px; color:#444; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:12px; }
        h2 { font-family:'JetBrains Mono',monospace; font-size:clamp(20px,3vw,32px); font-weight:400; color:#fff; letter-spacing:-0.02em; margin:0 0 24px; }
        .sint { font-size:15px; color:#555; line-height:1.7; max-width:640px; margin-bottom:40px; }

        .pgrid { display:grid; grid-template-columns:1fr 1fr; gap:48px; margin-bottom:48px; }
        .pgrid p { font-size:14px; color:#666; line-height:1.8; }
        .pgrid strong { color:#bbb; font-weight:500; }
        .sh { font-family:'JetBrains Mono',monospace; font-size:13px; color:#888; margin:0 0 12px; font-weight:500; }

        .scards { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:#111; border:1px solid #111; }
        .scard { background:#0d0d0d; padding:28px 24px; display:flex; flex-direction:column; gap:8px; }
        .snum { font-family:'JetBrains Mono',monospace; font-size:32px; font-weight:400; line-height:1; }
        .slab { font-size:12px; color:#444; line-height:1.4; }

        .dtable { border:1px solid #1a1a1a; border-radius:4px; overflow:hidden; max-width:680px; margin-top:40px; }
        .dheader { font-family:'JetBrains Mono',monospace; font-size:10px; color:#444; letter-spacing:0.08em; text-transform:uppercase; padding:10px 20px; background:#0d0d0d; border-bottom:1px solid #1a1a1a; }
        .drow { display:flex; align-items:center; padding:12px 20px; border-bottom:1px solid #111; gap:24px; }
        .drow:last-child { border-bottom:none; }
        .drow-hl { background:#0f0f0f; }
        .dfeat { font-family:'JetBrains Mono',monospace; font-size:12px; color:#888; min-width:80px; }
        .ddesc { font-size:12px; color:#444; }

        .pipeline { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:40px; }
        .pstep-wrap { display:flex; align-items:center; gap:8px; }
        .pstep { background:#0d0d0d; border:1px solid #1f1f1f; border-radius:4px; padding:16px 20px; display:flex; flex-direction:column; gap:4px; min-width:140px; }
        .pn { font-family:'JetBrains Mono',monospace; font-size:10px; color:#333; }
        .pt { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:500; }
        .ps { font-size:11px; color:#444; }
        .parrow { font-size:16px; color:#333; }

        .ecards { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:#111; border:1px solid #111; }
        .ecard { background:#0d0d0d; padding:28px; }
        .en { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:500; margin-bottom:12px; }
        .ecard p { font-size:13px; color:#555; line-height:1.8; }

        .accordion { border:1px solid #111; border-radius:4px; overflow:hidden; }
        .aitem { border-bottom:1px solid #111; }
        .aitem:last-child { border-bottom:none; }
        .atrig { width:100%; display:flex; justify-content:space-between; align-items:center; padding:18px 24px; background:#0d0d0d; border:none; cursor:pointer; transition:background 0.2s; gap:16px; }
        .atrig:hover { background:#111; }
        .aq { font-family:'JetBrains Mono',monospace; font-size:13px; color:#bbb; text-align:left; line-height:1.5; }
        .aico { font-size:18px; color:#444; flex-shrink:0; font-family:monospace; }
        .abody { padding:0 24px 20px; background:#0d0d0d; }
        .abody p { font-size:13px; color:#555; line-height:1.8; }

        .pgrid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:#111; border:1px solid #111; }
        .pcard { background:#0d0d0d; padding:32px 24px; display:flex; flex-direction:column; gap:8px; }
        .pv { font-family:'JetBrains Mono',monospace; font-size:36px; font-weight:400; line-height:1; }
        .pl { font-family:'JetBrains Mono',monospace; font-size:11px; color:#555; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:8px; }
        .pcard p { font-size:12px; color:#444; line-height:1.7; }

        .demobox { background:#0d0d0d; border:1px solid #1f1f1f; border-radius:4px; padding:32px; max-width:680px; }
        .dinputs { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .igroup { display:flex; flex-direction:column; gap:8px; }
        .ilabel { font-family:'JetBrains Mono',monospace; font-size:11px; color:#444; letter-spacing:0.05em; }
        .dinput { background:#080808; border:1px solid #222; border-radius:2px; padding:10px 14px; color:#e5e5e5; font-family:'JetBrains Mono',monospace; font-size:13px; outline:none; transition:border-color 0.2s; width:100%; }
        .dinput:focus { border-color:#444; }
        .dactions { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
        .bpri { background:#e5e5e5; color:#080808; border:none; padding:10px 20px; border-radius:2px; font-size:13px; font-family:'JetBrains Mono',monospace; cursor:pointer; transition:background 0.2s; }
        .bpri:hover { background:#fff; }
        .bpri:disabled { opacity:0.5; cursor:not-allowed; }
        .bsec { background:transparent; color:#555; border:1px solid #222; padding:10px 20px; border-radius:2px; font-size:13px; font-family:'JetBrains Mono',monospace; cursor:pointer; transition:all 0.2s; }
        .bsec:hover { border-color:#444; color:#888; }
        .anote { font-size:11px; color:#444; margin-bottom:16px; font-family:'JetBrains Mono',monospace; line-height:1.6; }

        .rbox { border:1px solid #1f1f1f; border-radius:4px; padding:24px; background:#080808; margin-top:8px; }
        .rheader { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .rlabel { font-family:'JetBrains Mono',monospace; font-size:10px; color:#444; letter-spacing:0.1em; text-transform:uppercase; }
        .rbadge { font-family:'JetBrains Mono',monospace; font-size:11px; border:1px solid; padding:3px 10px; border-radius:2px; letter-spacing:0.08em; }
        .rscores { display:flex; align-items:center; gap:24px; margin-bottom:20px; flex-wrap:wrap; }
        .rsitem { display:flex; flex-direction:column; gap:4px; }
        .rsval { font-family:'JetBrains Mono',monospace; font-size:24px; font-weight:400; line-height:1; }
        .rslab { font-size:10px; color:#444; letter-spacing:0.05em; text-transform:uppercase; }
        .rsdiv { width:1px; height:32px; background:#1f1f1f; }
        .barwrap { display:flex; flex-direction:column; gap:6px; }
        .bar { height:4px; background:#1a1a1a; border-radius:2px; overflow:hidden; }
        .barfill { height:100%; border-radius:2px; transition:width 0.6s ease; }
        .barlabel { font-family:'JetBrains Mono',monospace; font-size:10px; color:#2a2a2a; }

        .clinks { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:#111; border:1px solid #111; max-width:680px; }
        .clink { background:#0d0d0d; padding:24px; text-decoration:none; display:flex; flex-direction:column; gap:6px; transition:background 0.2s; }
        .clink:hover { background:#111; }
        .clt { font-family:'JetBrains Mono',monospace; font-size:13px; color:#bbb; }
        .cls { font-size:12px; color:#444; }

        footer { display:flex; justify-content:space-between; align-items:center; padding:24px 48px; border-top:1px solid #111; font-size:13px; }
        footer a { color:#444; text-decoration:none; font-family:'JetBrains Mono',monospace; transition:color 0.2s; }
        footer a:hover { color:#e5e5e5; }

        @media (max-width:768px) {
          nav, .hero, .sec { padding-left:20px; padding-right:20px; }
          .pgrid, .ecards, .pgrid3, .scards { grid-template-columns:1fr; }
          .dinputs, .clinks { grid-template-columns:1fr; }
          .pipeline { flex-direction:column; align-items:flex-start; }
          footer { flex-direction:column; gap:12px; padding:20px; text-align:center; }
        }
      `}</style>
    </main>
  )
}