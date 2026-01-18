import React, { useMemo, useState } from 'react';
import { Problem, TOPICS, AISettings } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Activity, TrendingUp, AlertCircle, Clock, Zap, HeartPulse, History, AlertTriangle, Sparkles } from 'lucide-react';
import StudyPlanGenerator from './StudyPlanGenerator';

interface RevisionDashboardProps {
    problems: Problem[];
    onHealTopic: (topic: string) => void;
    aiSettings: AISettings;
}

const RevisionDashboard: React.FC<RevisionDashboardProps> = ({ problems, onHealTopic, aiSettings }) => {
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string>('All');
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    // 1. Mastery Score Calculation
    const radarData = useMemo(() => {
        return TOPICS.map(topic => {
            const topicProblems = problems.filter(p => p.topic === topic);

            if (!topicProblems || topicProblems.length === 0) {
                return { subject: topic, A: 0, fullMark: 100 };
            }

            let totalEasiness = 0;
            let totalRevisions = 0;

            topicProblems.forEach(p => {
                totalEasiness += (p.easinessFactor !== undefined ? p.easinessFactor : 2.5);
                totalRevisions += (p.revisionCount !== undefined ? p.revisionCount : 0);
            });

            const avgEasiness = totalEasiness / topicProblems.length;
            const avgRevisions = totalRevisions / topicProblems.length;

            // Adjusted Formula: Scale so 2.5 EF = ~50 mastery, higher revisions boost it
            const score = Math.min(100, Math.round((avgEasiness * 15) + (avgRevisions * 8)));

            return { subject: topic, A: score, fullMark: 100 };
        });
    }, [problems]);

    // 2. Topic Health & Decay
    const topicHealth = useMemo(() => {
        return TOPICS.map(topic => {
            const topicProblems = problems.filter(p => p.topic === topic);
            const total = topicProblems.length;

            if (total === 0) return null;

            const now = Date.now();
            const safeCount = topicProblems.filter(p => p.nextReviewDate > now).length;
            const criticalCount = topicProblems.filter(p => p.nextReviewDate <= now).length;

            const health = Math.round((safeCount / total) * 100);

            return { topic, health, total, safe: safeCount, critical: criticalCount };
        })
            .filter((t): t is NonNullable<typeof t> => t !== null)
            .sort((a, b) => a.health - b.health);
    }, [problems]);

    // 3. Cognitive Load & Stability Trend (Improved)
    const accuracyData = useMemo(() => {
        let filteredProblems = problems;
        if (selectedTopic !== 'All') {
            filteredProblems = problems.filter(p => p.topic === selectedTopic);
        }

        // We want to show the trend of the user's "Memory Stability" (Avg Easiness Factor)
        // vs "Cognitive Load" (Time spent recalling).
        // Ideally, as EF goes UP, Time should go DOWN (Speed + Mastery). //

        // Flatten all historical snapshots to simulate a timeline
        // Since we store history as {date, quality}, we can approximate EF at that time
        // However, for simplicity and accuracy, let's track Avg Quality (Short term) vs Cumulative Mastery (Long term approximation)

        const allLogs: { date: number; quality: number; time?: number }[] = [];
        filteredProblems.forEach(p => {
            if (p.reviewHistory) {
                p.reviewHistory.forEach(log => {
                    allLogs.push({ date: log.date, quality: log.quality, time: log.timeTaken });
                });
            }
        });

        allLogs.sort((a, b) => a.date - b.date);

        const grouped = new Map<string, { qSum: number; tSum: number; count: number; dateStr: string }>();

        allLogs.forEach(log => {
            const d = new Date(log.date);
            const key = `${d.getMonth() + 1}/${d.getDate()}`; // M/D format

            if (!grouped.has(key)) {
                grouped.set(key, { qSum: 0, tSum: 0, count: 0, dateStr: key });
            }
            const entry = grouped.get(key)!;
            entry.qSum += log.quality;
            entry.tSum += (log.time || 0);
            entry.count++;
        });

        // Convert to array and calculate averages
        return Array.from(grouped.values()).map(entry => ({
            date: entry.dateStr,
            efficiency: parseFloat((entry.qSum / entry.count).toFixed(2)), // Avg Quality
            speed: entry.tSum > 0 ? Math.round(entry.tSum / entry.count) : 0 // Avg Time
        })).slice(-10); // Last 10 days of activity
    }, [problems, selectedTopic]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <Activity className="text-accent-blue" /> Mastery Analytics
                    </h2>
                    <p className="text-gray-400 max-w-xl">
                        Visualizing your retention strength.
                        <span className="text-accent-emerald"> High Mastery</span> means you are fighting the forgetting curve effectively.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsGeneratorOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple rounded-lg text-sm font-bold transition-colors border border-accent-purple/30 shadow-lg hover:shadow-accent-purple/20"
                    >
                        <Sparkles size={16} /> AI Study Plan
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Filter Topic:</span>
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
            </div>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Radar Chart */}
                <div className="bg-navy-800 rounded-xl border border-navy-700 p-6 shadow-lg min-w-0 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-accent-purple" /> Skill Radar
                    </h3>

                    <div className="w-full h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Mastery Score"
                                    dataKey="A"
                                    stroke="#A855F7"
                                    strokeWidth={3}
                                    fill="#A855F7"
                                    fillOpacity={0.4}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#A855F7' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* NEW: Recall Accuracy Chart */}
                <div className="bg-navy-800 rounded-xl border border-navy-700 p-6 shadow-lg min-w-0 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                        <History size={18} className="text-accent-blue" /> Recall Accuracy Trend
                    </h3>

                    {accuracyData.length > 0 ? (
                        <div className="w-full h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={accuracyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        tickFormatter={(val) => val.split('/')[0] + '/' + val.split('/')[1]} // Simplify date
                                    />
                                    <YAxis yAxisId="left" domain={[0, 5]} stroke="#94a3b8" fontSize={10} label={{ value: 'Efficiency (Avg Score)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} label={{ value: 'Speed (sec)', angle: 90, position: 'insideRight', fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                                    />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="efficiency" name="Recall Efficiency" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="speed" name="Speed" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                            <History size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">No review history yet. Solve problems to see trends.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Decay Bars / Urgency List */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-navy-800 rounded-xl border border-navy-700 p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2">
                        <HeartPulse size={18} className="text-accent-coral" /> Urgent Repairs Needed
                    </h3>

                    <div className="space-y-6">
                        {topicHealth.length > 0 ? topicHealth.map((t) => (
                            <div key={t.topic} className="group bg-navy-900/40 rounded-xl border border-white/5 hover:border-white/10 transition-all overflow-hidden">
                                <div
                                    onClick={() => setExpandedTopic(expandedTopic === t.topic ? null : t.topic)}
                                    className="p-4 cursor-pointer"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                                {t.topic}
                                                {t.critical > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/20 animate-pulse">{t.critical} due</span>}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1 block">Health: {t.health}% ({t.total} cards)</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Mini Health Bar */}
                                            <div className="w-24 bg-navy-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${t.health > 80 ? 'bg-accent-emerald' : t.health > 50 ? 'bg-accent-amber' : 'bg-accent-coral'}`}
                                                    style={{ width: `${Math.max(t.health, 5)}%` }}
                                                ></div>
                                            </div>

                                            {t.health < 60 && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onHealTopic(t.topic); }}
                                                    className="px-3 py-1.5 bg-accent-coral/10 hover:bg-accent-coral hover:text-white text-accent-coral text-xs font-bold rounded-lg border border-accent-coral/20 transition-all"
                                                >
                                                    Heal
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail Check */}
                                {expandedTopic === t.topic && (
                                    <div className="bg-navy-950/50 border-t border-white/5 p-4 animate-in slide-in-from-top-2">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Problems affecting score</h4>
                                        <div className="space-y-2">
                                            {problems
                                                .filter(p => p.topic === t.topic)
                                                .sort((a, b) => a.nextReviewDate - b.nextReviewDate) // urgent first
                                                .map(p => {
                                                    const isDue = p.nextReviewDate <= Date.now();
                                                    return (
                                                        <div key={p.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDue ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-emerald-500/30'}`} />
                                                                <span className={`text-xs ${isDue ? 'text-gray-200 font-medium' : 'text-gray-500'} truncate`}>{p.title}</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-600 font-mono">
                                                                {isDue ? 'Due Now' : `Due in ${Math.ceil((p.nextReviewDate - Date.now()) / (24 * 60 * 60 * 1000))}d`}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                                <Clock size={24} className="mb-2 opacity-50" />
                                <p className="text-sm">No critical data available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isGeneratorOpen && <StudyPlanGenerator problems={problems} onClose={() => setIsGeneratorOpen(false)} aiSettings={aiSettings} />}
        </div>
    );
};

export default RevisionDashboard;