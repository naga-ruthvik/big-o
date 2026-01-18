/**
 * Calculates the similarity between two strings using the Dice Coefficient.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (s1 === s2) return 1;
    if (s1.length < 2 || s2.length < 2) return 0;

    const bigrams1 = new Map<string, number>();
    for (let i = 0; i < s1.length - 1; i++) {
        const bigram = s1.substring(i, i + 2);
        bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1);
    }

    let intersection = 0;
    for (let i = 0; i < s2.length - 1; i++) {
        const bigram = s2.substring(i, i + 2);
        if (bigrams1.has(bigram) && bigrams1.get(bigram)! > 0) {
            intersection++;
            bigrams1.set(bigram, bigrams1.get(bigram)! - 1);
        }
    }

    const totalBigrams = (s1.length - 1) + (s2.length - 1);
    return (2 * intersection) / totalBigrams;
};

/**
 * Checks if the user guess is "close enough" (similarity > threshold).
 * Threshold defaults to 0.6 (60% match).
 */
export const isFuzzyMatch = (guess: string, target: string, threshold = 0.6): boolean => {
    // 1. Exact inclusion check (if user types "stack" and answer is "use a monotonic stack")
    const lowerGuess = guess.toLowerCase();
    const lowerTarget = target.toLowerCase();

    if ((lowerTarget.includes(lowerGuess) && lowerGuess.length > 3) || (lowerGuess.includes(lowerTarget) && lowerTarget.length > 3)) return true;

    // 2. Similarity Check
    const score = calculateSimilarity(guess, target);
    return score >= threshold;
};
