import React, { useMemo, useState } from 'react';
import { Problem } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle, TrendingUp, BarChart3, AlertCircle, ListChecks } from 'lucide-react';

interface ReviewCalendarProps {
    problems: Problem[];
}

const ReviewCalendar: React.FC<ReviewCalendarProps> = ({ problems }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateDetails, setSelectedDateDetails] = useState<{ date: string, problems: Problem[] } | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const reviewsByDate = useMemo(() => {
        const map: Record<string, Problem[]> = {};

        problems.forEach(p => {
            const date = new Date(p.nextReviewDate).toLocaleDateString();
            if (!map[date]) map[date] = [];
            map[date].push(p);
        });
        return map;
    }, [problems]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDateDetails(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDateDetails(null);
    };

    const handleDateClick = (day: number) => {
        const dateStr = new Date(year, month, day).toLocaleDateString();
        const problemsDue = reviewsByDate[dateStr] || [];
        setSelectedDateDetails({ date: new Date(year, month, day).toDateString(), problems: problemsDue });
    };

    // Forecast Logic
    const forecast = useMemo(() => {
        const next7Days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateStr = d.toLocaleDateString();
            next7Days.push({
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: (reviewsByDate[dateStr] || []).length,
                date: d
            });
        }
        return next7Days;
    }, [reviewsByDate]);

    const todayDueCount = forecast[0].count;

    const renderCalendarGrid = () => {
        const days = [];
        const today = new Date().toLocaleDateString();

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-navy-900/30 border border-navy-800"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = dateObj.toLocaleDateString();
            const problemsDue = reviewsByDate[dateStr] || [];
            const count = problemsDue.length;
            const isToday = dateStr === today;

            // Heatmap Colors
            let bgClass = "bg-navy-800/50";
            if (count > 0) {
                if (count <= 2) bgClass = "bg-accent-emerald/10";
                else if (count <= 5) bgClass = "bg-accent-blue/10";
                else bgClass = "bg-accent-purple/20 border-accent-purple/30";
            }

            if (isToday) bgClass = "bg-navy-700 ring-2 ring-accent-emerald shadow-lg shadow-emerald-900/20";

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-24 border border-navy-700/50 p-2 relative cursor-pointer hover:bg-navy-700 transition-all group ${bgClass}`}
                >
                    <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${isToday ? 'bg-accent-emerald text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                        {day}
                    </div>

                    {count > 0 && (
                        <div className="absolute bottom-2 right-2 flex flex-col items-end">
                            <div className={`flex items-center gap-1 text-xs font-bold ${count > 5 ? 'text-accent-purple' : 'text-accent-blue'}`}>
                                {count} <span className="text-[10px] opacity-70">Review{count !== 1 && 's'}</span>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">

            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className="p-2 bg-accent-blue/10 rounded-lg border border-accent-blue/20">
                            <CalendarIcon className="text-accent-blue" size={24} />
                        </div>
                        Spaced Repetition Plan
                    </h2>
                    <p className="text-gray-400 max-w-xl">
                        Your neural architecture is built on consistency. We schedule reviews based on your memory decay curve (SM-2 Algorithm).
                    </p>
                </div>
            </div>

            {/* Today's Focus Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                    {/* Glow Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle size={16} className="text-accent-emerald" />
                                    <span className="text-xs font-bold text-accent-emerald uppercase tracking-widest">Action Required</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Today's Session</h3>
                            </div>
                            <div className="text-center">
                                <span className="text-4xl font-bold text-white block">{todayDueCount}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Cards Due</span>
                            </div>
                        </div>

                        {todayDueCount > 0 ? (
                            <div className="space-y-4">
                                <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-accent-blue to-accent-purple w-[10%]" />
                                </div>
                                <p className="text-sm text-gray-400">
                                    You have <strong className="text-white">{todayDueCount} patterns</strong> fading from memory. Reinforce them now to reset your forgetting curve.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <CheckCircle className="text-emerald-500" size={24} />
                                <div>
                                    <h4 className="font-bold text-emerald-400">All Caught Up!</h4>
                                    <p className="text-xs text-emerald-500/70">No reviews due today. Feel free to explore new topics.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 7-Day Forecast */}
                <div className="bg-navy-900/50 rounded-2xl p-6 border border-white/5 shadow-lg backdrop-blur-sm">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp size={16} /> Load Forecast
                    </h4>
                    <div className="space-y-3">
                        {forecast.slice(1).map((day, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors w-12">{day.dayName}</span>

                                <div className="flex-1 mx-3 h-2 bg-navy-950 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${day.count > 5 ? 'bg-accent-purple' : day.count > 0 ? 'bg-accent-blue' : 'bg-navy-800'}`}
                                        style={{ width: `${Math.min((day.count / 10) * 100, 100)}%` }} // Scale roughly to 10
                                    />
                                </div>
                                <span className={`text-sm font-bold w-6 text-right ${day.count > 0 ? 'text-white' : 'text-gray-600'}`}>{day.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendar View */}
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Main Calendar */}
                <div className="flex-1 bg-navy-800/80 rounded-2xl border border-navy-700 overflow-hidden shadow-xl backdrop-blur-sm">
                    {/* Calendar Controls */}
                    <div className="bg-navy-900/90 p-5 flex justify-between items-center border-b border-navy-700">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-navy-800 hover:text-white rounded-lg text-gray-400 transition-colors"><ChevronLeft size={20} /></button>
                        <h3 className="text-lg font-bold text-white flex gap-2 items-center">
                            <CalendarIcon size={18} className="text-gray-500" />
                            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-navy-800 hover:text-white rounded-lg text-gray-400 transition-colors"><ChevronRight size={20} /></button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 bg-navy-950/50 border-b border-navy-700 text-center py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 bg-navy-900">
                        {renderCalendarGrid()}
                    </div>
                </div>

                {/* Selected Day Details */}
                {selectedDateDetails && (selectedDateDetails.problems.length > 0) && (
                    <div className="w-full md:w-80 animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-navy-800 rounded-xl border border-navy-700 shadow-xl overflow-hidden sticky top-8">
                            <div className="p-4 bg-navy-900/80 border-b border-navy-700 flex justify-between items-center">
                                <h4 className="font-bold text-white">{selectedDateDetails.date}</h4>
                                <span className="bg-accent-purple/20 text-accent-purple text-[10px] font-bold px-2 py-1 rounded-full">{selectedDateDetails.problems.length} Due</span>
                            </div>

                            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar space-y-1">
                                {selectedDateDetails.problems.map(p => (
                                    <div key={p.id} className="p-3 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all group cursor-default">
                                        <div className="text-sm font-bold text-gray-200 group-hover:text-white mb-1">{p.title}</div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono text-gray-500 bg-black/20 px-1.5 py-0.5 rounded">R: {p.revisionCount}</span>
                                            <span className="text-[10px] text-accent-blue truncate max-w-[120px]">{p.topic}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewCalendar;
