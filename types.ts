export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'Critical' | 'Fading' | 'Mastered';
// Mapped from: Critical (Red), Fading (Yellow), Mastered (Green)

export interface ReviewLog {
  date: number;
  quality: number; // 0-5
  timeTaken?: number; // seconds spent before rating
}

export interface AISettings {
  provider: 'gemini' | 'ollama';
  geminiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
}

export interface Problem {
  id: string;
  title: string;
  link: string;
  topic: string;
  pattern: string;
  difficulty: Difficulty;
  confidence: number; // 1 (Low) to 5 (High) - Used for UI mainly now

  // Spaced Repetition Metrics (SM-2)
  revisionCount: number;
  easinessFactor: number; // Default 2.5
  interval: number; // Days between reviews
  reviewHistory: ReviewLog[];

  // Polya Step 1: Constraints
  constraints: string; // e.g. "1 <= n <= 10^5"

  // Polya Step 2: The "Signal"
  trigger: string;

  // Polya Step 3: Intuition (Hidden)
  aha: string;
  sketchBase64?: string; // Hand-drawn logic (Mental Sandbox)
  imageUrl?: string; // External URL

  // Polya Step 4: Execution (Hidden)
  codeSnippet: string;
  mistake: string;

  // Semantic Linking
  relatedTo?: string; // "Like Two Sum but..."

  lastReviewed: number; // timestamp
  nextReviewDate: number; // timestamp calculated based on confidence
}

export interface StatSummary {
  total: number;
  critical: number;
  fading: number;
  mastered: number;
  dailyGoal: number;
  solvedToday: number;
  streakData: { date: string; count: number; healthScore: number; timestamp: number }[];
}

// Knowledge Graph Schema
export interface MentalModel {
  topic: string;
  frequency: number; // Aha! Heatmap score (calculated locally)
  summary: string;
  polya: {
    understand: string; // Constraints & Inputs
    plan: string; // Decision Strategy
    execute: string; // Implementation Skeleton
    reflect: string; // Optimization & Alternatives
  };
  edgeCases: {
    name: string; // e.g. "The Empty Input"
    rule: string; // "Return -1 immediately"
  }[];
  patternBridge: {
    relatedTopic: string;
    relationship: string; // "Subset of", "Prerequisite for"
    description: string;
  }[];
  complexity: {
    scenario: string;
    time: string;
    space: string;
  }[];
  mistakeAnalysis: {
    commonPitfall: string;
    correction: string; // "Do this instead"
    myPastError?: string; // Specific error from user history
  }[];
}

export const TOPICS = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D DP",
  "2-D DP",
  "Bit Manipulation",
  "Math & Geometry"
];
