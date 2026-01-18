import { Problem } from '../types';

/**
 * SuperMemo-2 (SM-2) Algorithm implementation.
 * @param quality 0-5 rating of recall quality
 * @param previousStats Current state of the problem
 * @returns New state (interval, repetitions, easiness factor)
 */
export const calculateNextReview = (
  quality: number,
  previousStats: { revisionCount: number; interval: number; easinessFactor: number }
) => {
  let { revisionCount, interval, easinessFactor } = previousStats;

  // If quality is less than 3, we treat it as a lapse (forgotten)
  // We reset repetitions and interval, but keep easiness (mostly)
  if (quality < 3) {
    return {
      revisionCount: 0,
      interval: 1, // Review tomorrow
      easinessFactor: Math.max(1.3, easinessFactor) // Keep EF but ensure min floor
    };
  }

  // Calculate new interval
  if (revisionCount === 0) {
    interval = 1;
  } else if (revisionCount === 1) {
    interval = 6;
  } else {
    interval = Math.round(interval * easinessFactor);
  }

  // Update Easiness Factor (EF)
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // q = quality
  const q = quality;
  let newEasiness = easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  
  // EF cannot go below 1.3
  if (newEasiness < 1.3) {
    newEasiness = 1.3;
  }

  return {
    revisionCount: revisionCount + 1,
    interval: interval,
    easinessFactor: newEasiness
  };
};

export const getNextReviewDate = (intervalDays: number): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today
  return now.getTime() + (intervalDays * 24 * 60 * 60 * 1000);
};
