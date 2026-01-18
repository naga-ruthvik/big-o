import React, { useState, useMemo } from 'react';
import { Problem } from '../types';
import { calculateNextReview, getNextReviewDate } from '../utils/sm2';
import { BrainCircuit, Check, X, Zap, ArrowRight, RotateCcw } from 'lucide-react';

interface PatternQuizProps {
    problems: Problem[];
    onComplete: (results: { correct: number, total: number }) => void;
    onUpdateProblem: (problem: Problem) => void;
}

const PatternQuiz: React.FC<PatternQuizProps> = ({ problems, onComplete, onUpdateProblem }) => {
    // Select 10 random problems for the quiz
    const quizProblems = useMemo(() => {
        const shuffled = [...problems].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 10);
    }, [problems]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [score, setScore] = useState(0);
    const [userChoice, setUserChoice] = useState<string | null>(null);

    // Generate 3 distractors for the current problem
    const options = useMemo(() => {
        const current = quizProblems[currentIndex];
        if (!current) return [];

        const otherPatterns = problems
            .filter(p => p.pattern !== current.pattern && p.id !== current.id)
            .map(p => p.pattern);

        // precise unique patterns
        const uniquePatterns = Array.from(new Set(otherPatterns));
        const distractors = uniquePatterns.sort(() => 0.5 - Math.random()).slice(0, 3);

        return [current.pattern, ...distractors].sort(() => 0.5 - Math.random());
    }, [currentIndex, problems, quizProblems]);

    const handleAnswer = (selectedPattern: string) => {
        if (isRevealed) return;

        setUserChoice(selectedPattern);
        setIsRevealed(true);

        const currentProblem = quizProblems[currentIndex];
        const isCorrect = selectedPattern === currentProblem.pattern;

        if (isCorrect) {
            setScore(prev => prev + 1);
            // Treat as a "Good" (4) review
            handleUpdateProblem(currentProblem, 4);
        } else {
            // Treat as a "Hard" (3) review if missed, or "Again" (1) if totally wrong?
            // Conservative: Treat as Hard to trigger sooner review
            handleUpdateProblem(currentProblem, 3);
        }
    };

    const handleUpdateProblem = (problem: Problem, quality: number) => {
        const sm2Input = {
            revisionCount: problem.revisionCount || 0,
            interval: problem.interval || 0,
            easinessFactor: problem.easinessFactor || 2.5
        };
        const newStats = calculateNextReview(quality, sm2Input);

        const updatedProblem = {
            ...problem,
            ...newStats,
            lastReviewed: Date.now(),
            nextReviewDate: getNextReviewDate(newStats.interval),
            reviewHistory: [
                ...(problem.reviewHistory || []),
                { date: Date.now(), quality, timeTaken: 5 } // Approx time for quiz
            ]
        };
        onUpdateProblem(updatedProblem);
    };

    const nextQuestion = () => {
        if (currentIndex < quizProblems.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsRevealed(false);
            setUserChoice(null);
        } else {
            onComplete({ correct: score + (userChoice === quizProblems[currentIndex].pattern ? 0 : 0), total: quizProblems.length });
        }
    };

    if (!quizProblems.length) return <div className="text-white">No problems available for quiz.</div>;

    const currentProblem = quizProblems[currentIndex];
    const progress = ((currentIndex) / quizProblems.length) * 100;

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Zap className="text-accent-amber" /> Pattern Recognition Blitz
                </h2>
                <div className="text-gray-400 font-mono text-sm">
                    {currentIndex + 1} / {quizProblems.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-navy-800 h-2 rounded-full mb-8 overflow-hidden">
                <div className="bg-accent-purple h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Card */}
            <div className="bg-navy-800 rounded-xl border border-navy-700 p-8 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col">

                {/* Trigger / Signal */}
                <div className="flex-grow">
                    <div className="text-xs font-bold text-accent-blue uppercase tracking-widest mb-4 flex items-center gap-2">
                        <BrainCircuit size={16} /> Signal Detected
                    </div>
                    <h3 className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-8">
                        "{currentProblem.trigger}"
                    </h3>

                    {/* Visual Hint (Optional) */}
                    {isRevealed && (currentProblem.imageUrl || currentProblem.sketchBase64) && (
                        <div className="mb-6 rounded-lg overflow-hidden max-h-[150px] border border-navy-700 inline-block">
                            <img src={currentProblem.sketchBase64 || currentProblem.imageUrl} className="h-full object-contain" alt="Hint" />
                        </div>
                    )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {options.map((option, idx) => {
                        const isSelected = userChoice === option;
                        const isCorrectOption = option === currentProblem.pattern;

                        let btnClass = "bg-navy-900 border-navy-700 hover:border-accent-purple text-gray-300";
                        if (isRevealed) {
                            if (isCorrectOption) btnClass = "bg-emerald-900/50 border-accent-emerald text-white font-bold ring-2 ring-emerald-500/20";
                            else if (isSelected && !isCorrectOption) btnClass = "bg-red-900/50 border-accent-coral text-white opacity-50";
                            else btnClass = "bg-navy-900 border-navy-700 opacity-30";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                disabled={isRevealed}
                                className={`p-4 rounded-lg border text-left transition-all duration-200 flex items-center justify-between ${btnClass}`}
                            >
                                <span>{option}</span>
                                {isRevealed && isCorrectOption && <Check size={16} className="text-accent-emerald" />}
                                {isRevealed && isSelected && !isCorrectOption && <X size={16} className="text-accent-coral" />}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                {isRevealed && (
                    <div className="mt-6 flex justify-end animate-in fade-in slide-in-from-bottom-2">
                        <button
                            onClick={nextQuestion}
                            className="bg-white text-navy-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            {currentIndex === quizProblems.length - 1 ? 'Finish Quiz' : 'Next Signal'} <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatternQuiz;
