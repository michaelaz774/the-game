// REAL CONTENT GOES HERE — replace freely. F1-themed AI trivia for the RBC AI Grand Prix.
// Agent 4 — Strategist: 10 race questions (~40% F1 trivia, ~60% AI/data-science in F1 metaphors),
// 6 pit questions (ultra-short, 4-second gut-checks). Export names are part of the shared contract.

import type { Question } from '../types'

// ─── RACE QUESTIONS (phase: 'race', ~10 questions) ───────────────────────────

export const raceQuestions: Question[] = [

  // ── F1 Trivia (~40%) ────────────────────────────────────────────────────────

  {
    id: 'race-01',
    phase: 'race',
    category: 'F1 History',
    text: 'Which driver holds the all-time record for the most Formula 1 World Championship titles?',
    options: ['Lewis Hamilton', 'Michael Schumacher'],
    correctIndex: 0,
    funFact: 'Hamilton clinched his 8th title in 2024 — one more than Schumacher\'s legendary seven. Both redefined what a dominant era looks like in F1.',
  },

  {
    id: 'race-02',
    phase: 'race',
    category: 'F1 Rules',
    text: 'What does DRS stand for — the rear-wing trick that lets a chasing car slingshot past on a straight?',
    options: ['Drag Reduction System', 'Dynamic Racing Stabiliser'],
    correctIndex: 0,
    funFact: 'Opening the DRS flap cuts aerodynamic drag by ~10–15%, adding up to 20 km/h. It only activates when the chasing car is within 1 second at a detection point — a deliberate design to help overtaking without making it trivial.',
  },

  {
    id: 'race-03',
    phase: 'race',
    category: 'Pit Strategy',
    text: 'A trained F1 pit crew can swap all four tires in roughly how long?',
    options: ['Under 3 seconds', 'Around 8 seconds'],
    correctIndex: 0,
    funFact: 'Red Bull set the outright record at 1.80 seconds in 2019. Three crew members per wheel — one undoes the nut, one pulls the old tire, one fits the new — all in perfectly choreographed parallel. Sound familiar? Parallel processing is also how AI inference engines stay fast.',
  },

  {
    id: 'race-04',
    phase: 'race',
    category: 'F1 Tech',
    text: 'Roughly how much sensor data does an F1 car stream back to its pit wall during a single race?',
    options: ['Around 100 GB', 'Around 1 MB'],
    correctIndex: 0,
    funFact: 'With 300+ sensors sampling up to 1,000 times per second — engine temps, tyre pressures, brake bias, G-forces — a race generates a serious data firehose. Processing that in real time is exactly the challenge enterprise AI teams tackle with streaming analytics pipelines.',
  },

  // ── AI / Data-Science Literacy in F1 metaphors (~60%) ───────────────────────

  {
    id: 'race-05',
    phase: 'race',
    category: 'AI & Machine Learning',
    text: 'F1 strategists model tyre degradation to predict the ideal pit window. What branch of AI does this technique most resemble?',
    options: ['Regression / predictive modelling', 'Computer vision / image recognition'],
    correctIndex: 0,
    funFact: 'Feed in compound type, track temperature, lap count, and driving style, and a regression model forecasts when lap times will fall off a cliff. Banks use the exact same approach to predict loan repayment probability or which customers are likely to churn.',
  },

  {
    id: 'race-06',
    phase: 'race',
    category: 'AI Myth-Busting',
    text: 'A large language model (like the one powering many AI assistants) truly "understands" your question the way a human does — true or false?',
    options: ['False — it predicts likely next tokens, not meanings', 'True — it builds a mental model just like a person'],
    correctIndex: 0,
    funFact: 'LLMs are extraordinarily capable pattern-completion engines, but they\'re not reasoning from first principles. Knowing this helps you treat AI as a high-performance tool — not an infallible oracle. Think of it as a turbo that amplifies your own thinking.',
  },

  {
    id: 'race-07',
    phase: 'race',
    category: 'Banking & AI',
    text: 'A bank\'s fraud-detection system scores each transaction in milliseconds. What makes that real-time speed achievable?',
    options: ['Streaming inference on a pre-trained model', 'Re-training a neural network live on every transaction'],
    correctIndex: 0,
    funFact: 'Training is expensive and done offline. The finished model is then deployed to a low-latency inference engine that scores transactions as they arrive — just like an F1 car\'s ECU reacting instantly to corner-entry data without stopping to re-simulate physics from scratch.',
  },

  {
    id: 'race-08',
    phase: 'race',
    category: 'Data Science',
    text: 'In ML, "overfitting" is a notorious pitfall. Which best describes it?',
    options: ['The model memorises training data and fails on new, unseen data', 'The model was trained on so little data it can\'t learn any pattern at all'],
    correctIndex: 0,
    funFact: 'Imagine an F1 driver who only ever practised one track — lightning-fast there, totally lost everywhere else. Overfit models are identical: brilliant on the training set, brittle in production. Techniques like cross-validation, dropout, and regularisation are the cure.',
  },

  {
    id: 'race-09',
    phase: 'race',
    category: 'Banking & AI',
    text: 'What does "personalisation at scale" actually mean when a bank\'s AI division does it?',
    options: ['Delivering individually tailored offers to millions of customers simultaneously', 'Printing each customer\'s name at the top of a marketing letter'],
    correctIndex: 0,
    funFact: 'ML models segment customers into thousands of micro-cohorts based on behaviour, life stage, and context — then serve each a relevant product nudge or alert in real time, all within privacy and compliance guardrails. It\'s the difference between a billboard and a conversation.',
  },

  {
    id: 'race-10',
    phase: 'race',
    category: 'MLOps',
    text: 'Why do enterprise AI teams monitor models in production long after they\'ve been deployed — a practice called "watching for model drift"?',
    options: ['Real-world data patterns shift over time, degrading accuracy if unchecked', 'The model gradually downloads new knowledge from the internet and needs oversight'],
    correctIndex: 0,
    funFact: 'Fraud patterns evolve, spending habits change with the economy, and yesterday\'s training data becomes stale. MLOps teams watch performance metrics continuously — like an F1 crew tracking tyre deg lap by lap — and trigger retraining before performance falls off a cliff.',
  },
]

