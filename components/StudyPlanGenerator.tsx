import React, { useState } from 'react';
import { Problem, TOPICS, AISettings } from '../types';
import { Brain, Clock, Target, Calendar, ChevronRight, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { generateStudyPlanAI } from '../utils/aiService';

import ModelSelector from './ModelSelector';

interface StudyPlanGeneratorProps {
    problems: Problem[];
    onClose: () => void;
    aiSettings: AISettings;
}

const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({ problems, onClose, aiSettings }) => {
    const [mode, setMode] = useState<'interview' | 'contest'>('interview');
    const [days, setDays] = useState(7);
    const [generatedPlan, setGeneratedPlan] = useState<Record<string, Problem[]> | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Local override state (defaults to global setting)
    const [activeProvider, setActiveProvider] = useState<'gemini' | 'ollama'>(aiSettings.provider);

    const generatePlan = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            // Check config for ACTIVE provider
            if (activeProvider === 'gemini' && !aiSettings.geminiKey) {
                throw new Error("Gemini API Key is missing. Please configure it in Settings.");
            }

            const result = await generateStudyPlanAI(problems, aiSettings, days, mode, activeProvider);

            if (result.error) {
                throw new Error(result.error);
            }

            setGeneratedPlan(result.plan);
        } catch (err: any) {
            setError(err.message || "Failed to generate plan");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-navy-800 rounded-xl border border-navy-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-navy-700 flex justify-between items-center sticky top-0 bg-navy-800 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="text-accent-purple" /> AI Study Architect
                        </h2>
                        <div className="mt-2">
                            <ModelSelector
                                selectedProvider={activeProvider}
                                onSelect={setActiveProvider}
                                settings={aiSettings}
                            />
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
                </div>

                <div className="p-6 space-y-8">
                    {!generatedPlan ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div
                                    onClick={() => setMode('interview')}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${mode === 'interview' ? 'bg-accent-purple/20 border-accent-purple' : 'bg-navy-900 border-navy-700 hover:border-navy-500'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${mode === 'interview' ? 'bg-accent-purple text-white' : 'bg-navy-800 text-gray-400'}`}>
                                            <Target size={20} />
                                        </div>
                                        <div className="font-bold text-white">Interview Prep</div>
                                    </div>
                                    <p className="text-xs text-gray-400">Focuses on breadth, common patterns, and weak topics. Deep dives.</p>
                                </div>

                                <div
                                    onClick={() => setMode('contest')}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${mode === 'contest' ? 'bg-accent-blue/20 border-accent-blue' : 'bg-navy-900 border-navy-700 hover:border-navy-500'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${mode === 'contest' ? 'bg-accent-blue text-white' : 'bg-navy-800 text-gray-400'}`}>
                                            <Clock size={20} />
                                        </div>
                                        <div className="font-bold text-white">Contest Speed</div>
                                    </div>
                                    <p className="text-xs text-gray-400">Focuses on speed, implementation tricks, and edge cases.</p>
                                </div>
                            </div>

                            <div className="bg-navy-900/50 p-4 rounded-lg border border-navy-700">
                                <label className="text-sm font-bold text-gray-300 mb-2 block flex items-center gap-2">
                                    <Calendar size={14} /> Timeframe ({days} Days)
                                </label>
                                <input
                                    type="range"
                                    min="3"
                                    max="30"
                                    value={days}
                                    onChange={(e) => setDays(parseInt(e.target.value))}
                                    className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-accent-purple"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>3 Days (Crash)</span>
                                    <span>30 Days (Marathon)</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}

                            <button
                                onClick={generatePlan}
                                disabled={isGenerating}
                                className="w-full py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg shadow-lg hover:shadow-accent-purple/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> Analyzing Neural Pathways...
                                    </>
                                ) : (
                                    <>
                                        <Brain size={18} /> Generate My Plan
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Your {days}-Day Roadmap</h3>
                                <button onClick={() => setGeneratedPlan(null)} className="text-xs text-accent-blue hover:underline">Reset</button>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(generatedPlan).map(([day, problems]) => (
                                    <div key={day} className="bg-navy-900 rounded-lg p-4 border border-navy-700 animate-in slide-in-from-bottom-2">
                                        <div className="font-bold text-accent-purple text-sm mb-3 uppercase tracking-widest">{day}</div>
                                        <div className="space-y-2">
                                            {problems.map(p => (
                                                <div key={p.id} className="flex items-center justify-between text-sm group p-2 rounded hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${p.confidence < 3 ? 'bg-accent-coral' : 'bg-accent-emerald'}`}></div>
                                                        <span className="group-hover:text-white transition-colors">{p.title}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-mono">[{p.pattern.split('+')[0]}]</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyPlanGenerator;
