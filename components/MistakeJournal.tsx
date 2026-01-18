import React, { useMemo, useState } from 'react';
import { Problem, TOPICS } from '../types';
import { AlertCircle, Brain, Filter, ChevronRight, ChevronDown } from 'lucide-react';

interface MistakeJournalProps {
    problems: Problem[];
}

const MistakeJournal: React.FC<MistakeJournalProps> = ({ problems }) => {
    const [selectedTopic, setSelectedTopic] = useState<string>('All');

    const problemsWithMistakes = useMemo(() => {
        return problems.filter(p => p.mistake && p.mistake.length > 5);
    }, [problems]);

    const groupedMistakes = useMemo(() => {
        const groups: Record<string, Problem[]> = {};
        problemsWithMistakes.forEach(p => {
            if (selectedTopic === 'All' || p.topic === selectedTopic) {
                if (!groups[p.topic]) groups[p.topic] = [];
                groups[p.topic].push(p);
            }
        });
        return groups;
    }, [problemsWithMistakes, selectedTopic]);

    // Simple analysis to find recurring keywords in mistakes
    const commonPitfalls = useMemo(() => {
        if (problemsWithMistakes.length < 3) return [];

        const words: Record<string, number> = {};
        const stopWords = new Set(['the', 'and', 'to', 'of', 'in', 'a', 'is', 'for', 'it', 'forgot', 'missed']);

        problemsWithMistakes.forEach(p => {
            const cleanMistake = p.mistake!.toLowerCase().replace(/[^\w\s]/g, '');
            cleanMistake.split(/\s+/).forEach(word => {
                if (word.length > 3 && !stopWords.has(word)) {
                    words[word] = (words[word] || 0) + 1;
                }
            });
        });

        return Object.entries(words)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Top 5 keywords
            .filter(([_, count]) => count > 1);
    }, [problemsWithMistakes]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <AlertCircle className="text-accent-coral" /> Mistake Journal
                    </h2>
                    <p className="text-gray-400">
                        "Success is stumbling from failure to failure with no loss of enthusiasm." — <span className="text-white italic">Focus on your edge cases.</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="bg-navy-800 border border-navy-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-accent-purple"
                    >
                        <option value="All">All Topics</option>
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* AI Insights / Common Pitfalls */}
            {commonPitfalls.length > 0 && (
                <div className="bg-navy-800/80 border border-navy-700 p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-purple"></div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Brain className="text-accent-purple" size={20} /> Recurring Patterns Detected
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {commonPitfalls.map(([word, count]) => (
                            <span key={word} className="bg-navy-900 text-gray-300 px-3 py-1 rounded-full text-sm border border-navy-700 flex items-center gap-2">
                                {word} <span className="bg-accent-purple/20 text-accent-purple text-xs px-1.5 rounded-full font-bold">{count}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Mistake List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedMistakes).map(([topic, topicProblems]) => (
                    <div key={topic} className="bg-navy-800 rounded-xl border border-navy-700 overflow-hidden flex flex-col">
                        <div className="bg-navy-900/50 p-4 border-b border-navy-700 font-bold text-accent-blue flex justify-between items-center">
                            {topic}
                            <span className="text-xs bg-navy-900 px-2 py-0.5 rounded text-gray-500">{topicProblems.length}</span>
                        </div>
                        <div className="p-4 space-y-4 flex-grow">
                            {topicProblems.map(p => (
                                <div key={p.id} className="group/item">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-gray-200 group-hover/item:text-white transition-colors">
                                            {p.title}
                                        </h4>
                                        <a href={p.link} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-accent-blue"><ChevronRight size={14} /></a>
                                    </div>
                                    <div className="bg-red-900/10 border-l-2 border-accent-coral pl-2 py-1 text-xs text-gray-400 italic">
                                        "{p.mistake}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {problemsWithMistakes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Brain size={48} className="mb-4 opacity-30" />
                    <p>No mistakes logged yet. Be honest in your entries!</p>
                </div>
            )}
        </div>
    );
};

export default MistakeJournal;
