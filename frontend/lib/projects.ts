export type Project = {
  slug: string
  number: string
  title: string
  description: string
  longDescription: string
  tags: string[]
  level: 'Foundations' | 'Real AI' | 'Computer Vision' | 'Systems' | 'Advanced'
  status: 'live' | 'building' | 'planned'
  demoType: 'upload' | 'webcam' | 'simulate' | 'text'
  apiUrl?: string
}

export const projects: Project[] = [
  {
    slug: 'spending-analyzer',
    number: '01',
    title: 'Smart Spending Analyzer',
    description: 'Automatically categorizes bank transactions and surfaces spending patterns.',
    longDescription: 'Upload a CSV of bank transactions and the model classifies each entry — food, transport, entertainment — then visualizes your spending breakdown.',
    tags: ['Python', 'pandas', 'scikit-learn', 'FastAPI'],
    level: 'Foundations',
    status: 'planned',
    demoType: 'upload',
  },
  {
    slug: 'cv-skill-extractor',
    number: '02',
    title: 'CV Skill Extractor',
    description: 'NLP pipeline that extracts and scores skills from any CV or job description.',
    longDescription: 'Upload a PDF CV and get a structured breakdown of detected skills, match score against a job description, and missing skill gaps.',
    tags: ['spaCy', 'NLP', 'Python', 'FastAPI'],
    level: 'Foundations',
    status: 'planned',
    demoType: 'upload',
  },
  {
    slug: 'fraud-detector',
    number: '03',
    title: 'Fraud Detection System',
    description: 'Real-time transaction scoring engine that flags anomalous financial activity.',
    longDescription: 'Simulates a bank transaction feed and runs each entry through an isolation forest model, returning a risk score and fraud probability in milliseconds.',
    tags: ['scikit-learn', 'Isolation Forest', 'FastAPI', 'Python'],
    level: 'Real AI',
    status: 'building',
    demoType: 'simulate',
  },
  {
    slug: 'churn-predictor',
    number: '04',
    title: 'Customer Churn Predictor',
    description: 'Predicts the probability a customer will churn based on behavioral signals.',
    longDescription: 'Feed in customer data and get a churn probability score with the top contributing features — built on XGBoost with SHAP explanations.',
    tags: ['XGBoost', 'SHAP', 'Python', 'FastAPI'],
    level: 'Real AI',
    status: 'planned',
    demoType: 'text',
  },
  {
    slug: 'drowsiness-detection',
    number: '05',
    title: 'Drowsiness Detection',
    description: 'Detects driver fatigue in real-time using eye aspect ratio and blink frequency.',
    longDescription: 'Uses MediaPipe FaceMesh running entirely in the browser to monitor eye openness and trigger alerts when drowsiness thresholds are crossed.',
    tags: ['MediaPipe', 'OpenCV', 'Computer Vision', 'JavaScript'],
    level: 'Computer Vision',
    status: 'planned',
    demoType: 'webcam',
  },
  {
    slug: 'driver-behavior',
    number: '06',
    title: 'Driver Behavior Monitor',
    description: 'Multi-signal risk scoring system tracking head pose, phone use, and distraction.',
    longDescription: 'Goes beyond drowsiness to build a composite risk score from head tilt, phone detection, and gaze direction — updated in real-time via webcam.',
    tags: ['MediaPipe', 'OpenCV', 'Python', 'Risk Scoring'],
    level: 'Computer Vision',
    status: 'planned',
    demoType: 'webcam',
  },
  {
    slug: 'safety-alert',
    number: '07',
    title: 'Personal Safety AI',
    description: 'Detects danger situations from motion, inactivity, and behavioral pattern shifts.',
    longDescription: 'Monitors device motion and usage patterns to infer distress situations, triggering configurable silent alerts to trusted contacts.',
    tags: ['Sensor Fusion', 'Python', 'FastAPI', 'Event Detection'],
    level: 'Systems',
    status: 'planned',
    demoType: 'simulate',
  },
  {
    slug: 'exam-proctor',
    number: '08',
    title: 'AI Exam Proctoring',
    description: 'Behavior analysis system that detects cheating patterns during online exams.',
    longDescription: 'Tracks eye direction, multiple face detection, and suspicious head movement to build a suspicion score throughout an exam session.',
    tags: ['MediaPipe', 'Computer Vision', 'Behavior Analysis', 'Python'],
    level: 'Systems',
    status: 'planned',
    demoType: 'webcam',
  },
  {
    slug: 'face-auth',
    number: '09',
    title: 'Adaptive Face Auth',
    description: 'Fixes real-world facial recognition failures with guidance and liveness detection.',
    longDescription: 'Detects poor lighting, bad angles, and spoofing attempts — then guides the user to correct conditions before attempting authentication.',
    tags: ['Face Recognition', 'Liveness Detection', 'Deep Learning', 'Python'],
    level: 'Advanced',
    status: 'planned',
    demoType: 'webcam',
  },
  {
    slug: 'fraud-dashboard',
    number: '10',
    title: 'Fraud Intelligence Dashboard',
    description: 'Full-stack fraud detection platform with live transaction feed and risk engine.',
    longDescription: 'Capstone project. A real-time dashboard simulating a bank\'s fraud operations center — live transactions, ML scoring, geo anomaly detection, and alert management.',
    tags: ['Full Stack', 'ML Pipeline', 'Real-time', 'Dashboard'],
    level: 'Advanced',
    status: 'planned',
    demoType: 'simulate',
  },
]

export const levelColors: Record<Project['level'], string> = {
  'Foundations': '#4ade80',
  'Real AI': '#facc15',
  'Computer Vision': '#60a5fa',
  'Systems': '#f97316',
  'Advanced': '#f43f5e',
}