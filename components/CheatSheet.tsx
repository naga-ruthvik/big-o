import React, { useState } from 'react';
import { Network, BrainCircuit, Target, AlertTriangle, GitBranch, Layers, Clock, Loader2, Sparkles, AlertCircle, ChevronRight, Menu, X } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Problem, AISettings, MentalModel, TOPICS } from '../types';
import { generateMentalModel } from '../utils/aiService';
import ModelSelector from './ModelSelector';

interface CheatSheetProps {
    problems: Problem[];
    aiSettings: AISettings;
}

const MentalModelDashboard: React.FC<CheatSheetProps> = ({ problems, aiSettings }) => {
    const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);
    const [models, setModels] = useLocalStorage<Record<string, MentalModel>>('neuro-mental-models', {});
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

    // Local AI override
    const [activeProvider, setActiveProvider] = useState<'gemini' | 'ollama'>(aiSettings.provider);

    // Calculate local "Aha! Frequency"
    const topicFrequency = problems.filter(p => p.topic === selectedTopic).length;

    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const model = await generateMentalModel(selectedTopic, problems, aiSettings, activeProvider);
            if (model) {
                setModels(prev => ({ ...prev, [selectedTopic]: model }));
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to generate mental model");
        } finally {
            setLoading(false);
        }
    };

    const currentModel = models[selectedTopic];

    // Dynamic Graph Generation
    const getTopicWeight = (topic: string) => {
        const ps = problems.filter(p => p.topic === topic);
        if (ps.length === 0) return 0;
        const totalEasiness = ps.reduce((acc, p) => acc + (p.easinessFactor || 2.5), 0);
        return Math.min(10, (totalEasiness / ps.length) * 3);
    };

    const graphNodes = TOPICS.map((topic, i) => {
        const angle = (i / TOPICS.length) * 2 * Math.PI;
        const radius = 120;
        return {
            id: topic,
            x: 150 + radius * Math.cos(angle),
            y: 150 + radius * Math.sin(angle),
            weight: getTopicWeight(topic),
            count: problems.filter(p => p.topic === topic).length
        };
    });

    const commonLinks = [
        ['Arrays & Hashing', 'Two Pointers'],
        ['Arrays & Hashing', 'Sliding Window'],
        ['Two Pointers', 'Sliding Window'],
        ['Trees', 'Graphs'],
        ['Graphs', 'Advanced Graphs'],
        ['Stack', 'Trees'],
        ['Heap / Priority Queue', 'Graphs'],
        ['Backtracking', 'Graphs'],
        ['1-D DP', '2-D DP'],
        ['Binary Search', 'Arrays & Hashing']
    ];

    const visualizationEdges = commonLinks.map(([source, target]) => {
        const sourceNode = graphNodes.find(n => n.id === source);
        const targetNode = graphNodes.find(n => n.id === target);
        if (!sourceNode || !targetNode) return null;

        const isActive = sourceNode.count > 0 && targetNode.count > 0;
        return {
            x1: sourceNode.x,
            y1: sourceNode.y,
            x2: targetNode.x,
            y2: targetNode.y,
            isActive
        };
    }).filter(e => e !== null);


    return (
        <div className="flex flex-col lg:flex-row gap-6 relative items-start">

            {/* Mobile Sidebar Toggle */}
            <div className="lg:hidden mb-2 sticky top-2 z-30 w-full">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-navy-800 text-gray-200 rounded-lg border border-navy-700 shadow-lg backdrop-blur-md bg-opacity-90 transition-all hover:bg-navy-700"
                >
                    <span className="flex items-center gap-2 font-bold text-sm">
                        <Menu size={20} /> Select Topic (Knowledge Graph)
                    </span>
                    {isSidebarOpen ? <X size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Knowledge Graph Sidebar - Responsive */}
            <div className={`
                fixed inset-0 z-50 lg:static lg:z-auto lg:block
                w-full lg:w-80 flex-shrink-0 
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Backdrop for mobile */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}
                    onClick={() => setIsSidebarOpen(false)}
                />

                <div className={`
                    absolute lg:sticky lg:top-4 left-0 top-0 bottom-0 w-80 lg:w-full
                    bg-navy-900 lg:bg-navy-800 lg:rounded-xl lg:border lg:border-navy-700 lg:shadow-lg
                    flex flex-col h-full lg:h-auto lg:max-h-[calc(100vh-100px)] overflow-hidden
                    shadow-2xl lg:shadow-none z-10 transform transition-transform
                `}>
                    {/* Close button for mobile */}
                    <div className="flex items-center justify-between p-4 lg:hidden border-b border-navy-700 bg-navy-900">
                        <h3 className="font-bold text-gray-200">Knowledge Graph</h3>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-4 border-b border-navy-700 bg-navy-900/50 hidden lg:block">
                        <h3 className="font-bold text-gray-200 flex items-center gap-2">
                            <Network size={18} className="text-accent-blue" /> Topic Network
                        </h3>
                    </div>

                    {/* SVG Graph - Only visible on desktop or when sidebar open on mobile */}
                    <div className="h-64 bg-navy-900 relative border-b border-navy-700 overflow-hidden flex-shrink-0">
                        <svg viewBox="0 0 300 300" className="w-full h-full">
                            <defs>
                                <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                                </radialGradient>
                            </defs>
                            {visualizationEdges.map((edge, i) => (
                                <line
                                    key={i}
                                    x1={edge!.x1} y1={edge!.y1}
                                    x2={edge!.x2} y2={edge!.y2}
                                    stroke={edge!.isActive ? "#A855F7" : "#334155"}
                                    strokeWidth={edge!.isActive ? "1.5" : "1"}
                                    strokeOpacity={edge!.isActive ? "0.6" : "0.3"}
                                    strokeDasharray={edge!.isActive ? "0" : "4"}
                                    className={edge!.isActive ? "animate-pulse" : ""}
                                />
                            ))}
                            <circle cx="150" cy="150" r="30" fill="url(#nodeGradient)" opacity="0.1" />
                            {graphNodes.map((node, i) => (
                                <g
                                    key={node.id}
                                    onClick={() => { setSelectedTopic(node.id); setIsSidebarOpen(false); }}
                                    className="cursor-pointer transition-all duration-300 group"
                                >
                                    <line x1="150" y1="150" x2={node.x} y2={node.y} stroke="#334155" strokeWidth="0.5" opacity="0.3" />
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={selectedTopic === node.id ? 8 : 4 + (node.weight / 2)}
                                        fill={selectedTopic === node.id ? '#38BDF8' : node.count > 0 ? '#34D399' : '#1E293B'}
                                        stroke={selectedTopic === node.id ? 'white' : node.count > 0 ? '#34D399' : '#475569'}
                                        strokeWidth="1.5"
                                        className="transition-all duration-300 group-hover:scale-125"
                                    />
                                    {node.weight > 6 && (
                                        <circle cx={node.x} cy={node.y} r={14} fill="#34D399" opacity="0.2" className="animate-pulse" />
                                    )}
                                </g>
                            ))}
                        </svg>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1 bg-navy-800 scrollbar-thin scrollbar-thumb-navy-600">
                        {TOPICS.map(topic => {
                            const count = problems.filter(p => p.topic === topic).length;
                            return (
                                <button
                                    key={topic}
                                    onClick={() => { setSelectedTopic(topic); setIsSidebarOpen(false); }}
                                    className={`w-full text-left px-3 py-3 lg:py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center ${selectedTopic === topic
                                        ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/30'
                                        : 'text-gray-400 hover:bg-navy-700 hover:text-gray-200'
                                        }`}
                                >
                                    <span>{topic}</span>
                                    {count > 0 && (
                                        <span className="text-[10px] bg-navy-900 px-1.5 py-0.5 rounded text-gray-500 font-mono border border-navy-700">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area - Flows Naturally, No Internal Scroll */}
            <div className="flex-1 bg-navy-800 rounded-xl border border-navy-700 flex flex-col shadow-sm relative min-h-[500px]">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-navy-700 gap-4 bg-navy-800 rounded-t-xl sticky top-0 md:static z-20">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedTopic}</h2>
                            {topicFrequency > 0 && (
                                <span className="px-3 py-1 rounded-full bg-accent-emerald/20 text-accent-emerald text-xs font-bold border border-accent-emerald/30 whitespace-nowrap">
                                    {topicFrequency} Solved
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <ModelSelector
                            selectedProvider={activeProvider}
                            onSelect={setActiveProvider}
                            settings={aiSettings}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || topicFrequency === 0}
                            title={topicFrequency === 0 ? "Solve problems in this topic first" : "Generate Strategy"}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-purple hover:bg-purple-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700 whitespace-nowrap"
                        >
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                            {currentModel ? 'Update Strategy' : 'Generate Strategy'}
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 md:p-8 space-y-8">

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 animate-in fade-in zoom-in-95">
                            <AlertCircle size={20} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {currentModel ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                            {/* Summary Quote */}
                            <div className="p-6 bg-gradient-to-r from-navy-900 to-navy-800 border-l-4 border-accent-blue rounded-r-lg italic text-gray-300 text-lg leading-relaxed shadow-lg">
                                "{currentModel.summary}"
                            </div>

                            {/* Polya's Protocol Grid */}
                            <section>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-navy-700 pb-2">
                                    <Target className="text-accent-blue" size={24} /> Identity & Attack Protocol
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    <div className="bg-navy-900/50 p-6 rounded-2xl border border-navy-700 hover:border-accent-blue/30 transition-colors shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center font-bold text-xs">1</div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-accent-blue">Understand</div>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{currentModel.polya.understand}</p>
                                    </div>
                                    <div className="bg-navy-900/50 p-6 rounded-2xl border border-navy-700 hover:border-accent-amber/30 transition-colors shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-accent-amber/20 text-accent-amber flex items-center justify-center font-bold text-xs">2</div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-accent-amber">Plan</div>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{currentModel.polya.plan}</p>
                                    </div>
                                    <div className="bg-navy-900/50 p-6 rounded-2xl border border-navy-700 hover:border-accent-emerald/30 transition-colors shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-accent-emerald/20 text-accent-emerald flex items-center justify-center font-bold text-xs">3</div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-accent-emerald">Execute</div>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{currentModel.polya.execute}</p>
                                    </div>
                                    <div className="bg-navy-900/50 p-6 rounded-2xl border border-navy-700 hover:border-accent-purple/30 transition-colors shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center font-bold text-xs">4</div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-accent-purple">Reflect</div>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{currentModel.polya.reflect}</p>
                                    </div>
                                </div>
                            </section>

                            {/* NEW: Mistake Analysis Section */}
                            {currentModel.mistakeAnalysis && currentModel.mistakeAnalysis.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-navy-700 pb-2">
                                        <AlertCircle className="text-red-400" size={24} /> Learning from Mistakes
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {currentModel.mistakeAnalysis.map((m, idx) => (
                                            <div key={idx} className="bg-gradient-to-br from-navy-900 to-navy-950 p-5 rounded-xl border border-red-500/20 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                                                            <span className="text-red-400">Pitfall:</span> {m.commonPitfall}
                                                        </h4>
                                                        {m.myPastError && m.myPastError !== "string (optional)" && (
                                                            <p className="text-xs text-gray-400 bg-red-500/10 p-2 rounded mt-2 border border-red-500/10">
                                                                <span className="font-bold text-red-300">Your History:</span> "{m.myPastError}"
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                                                        <h4 className="text-sm font-bold text-accent-emerald mb-1 flex items-center gap-2">
                                                            <Sparkles size={14} /> Correction Protocol
                                                        </h4>
                                                        <p className="text-sm text-gray-300">{m.correction}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Edge Cases & Patterns Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Edge Cases */}
                                <section>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-navy-700 pb-2">
                                        <AlertTriangle className="text-accent-coral" size={24} /> Edge Case Archetypes
                                    </h3>
                                    <div className="space-y-3">
                                        {currentModel.edgeCases.map((ec, idx) => (
                                            <div key={idx} className="bg-navy-900/50 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 transition-all hover:bg-navy-900">
                                                <div className="font-bold text-accent-coral text-sm min-w-[120px]">{ec.name}</div>
                                                <div className="hidden sm:block w-px h-8 bg-white/10"></div>
                                                <div className="text-gray-400 text-sm flex-1">{ec.rule}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Pattern Bridges */}
                                <section>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-navy-700 pb-2">
                                        <GitBranch className="text-accent-purple" size={24} /> Pattern Bridges
                                    </h3>
                                    <div className="space-y-3">
                                        {currentModel.patternBridge.map((pb, idx) => (
                                            <div key={idx} className="group p-4 rounded-xl bg-navy-900/50 border border-white/5 hover:border-accent-purple/30 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-white text-sm flex items-center gap-2">
                                                        <Layers size={14} className="text-gray-500" /> {pb.relatedTopic}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-black/20 px-2 py-0.5 rounded">
                                                        {pb.relationship}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    {pb.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Complexity Table */}
                            <section className="bg-navy-900/30 rounded-2xl border border-navy-700 overflow-hidden">
                                <div className="p-4 bg-navy-900/50 border-b border-navy-700 flex items-center gap-2">
                                    <Clock className="text-gray-400" size={20} />
                                    <h3 className="text-lg font-bold text-white">Complexity Bounds</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-200 uppercase bg-navy-900/80">
                                            <tr>
                                                <th className="px-6 py-4">Scenario</th>
                                                <th className="px-6 py-4">Time Complexity</th>
                                                <th className="px-6 py-4">Space Complexity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentModel.complexity.map((c, idx) => (
                                                <tr key={idx} className="border-b border-navy-700/50 last:border-0 hover:bg-navy-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-white">{c.scenario}</td>
                                                    <td className="px-6 py-4 font-mono text-accent-emerald">{c.time}</td>
                                                    <td className="px-6 py-4 font-mono text-accent-blue">{c.space}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-500 border-2 border-dashed border-navy-700 rounded-3xl bg-navy-900/20 min-h-[400px]">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-accent-purple/20 blur-xl rounded-full"></div>
                                <BrainCircuit size={64} className="relative z-10 opacity-80 text-accent-purple" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Unlock Complexity Secrets</h3>
                            <p className="max-w-md text-center text-sm md:text-base text-gray-400 mb-8 leading-relaxed">
                                Our AI will analyze your problem history to generate a bespoke "Identify & Attack" strategy guide for <strong>{selectedTopic}</strong>.
                            </p>

                            {topicFrequency > 0 ? (
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-accent-purple to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-md font-bold transition-all shadow-xl shadow-purple-900/30 transform hover:scale-105"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Analyzing 100+ Datapoints...</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><Sparkles size={18} /> Initialize Mental Model</span>
                                    )}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 px-6 py-3 bg-navy-800 rounded-lg border border-navy-700 text-gray-400">
                                    <AlertTriangle size={16} />
                                    <span>Solve at least 1 problem in this topic first.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default MentalModelDashboard;