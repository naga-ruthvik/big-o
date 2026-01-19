import React, { useState, useMemo, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Problem, Status, StatSummary, TOPICS, AISettings } from './types';
import StatsHeader from './components/StatsHeader';
import ProblemCard from './components/ProblemCard';
import ProblemModal from './components/ProblemModal';
import MentalModelDashboard from './components/CheatSheet';
import RevisionDashboard from './components/RevisionDashboard';
import PatternQuiz from './components/PatternQuiz';
import MistakeJournal from './components/MistakeJournal';
import ReviewCalendar from './components/ReviewCalendar';
import { Plus, Filter, LayoutGrid, BookOpen, Search, Activity, Download, Database, Zap, AlertCircle, Calendar, NotebookPen, X, Save, Settings, Eye, EyeOff, Trash2 } from 'lucide-react';
import { calculateNextReview, getNextReviewDate } from './utils/sm2';
import { getOllamaModels } from './utils/aiService';
import { DEMO_DATA } from './data/demoData';
import Footer from './components/Footer';

const App: React.FC = () => {
    const [problems, setProblems] = useLocalStorage<Problem[]>('neuro-dsa-v1', []);
    const [lastBackupDate, setLastBackupDate] = useLocalStorage<number>('neuro-backup-date', 0);

    const [view, setView] = useState<'dashboard' | 'cheatsheet' | 'mastery' | 'quiz' | 'mistakes' | 'calendar'>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    // AI Settings
    const [aiSettings, setAiSettings] = useLocalStorage<AISettings>('neuro-ai-settings', {
        provider: 'ollama',
        geminiKey: '',
        ollamaUrl: 'http://localhost:11434',
        ollamaModel: 'llama3'
    });

    // Clear Data Modal State
    const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
    const [clearDataInput, setClearDataInput] = useState('');

    // Manual Journal Entry State
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [journalProblemId, setJournalProblemId] = useState('');
    const [journalMistakeText, setJournalMistakeText] = useState('');

    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
    const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<number | null>(null);

    // Interleaving Mode
    const [interleaveMode, setInterleaveMode] = useState(false);
    const [interleavedProblems, setInterleavedProblems] = useState<Problem[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('All');
    const [urgencyFilter, setUrgencyFilter] = useState(false);

    // Auto-Backup Check on Mount
    useEffect(() => {
        const checkBackup = () => {
            const now = Date.now();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (problems.length > 5 && now - lastBackupDate > sevenDays) {
                const shouldBackup = window.confirm("BigO: It's been over 7 days since your last backup. Download data now?");
                if (shouldBackup) {
                    downloadBackup();
                }
            }
        };
        // Small delay to allow hydration
        const timer = setTimeout(checkBackup, 2000);
        return () => clearTimeout(timer);
    }, [problems.length, lastBackupDate]);

    const downloadBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problems));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "big_o_backup_" + new Date().toISOString().slice(0, 10) + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setLastBackupDate(Date.now());
    };

    const loadDemoData = () => {
        if (window.confirm("This will replace your current list with Demo Data. Are you sure?")) {
            setProblems(DEMO_DATA);
            // Reset all filters to ensure data is visible
            setSearchQuery('');
            setSelectedTopicFilter('All');
            setUrgencyFilter(false);
            setSelectedHeatmapDate(null);
            setInterleaveMode(false);

            setView('dashboard');
        }
    };

    const handleClearAllData = () => {
        if (clearDataInput === 'DELETE') {
            setProblems([]);
            setLastBackupDate(0);
            setView('dashboard');
            setIsClearDataModalOpen(false);
            setClearDataInput('');
            alert("All data has been wiped.");
        }
    };

    // Derived Stats & Logic
    const stats: StatSummary = useMemo(() => {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;

        // Status counts based on dynamic time calculation
        let critical = 0, fading = 0, mastered = 0, solvedToday = 0;

        // Heatmap data (Last 14 days)
        const heatmap = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(Date.now() - (13 - i) * dayMs);
            const timestamp = d.setHours(0, 0, 0, 0);
            return {
                date: d.toLocaleDateString(),
                count: 0,
                healthScoreSum: 0,
                healthScore: 3, // Default safe
                timestamp
            };
        });

        problems.forEach(p => {
            // Count statuses
            const isCritical = now >= p.nextReviewDate;
            const isFading = now >= p.nextReviewDate - (2 * dayMs) && !isCritical;

            if (isCritical) critical++;
            else if (isFading) fading++;
            else mastered++;

            // Count daily activity and health
            const pDate = new Date(p.lastReviewed).setHours(0, 0, 0, 0);
            if (pDate === new Date().setHours(0, 0, 0, 0)) solvedToday++;

            // Populate historical heatmap based on ReviewHistory logs if available
            if (p.reviewHistory) {
                p.reviewHistory.forEach(log => {
                    const logDate = new Date(log.date).setHours(0, 0, 0, 0);
                    const heatDay = heatmap.find(h => h.timestamp === logDate);
                    if (heatDay) {
                        heatDay.count++;
                        // Normalize quality (0-5) to Health (1-3) for visual
                        // 0-2 = 1 (Critical), 3 = 2 (Fading), 4-5 = 3 (Safe)
                        const healthImpact = log.quality < 3 ? 1 : log.quality === 3 ? 2 : 3;
                        heatDay.healthScoreSum += healthImpact;
                    }
                });
            }
        });

        // Calculate Avg Health
        heatmap.forEach(h => {
            if (h.count > 0) {
                h.healthScore = h.healthScoreSum / h.count;
            }
        });

        return {
            total: problems.length,
            critical,
            fading,
            mastered,
            dailyGoal: 3,
            solvedToday,
            streakData: heatmap
        };
    }, [problems]);

    // Actions
    const handleSaveProblem = (problem: Problem) => {
        if (editingProblem) {
            setProblems(prev => prev.map(p => p.id === problem.id ? problem : p));
        } else {
            setProblems(prev => [problem, ...prev]);
        }
        setEditingProblem(null);
    };

    const handleReviewProblem = (problem: Problem, quality: number, timeTaken: number = 0) => {
        // Calculate new SM-2 stats
        const sm2Input = {
            revisionCount: problem.revisionCount || 0,
            interval: problem.interval || 0,
            easinessFactor: problem.easinessFactor || 2.5
        };

        const newStats = calculateNextReview(quality, sm2Input);
        const nextDate = getNextReviewDate(newStats.interval);

        const updatedProblem: Problem = {
            ...problem,
            ...newStats,
            lastReviewed: Date.now(),
            nextReviewDate: nextDate,
            // Log history
            reviewHistory: [
                ...(problem.reviewHistory || []),
                { date: Date.now(), quality, timeTaken }
            ]
        };

        setProblems(prev => prev.map(p => p.id === updatedProblem.id ? updatedProblem : p));
    };

    const handleLogMistake = (problemId: string, mistake: string) => {
        setProblems(prev => prev.map(p => p.id === problemId ? { ...p, mistake } : p));
    };

    const handleDeleteProblem = (problemId: string) => {
        if (window.confirm("Are you sure you want to delete this problem?")) {
            setProblems(prev => prev.filter(p => p.id !== problemId));
            setIsModalOpen(false);
            setEditingProblem(null);
        }
    };

    const handleManualJournalSubmit = () => {
        if (!journalProblemId || !journalMistakeText.trim()) return;
        handleLogMistake(journalProblemId, journalMistakeText);
        setIsJournalModalOpen(false);
        setJournalProblemId('');
        setJournalMistakeText('');
    };

    const startInterleaveSession = (targetTopic?: string) => {
        if (interleaveMode && !targetTopic) {
            setInterleaveMode(false);
            return;
        }

        // Filter pool if targetTopic is provided (Heal Mode)
        const pool = targetTopic
            ? problems.filter(p => p.topic === targetTopic)
            : problems;

        if (pool.length === 0) {
            alert("No problems found for this topic to review.");
            return;
        }

        // Pick 3 random problems
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5); // Take up to 5 for a quiz

        setInterleavedProblems(selected);
        setInterleaveMode(true);
        setView('dashboard');
    };

    const openEditModal = (problem: Problem) => {
        setEditingProblem(problem);
        setIsModalOpen(true);
    };

    // Main Display Logic
    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.trigger.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTopic = selectedTopicFilter === 'All' || p.topic === selectedTopicFilter;

        const now = Date.now();
        const isDue = now >= p.nextReviewDate;
        const matchesUrgency = !urgencyFilter || isDue;

        // Heatmap date filter
        const matchesDate = !selectedHeatmapDate || new Date(p.lastReviewed).setHours(0, 0, 0, 0) === selectedHeatmapDate;

        return matchesSearch && matchesTopic && matchesUrgency && matchesDate;
    });

    const displayList = interleaveMode ? interleavedProblems : filteredProblems;

    return (
        <div className="min-h-screen bg-navy-900 text-gray-300 font-sans selection:bg-accent-purple selection:text-white pb-20">

            <StatsHeader
                stats={stats}
                onInterleave={() => startInterleaveSession()}
                isInterleaveMode={interleaveMode}
                onDateSelect={setSelectedHeatmapDate}
                selectedDate={selectedHeatmapDate}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Navigation Tabs */}
                {!interleaveMode && (
                    <div className="flex flex-col gap-6 mb-8 border-b border-navy-700 pb-2">
                        <div className="flex gap-4 overflow-x-auto pb-2 w-full no-scrollbar px-1">
                            <button
                                onClick={() => setView('dashboard')}
                                className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${view === 'dashboard'
                                    ? 'text-accent-blue border-accent-blue'
                                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                                    }`}
                            >
                                <LayoutGrid size={18} /> Recall Dashboard
                            </button>
                            <button
                                onClick={() => setView('cheatsheet')}
                                className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${view === 'cheatsheet'
                                    ? 'text-accent-blue border-accent-blue'
                                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                                    }`}
                            >
                                <BookOpen size={18} /> Mental Models
                            </button>
                            <button
                                onClick={() => setView('mastery')}
                                className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${view === 'mastery'
                                    ? 'text-accent-blue border-accent-blue'
                                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                                    }`}
                            >
                                <Activity size={18} /> Mastery Metrics
                            </button>
                            <button
                                onClick={() => setView('quiz')}
                                className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${view === 'quiz'
                                    ? 'text-accent-blue border-accent-blue'
                                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                                    }`}
                            >
                                <Zap size={18} /> Pattern Quiz
                            </button>
                            <button
                                onClick={() => setView('mistakes')}
                                className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${view === 'mistakes'
                                    ? 'text-accent-blue border-accent-blue'
                                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                                    }`}
                            >
                                <AlertCircle size={18} /> Mistake Journal
                            </button>
                            <button
                                onClick={() => setView('calendar')}
                                className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${view === 'calendar'
                                    ? 'text-accent-blue border-accent-blue'
                                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                                    }`}
                            >
                                <Calendar size={18} /> Plan
                            </button>
                        </div>

                        <div className="flex gap-3 ml-auto">
                            <button
                                onClick={loadDemoData}
                                className="text-xs text-accent-purple hover:text-white flex items-center gap-1 border border-accent-purple/30 px-3 py-1 rounded-md transition-colors"
                                title="Load Sample Data"
                            >
                                <Database size={14} /> Load Demo
                            </button>
                            <button
                                onClick={downloadBackup}
                                className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
                                title="Download JSON Backup"
                            >
                                <Download size={14} /> Backup
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
                                title="Configure AI Provider"
                            >
                                <Settings size={14} /> AI Config
                            </button>
                            <button
                                onClick={() => setIsClearDataModalOpen(true)}
                                className="text-xs text-accent-coral/70 hover:text-accent-coral flex items-center gap-1 ml-2 transition-colors"
                                title="Clear All Data (Hard Reset)"
                            >
                                <Trash2 size={14} /> Clear Data
                            </button>
                        </div>
                    </div>
                )}

                {view === 'dashboard' ? (
                    <>
                        {/* Controls */}
                        {!interleaveMode && (
                            <div className="flex flex-col lg:flex-row gap-4 mb-8 items-start lg:items-center justify-between">
                                <div className="flex flex-col sm:flex-row flex-1 gap-3 w-full">
                                    <div className="relative flex-1 group w-full">
                                        <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-accent-purple transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by title, pattern..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-700 bg-navy-800 text-sm focus:ring-2 focus:ring-accent-purple outline-none text-white transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <select
                                            value={selectedTopicFilter}
                                            onChange={(e) => setSelectedTopicFilter(e.target.value)}
                                            className="flex-1 sm:w-auto px-4 py-2.5 rounded-xl border border-navy-700 bg-navy-800 text-sm focus:ring-2 focus:ring-accent-purple outline-none text-white"
                                        >
                                            <option value="All">All Topics</option>
                                            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <button
                                            onClick={() => setUrgencyFilter(!urgencyFilter)}
                                            className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${urgencyFilter
                                                ? 'bg-accent-coral/20 border-accent-coral text-accent-coral'
                                                : 'bg-navy-800 border-navy-700 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            <Filter size={16} /> {urgencyFilter ? 'Due Only' : 'Show Due'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                    <button
                                        onClick={() => { setEditingProblem(null); setIsModalOpen(true); }}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-accent-purple hover:bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 font-bold hover:scale-105 active:scale-95 whitespace-nowrap"
                                    >
                                        <Plus size={20} /> New Logic Card
                                    </button>

                                    <button
                                        onClick={() => setIsJournalModalOpen(true)}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-navy-800 hover:bg-navy-700 text-accent-coral border border-accent-coral/30 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-bold hover:scale-105 active:scale-95 whitespace-nowrap"
                                    >
                                        <NotebookPen size={20} /> Add Journal
                                    </button>
                                </div>
                            </div>
                        )}

                        {interleaveMode && (
                            <div className="mb-6 p-4 bg-navy-800 rounded-xl border border-accent-purple/30 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">Active Recall Session</h2>
                                    <p className="text-sm text-gray-400">
                                        {interleavedProblems.length} questions queued. Focus on the pattern, not just the code.
                                    </p>
                                </div>
                                <button onClick={() => setInterleaveMode(false)} className="text-sm text-gray-400 hover:text-white underline">End Session</button>
                            </div>
                        )}

                        {/* Grid */}
                        {displayList.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <LayoutGrid size={48} className="mx-auto mb-4 text-navy-700" />
                                <h3 className="text-lg font-medium text-white">Neural pathways empty</h3>
                                <p className="text-gray-500">
                                    {selectedHeatmapDate ? "No problems solved on this date." : "Add a problem to start building your brain."}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-3">
                                {displayList.map(problem => (
                                    <div key={problem.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <ProblemCard
                                            problem={problem}
                                            allProblems={problems}
                                            onEdit={openEditModal}
                                            isInterleaveMode={interleaveMode}
                                            onReview={handleReviewProblem}
                                            onLogMistake={handleLogMistake}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : view === 'cheatsheet' ? (
                    <MentalModelDashboard problems={problems} aiSettings={aiSettings} />
                ) : view === 'mastery' ? (
                    <RevisionDashboard
                        problems={problems}
                        aiSettings={aiSettings}
                        onHealTopic={(t) => {
                            setView('dashboard');
                            setSelectedTopicFilter(t);
                            setUrgencyFilter(true);
                        }}
                    />
                ) : view === 'quiz' ? (
                    <PatternQuiz
                        problems={problems}
                        onComplete={(res) => {
                            alert(`Quiz Complete! Score: ${res.correct}/${res.total}`);
                            setView('dashboard');
                        }}
                        onUpdateProblem={problem => {
                            setProblems(prev => prev.map(p => p.id === problem.id ? problem : p));
                        }}
                    />
                ) : view === 'mistakes' ? (
                    <MistakeJournal problems={problems} />
                ) : view === 'calendar' ? (
                    <ReviewCalendar problems={problems} />
                ) : null}
            </main>

            <Footer />

            <ProblemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProblem}
                onDelete={handleDeleteProblem}
                existingProblem={editingProblem}
                aiSettings={aiSettings}
            />

            {/* Manual Journal Entry Modal */}
            {isJournalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setIsJournalModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-accent-coral/20 flex items-center justify-center text-accent-coral">
                                <NotebookPen size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Log Mistake Journal</h2>
                                <p className="text-sm text-gray-400">Record a pitfall for any problem manually.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Problem</label>
                                <select
                                    className="w-full bg-navy-950 border border-navy-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-accent-coral outline-none"
                                    value={journalProblemId}
                                    onChange={(e) => setJournalProblemId(e.target.value)}
                                >
                                    <option value="">-- Choose a Problem --</option>
                                    {problems.map(p => (
                                        <option key={p.id} value={p.id}>{p.title} ({p.topic}) [{p.difficulty}]</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mistake / Edge Case</label>
                                <textarea
                                    className="w-full bg-navy-950 border border-navy-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-accent-coral outline-none min-h-[100px]"
                                    placeholder="What went wrong? e.g. 'Used Set instead of Map for frequency counting...'"
                                    value={journalMistakeText}
                                    onChange={(e) => setJournalMistakeText(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleManualJournalSubmit}
                                disabled={!journalProblemId || !journalMistakeText.trim()}
                                className="w-full py-3 bg-accent-coral hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Journal Entry Modal */}
            {isJournalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setIsJournalModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-accent-coral/20 flex items-center justify-center text-accent-coral">
                                <NotebookPen size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Log Mistake Journal</h2>
                                <p className="text-sm text-gray-400">Record a pitfall for any problem manually.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select Problem</label>
                                <select
                                    className="w-full bg-navy-950 border border-navy-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-accent-coral outline-none"
                                    value={journalProblemId}
                                    onChange={(e) => setJournalProblemId(e.target.value)}
                                >
                                    <option value="">-- Choose a Problem --</option>
                                    {problems.map(p => (
                                        <option key={p.id} value={p.id}>{p.title} ({p.topic})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mistake / Edge Case</label>
                                <textarea
                                    className="w-full bg-navy-950 border border-navy-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-accent-coral outline-none min-h-[100px]"
                                    placeholder="What went wrong? e.g. 'Used Set instead of Map for frequency counting...'"
                                    value={journalMistakeText}
                                    onChange={(e) => setJournalMistakeText(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleManualJournalSubmit}
                                disabled={!journalProblemId || !journalMistakeText.trim()}
                                className="w-full py-3 bg-accent-coral hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-navy-900 border border-navy-700/50 rounded-2xl p-0 w-full max-w-lg shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                        {/* Decorative background gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="p-6 border-b border-navy-800 bg-navy-900/50 relative z-10">
                            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/10 flex items-center justify-center text-accent-purple border border-accent-purple/20 shadow-inner">
                                    <Settings size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">AI Configuration</h2>
                                    <p className="text-sm text-gray-400">Configure your intelligence provider settings.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 relative z-10">
                            {/* Provider Toggle */}
                            <div className="bg-navy-950 p-1.5 rounded-xl flex border border-navy-800 shadow-sm">
                                <button
                                    onClick={() => setAiSettings({ ...aiSettings, provider: 'gemini' })}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${aiSettings.provider === 'gemini' ? 'bg-navy-800 text-white shadow-md ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                    Google Gemini
                                </button>
                                <button
                                    onClick={() => setAiSettings({ ...aiSettings, provider: 'ollama' })}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${aiSettings.provider === 'ollama' ? 'bg-navy-800 text-white shadow-md ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                    Ollama (Local)
                                </button>
                            </div>

                            {aiSettings.provider === 'gemini' ? (
                                <div className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-accent-purple uppercase tracking-widest ml-1">Gemini API Key</label>
                                        <div className="relative group">
                                            <input
                                                type={showApiKey ? "text" : "password"}
                                                placeholder="Enter your Google GenAI Key..."
                                                className="w-full bg-navy-950 border border-navy-700 rounded-xl p-4 pr-12 text-gray-100 focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple outline-none placeholder:text-gray-600 transition-all shadow-inner"
                                                value={aiSettings.geminiKey}
                                                onChange={(e) => setAiSettings({ ...aiSettings, geminiKey: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                                            >
                                                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-1">
                                            Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-accent-blue hover:underline hover:text-accent-blue/80 transition-colors">Google AI Studio</a>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-accent-blue uppercase tracking-widest ml-1">Ollama Base URL</label>
                                        <input
                                            type="text"
                                            placeholder="http://localhost:11434"
                                            className="w-full bg-navy-950 border border-navy-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none placeholder:text-gray-600 transition-all shadow-inner"
                                            value={aiSettings.ollamaUrl}
                                            onChange={(e) => setAiSettings({ ...aiSettings, ollamaUrl: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-accent-blue uppercase tracking-widest ml-1">Model Name</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="llama3, mistral, deepseek-coder..."
                                                className="w-full bg-navy-950 border border-navy-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue outline-none placeholder:text-gray-600 transition-all shadow-inner"
                                                value={aiSettings.ollamaModel}
                                                onChange={(e) => setAiSettings({ ...aiSettings, ollamaModel: e.target.value })}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const models = await getOllamaModels(aiSettings.ollamaUrl);
                                                    if (models.length > 0) {
                                                        const userConfirmed = window.confirm(`Found models: ${models.join(', ')}. Use first one?`);
                                                        if (userConfirmed) {
                                                            setAiSettings({ ...aiSettings, ollamaModel: models[0] });
                                                        }
                                                    } else {
                                                        alert("No models found at that URL or connection failed.");
                                                    }
                                                }}
                                                className="px-4 bg-navy-800 border border-navy-700 rounded-xl text-xs font-bold hover:bg-navy-700 active:scale-95 transition-all text-accent-blue flex flex-col items-center justify-center gap-1"
                                                title="Check Connection & Fetch Models"
                                            >
                                                <Zap size={14} /> Fetch
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-amber-500 text-xs flex gap-3 items-start leading-relaxed">
                                        <div className="mt-0.5 min-w-[16px]"><AlertCircle size={16} /></div>
                                        <span>
                                            Ensure <code>ollama serve</code> is running. If the browser blocks the request, check your CORS headers or use a local proxy.
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="w-full py-4 bg-gradient-to-r from-navy-800 to-navy-700 hover:from-navy-700 hover:to-navy-600 text-white font-bold rounded-xl transition-all border border-white/5 hover:border-white/10 shadow-lg hover:shadow-xl active:scale-[0.98] transform"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Clear Data Confirmation Modal */}
            {isClearDataModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-navy-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => { setIsClearDataModalOpen(false); setClearDataInput(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Clear All Data</h2>
                                <p className="text-sm text-gray-400">This action cannot be undone!</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                                <p className="text-sm text-gray-300 mb-2">
                                    You are about to permanently delete:
                                </p>
                                <ul className="text-xs text-gray-400 space-y-1 ml-4">
                                    <li>• All {problems.length} problem(s)</li>
                                    <li>• All review history</li>
                                    <li>• All mental models</li>
                                    <li>• All progress data</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    Type "DELETE" to confirm
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-navy-950 border border-red-500/30 rounded-xl p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="DELETE"
                                    value={clearDataInput}
                                    onChange={(e) => setClearDataInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleClearAllData()}
                                />
                            </div>

                            <button
                                onClick={handleClearAllData}
                                disabled={clearDataInput !== 'DELETE'}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> Clear All Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default App;