// ─── PIT QUESTIONS (phase: 'pit', ~6 questions — ultra-short, 4-second gut-checks) ────

export const pitQuestions: Question[] = [

  {
    id: 'pit-01',
    phase: 'pit',
    category: 'Quick Fire',
    text: 'Fastest-ever F1 pit stop: under 2 seconds or under 5?',
    options: ['Under 2 seconds', 'Under 5 seconds'],
    correctIndex: 0,
  },

  {
    id: 'pit-02',
    phase: 'pit',
    category: 'Quick Fire',
    text: 'AI training vs. inference — which one runs live when you use an app?',
    options: ['Inference', 'Training'],
    correctIndex: 0,
  },

  {
    id: 'pit-03',
    phase: 'pit',
    category: 'Quick Fire',
    text: 'More data always makes an AI model better. True or false?',
    options: ['False — quality beats quantity', 'True — always'],
    correctIndex: 0,
    funFact: 'Garbage data in, garbage predictions out.',
  },

  {
    id: 'pit-04',
    phase: 'pit',
    category: 'Quick Fire',
    text: 'Modern F1 race strategy: gut feeling or real-time data models in the lead role?',
    options: ['Real-time data models', 'Gut feeling'],
    correctIndex: 0,
  },

  {
    id: 'pit-05',
    phase: 'pit',
    category: 'Quick Fire',
    text: 'Suspicious bank transaction: who acts first?',
    options: ['AI flags it, then a human reviews', 'A human reviews every transaction first'],
    correctIndex: 0,
  },

  {
    id: 'pit-06',
    phase: 'pit',
    category: 'Quick Fire',
    text: 'A base GPT-style AI: does it look facts up live, or generate from learned patterns?',
    options: ['Generates from learned patterns', 'Looks facts up live'],
    correctIndex: 0,
    funFact: 'No live lookup — it has a knowledge cut-off. Add retrieval (RAG) if you need current info.',
  },
]
