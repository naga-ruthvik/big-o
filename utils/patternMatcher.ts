import { Problem } from '../types';

/**
 * Calculates similarity score between two problems and returns top matches.
 * 
 * Algorithm:
 * 1. Pattern keyword match (highest weight)
 * 2. Topic match (medium weight)
 * 3. Difficulty match (low weight)
 * 4. Explicit 'relatedTo' link checking
 */
export const findSimilarProblems = (
    currentProblem: Problem,
    allProblems: Problem[],
    limit: number = 3
): Problem[] => {
    if (!currentProblem || !allProblems) return [];

    // Filter out the current problem itself
    const candidates = allProblems.filter(p => p.id !== currentProblem.id);

    const scoredCandidates = candidates.map(candidate => {
        let score = 0;

        // 1. Explicit Relationship (Highest Priority)
        if (currentProblem.relatedTo?.includes(candidate.title) || candidate.relatedTo?.includes(currentProblem.title)) {
            score += 100;
        }

        // 2. Pattern Keyword Overlap
        // We split pattern into words and check overlap
        const currentPatternWords = currentProblem.pattern.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const candidatePatternWords = candidate.pattern.toLowerCase().split(/\s+/).filter(w => w.length > 3);

        const overlap = currentPatternWords.filter(word =>
            candidatePatternWords.some(cw => cw.includes(word) || word.includes(cw))
        ).length;

        if (overlap > 0) {
            score += overlap * 20;
        }

        // 3. Topic Match
        if (currentProblem.topic === candidate.topic) {
            score += 10;
        }

        // 4. Difficulty Proximity
        // We prefer problems of similar or slightly higher difficulty for growth
        const difficultyMap: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        const currentDiff = difficultyMap[currentProblem.difficulty] || 2;
        const candidateDiff = difficultyMap[candidate.difficulty] || 2;

        if (currentDiff === candidateDiff) {
            score += 5;
        } else if (candidateDiff === currentDiff + 1) {
            score += 3; // N+1 Difficulty is good for flow
        }

        return { problem: candidate, score };
    });

    // Sort by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Return top N matches that have at least some relevance (score > 5)
    return scoredCandidates
        .filter(item => item.score > 5)
        .slice(0, limit)
        .map(item => item.problem);
};
