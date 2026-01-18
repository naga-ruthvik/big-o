import React, { useState } from 'react';
import { Problem } from '../types';
import { ExternalLink, Edit, EyeOff, BrainCircuit, Ruler, Code, Zap, Check, Link as LinkIcon, Save, X, MessageSquarePlus } from 'lucide-react';
import { findSimilarProblems } from '../utils/patternMatcher';
import { isFuzzyMatch } from '../utils/similarity';

interface ProblemCardProps {
    problem: Problem;
    allProblems?: Problem[];
    onEdit: (problem: Problem) => void;
    isInterleaveMode?: boolean;
    onReview?: (problem: Problem, quality: number, timeTaken: number) => void;
    onLogMistake?: (id: string, mistake: string) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, allProblems = [], onEdit, isInterleaveMode, onReview, onLogMistake }) => {
    // List View State
    const [isExpanded, setIsExpanded] = useState(false);

    // Reveal Stages: 0=Hidden, 1=Hint(Constraints), 2=Recall(Input), 3=Full Solution
    const [revealStage, setRevealStage] = useState(0);
    const [userGuess, setUserGuess] = useState('');
    const [guessFeedback, setGuessFeedback] = useState<'neutral' | 'correct' | 'incorrect'>('neutral');

    // Timer for tracking time spent on recall
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isMistakeOpen, setIsMistakeOpen] = useState(false);
    const [mistakeDraft, setMistakeDraft] = useState('');

    // Anti-Byheart State
    const [isCodeRevealed, setIsCodeRevealed] = useState(false);
    const [canImplement, setCanImplement] = useState(false);

    const now = Date.now();
    const isCritical = now >= problem.nextReviewDate;
    const isFading = now >= problem.nextReviewDate - (2 * 24 * 60 * 60 * 1000) && !isCritical;

    // Status Styles (Dot indicators now)
    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleGrade = (quality: number) => {
        if (onReview) {
            // Calculate time spent since reveal
            const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
            onReview(problem, quality, timeTaken);
            setTimeout(() => {
                setRevealStage(0);
                setUserGuess('');
                setGuessFeedback('neutral');
                setStartTime(null);
                setIsMistakeOpen(false);
                setIsExpanded(false); // Auto collapse after review
                setIsCodeRevealed(false);
                setCanImplement(false);
            }, 500);
        }
    };

    const handleSaveMistake = () => {
        if (onLogMistake && mistakeDraft.trim()) {
            onLogMistake(problem.id, mistakeDraft);
            setIsMistakeOpen(false);
        }
    };

    const checkGuess = () => {
        if (!userGuess.trim()) return;

        // Use slightly lower threshold (0.4) to allow for "majority match" and sentences
        // Check against Pattern, Aha moment (Intuition), and Trigger (Signal context)
        const isCorrect =
            isFuzzyMatch(userGuess, problem.pattern, 0.4) ||
            isFuzzyMatch(userGuess, problem.aha, 0.45) ||
            isFuzzyMatch(userGuess, problem.trigger, 0.45);

        if (isCorrect) {
            setGuessFeedback('correct');
            // optional: feedback sound
            setTimeout(() => setRevealStage(3), 800);
        } else {
            setGuessFeedback('incorrect');
            // allow retry without auto-reveal
        }
    };

    return (
        <div className={`group relative flex flex-col bg-[#0f172a] rounded-xl border border-white/5 shadow-sm hover:border-white/10 transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-navy-800/80 shadow-xl' : 'hover:bg-navy-800/50'}`}>

            {/* List Item Header (Always Visible) */}
            <div
                onClick={toggleExpand}
                className="flex items-center justify-between p-4 cursor-pointer select-none"
            >
                <div className="flex items-center gap-4 flex-1">
                    {/* Status Indicator (Dot) */}
                    <div className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-accent-coral shadow-[0_0_8px_rgba(239,68,68,0.5)]' : isFading ? 'bg-accent-amber' : 'bg-accent-emerald'}`} title={isCritical ? 'Critical' : isFading ? 'Fading' : 'Mastered'} />

                    <div className="flex flex-col">
                        <h3 className="text-base font-bold text-gray-100 group-hover:text-white transition-colors">
                            {problem.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {problem.difficulty}
                            </span>
                            {/* Pattern hidden for active recall */}
                            {problem.revisionCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <BrainCircuit size={10} /> {problem.revisionCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isInterleaveMode && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(problem); }} className="p-2 text-gray-600 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
                            <Edit size={14} />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isExpanded
                            ? 'bg-white/10 text-white'
                            : isCritical ? 'bg-accent-coral text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        {isExpanded ? 'Close' : isCritical ? 'Review Now' : 'Practice'}
                    </button>
                </div>
            </div>

            {/* Expandable Body */}
            {isExpanded && (
                <div className="border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-6">
                        {/* REVEAL LOGIC CONTAINED HERE */}
                        <div className="w-full rounded-xl bg-navy-900/50 border border-white/5 relative overflow-hidden flex flex-col min-h-[200px]">

                            {/* STAGE 0: LOCKED */}
                            {revealStage === 0 && (
                                <button
                                    onClick={() => { setRevealStage(1); setStartTime(Date.now()); }}
                                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 text-center p-6 hover:bg-white/5 transition-colors group/reveal cursor-pointer w-full"
                                >
                                    <div className="w-12 h-12 rounded-full bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20 group-hover/reveal:scale-110 group-hover/reveal:border-accent-purple/50 transition-all">
                                        <BrainCircuit className="text-accent-purple" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-200">Initialize Recall</h4>
                                        <p className="text-xs text-gray-500 mt-1">Check constraints hidden: {problem.constraints || 'None'}</p>
                                    </div>
                                </button>
                            )}

                            {/* STAGE 1: HINT */}
                            {revealStage === 1 && (
                                <div className="absolute inset-0 z-20 flex flex-col p-6 animate-in fade-in zoom-in-95 bg-[#0f172a]">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identify Signal</span>
                                        <div className="flex items-center gap-4">
                                            <a href={problem.link} target="_blank" rel="noreferrer" className="text-[10px] text-accent-blue hover:text-white flex items-center gap-1 transition-colors">
                                                <ExternalLink size={10} /> Problem
                                            </a>
                                            <button onClick={() => setRevealStage(3)} className="text-[10px] text-gray-600 hover:text-gray-400">Skip</button>
                                        </div>
                                    </div>

                                    <div className="flex-grow flex flex-col justify-center gap-3">
                                        <input
                                            type="text"
                                            className="w-full bg-navy-900 border border-navy-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:ring-1 focus:ring-accent-purple outline-none"

                                            placeholder="What is the signal / pattern?"
                                            value={userGuess}
                                            onChange={(e) => { setUserGuess(e.target.value); setGuessFeedback('neutral'); }}
                                            onKeyDown={(e) => e.key === 'Enter' && checkGuess()}
                                            autoFocus
                                        />

                                        {guessFeedback === 'incorrect' && (
                                            <div className="text-xs text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                                <Zap size={12} className="fill-red-400/20" />
                                                <span>Not quite. Try identifying the specific algorithmic pattern.</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={checkGuess}
                                            className="w-full py-2.5 bg-accent-purple text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition-all"
                                        >
                                            Verify Signal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STAGE 3: SOLUTION */}
                            <div className={`p-6 transition-opacity duration-300 ${revealStage === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
                                {/* Content content */}
                                {guessFeedback !== 'neutral' && (
                                    <div className={`text-xs font-bold p-2.5 rounded-lg mb-4 flex items-center gap-2 ${guessFeedback === 'correct' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {guessFeedback === 'correct' ? <Check size={14} /> : <Zap size={14} />}
                                        {guessFeedback === 'correct' ? 'Pattern Recognized' : 'Memory Gap'}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest block mb-1">Aha! Moment</span>
                                            <p className="text-sm text-gray-300 leading-relaxed">{problem.aha}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase text-accent-blue font-bold tracking-widest block mb-1">Signal</span>
                                            <p className="text-sm text-gray-300 italic">"{problem.trigger}"</p>
                                        </div>
                                        {problem.mistake && (
                                            <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                                <span className="text-[10px] uppercase text-red-400 font-bold block mb-1">Recent Mistake</span>
                                                <p className="text-xs text-gray-400 italic">"{problem.mistake}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {problem.codeSnippet && (
                                        <div className="bg-navy-950 rounded-lg border border-white/5 overflow-hidden flex flex-col h-full max-h-[250px] relative group/code">
                                            <div className="flex items-center justify-between px-3 py-2 bg-black/20 border-b border-white/5">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest"><Code size={10} className="inline mr-1" /> Implementation</span>
                                                <button
                                                    onClick={() => setIsCodeRevealed(!isCodeRevealed)}
                                                    className="text-[10px] text-accent-purple hover:text-white transition-colors"
                                                >
                                                    {isCodeRevealed ? 'Hide' : 'Reveal'}
                                                </button>
                                            </div>

                                            <div className={`relative flex-grow overflow-hidden ${!isCodeRevealed ? 'blur-sm select-none opacity-50' : ''}`}>
                                                <pre className="text-[10px] font-mono text-gray-400 overflow-x-auto custom-scrollbar p-3 h-full">
                                                    {problem.codeSnippet}
                                                </pre>
                                                {!isCodeRevealed && (
                                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10">
                                                        <button
                                                            onClick={() => setIsCodeRevealed(true)}
                                                            className="px-3 py-1.5 bg-navy-800/80 border border-white/10 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:border-white/20 transition-all backdrop-blur-md shadow-lg"
                                                        >
                                                            <EyeOff size={12} className="inline mr-1.5 mb-0.5" />
                                                            View Code
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-white/5">
                                    {isMistakeOpen ? (
                                        <div className="mb-4 animate-in slide-in-from-bottom-2">
                                            <textarea
                                                value={mistakeDraft}
                                                onChange={(e) => setMistakeDraft(e.target.value)}
                                                placeholder="Log your mistake..."
                                                className="w-full bg-black/30 border border-red-500/30 rounded-lg p-3 text-xs text-white placeholder:text-gray-600 mb-2 focus:ring-1 focus:ring-red-500 outline-none"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setIsMistakeOpen(false)} className="px-3 py-1.5 text-[10px] text-gray-500 hover:text-white">Cancel</button>
                                                <button onClick={handleSaveMistake} className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-bold rounded flex items-center gap-1"><Save size={12} /> Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-bold uppercase text-gray-500">Rate Recall</span>
                                            <button
                                                onClick={() => { setIsMistakeOpen(true); setMistakeDraft(problem.mistake || ''); }}
                                                className="text-[10px] flex items-center gap-1.5 text-red-400 hover:text-red-300 opacity-70 hover:opacity-100"
                                            >
                                                <MessageSquarePlus size={12} /> Log Mistake
                                            </button>
                                        </div>
                                    )}

                                    <div className="mb-4 flex items-center gap-2 px-1">
                                        <input
                                            type="checkbox"
                                            id={`ack-${problem.id}`}
                                            checked={canImplement}
                                            onChange={(e) => setCanImplement(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-gray-600 bg-transparent text-accent-purple focus:ring-offset-navy-900"
                                        />
                                        <label htmlFor={`ack-${problem.id}`} className={`text-xs select-none cursor-pointer ${canImplement ? 'text-accent-emerald font-bold' : 'text-gray-500'}`}>
                                            I can write this code from scratch.
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        <button onClick={() => handleGrade(0)} className="py-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs font-bold transition-all">Again</button>
                                        <button onClick={() => handleGrade(3)} className="py-2.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 text-xs font-bold transition-all">Hard</button>
                                        <button
                                            onClick={() => handleGrade(4)}
                                            disabled={!canImplement}
                                            className={`py-2.5 rounded-lg transition-all text-xs font-bold ${canImplement ? 'bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400' : 'bg-black/20 text-gray-700 cursor-not-allowed'}`}
                                        >
                                            Good
                                        </button>
                                        <button
                                            onClick={() => handleGrade(5)}
                                            disabled={!canImplement}
                                            className={`py-2.5 rounded-lg transition-all text-xs font-bold ${canImplement ? 'bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400' : 'bg-black/20 text-gray-700 cursor-not-allowed'}`}
                                        >
                                            Easy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <a href={problem.link} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-white flex items-center gap-1"><ExternalLink size={10} /> Original Problem</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemCard;