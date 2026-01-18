import React from 'react';
import { StatSummary } from '../types';
import { Trophy, Target, Brain, Shuffle } from 'lucide-react';

interface StatsHeaderProps {
  stats: StatSummary;
  onInterleave: () => void;
  isInterleaveMode: boolean;
  onDateSelect: (timestamp: number | null) => void;
  selectedDate: number | null;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ stats, onInterleave, isInterleaveMode, onDateSelect, selectedDate }) => {

  // Color based on Health Score (Avg confidence/status of items reviewed that day)
  // Low score (Critical) -> Red, Mid -> Yellow, High -> Green
  const getHealthColor = (score: number, count: number) => {
    if (count === 0) return 'bg-navy-800 border-navy-700';
    if (score < 1.5) return 'bg-accent-coral/60 border-accent-coral'; // Critical Avg
    if (score < 2.5) return 'bg-accent-amber/60 border-accent-amber'; // Fading Avg
    return 'bg-accent-emerald/60 border-accent-emerald'; // Mastered Avg
  };

  return (
    <div className="bg-navy-900 border-b border-navy-700 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-3 min-w-[200px]">
            {/* BigO Logo - Glitch Mode 8-Bit */}
            <div className="relative w-10 h-10 flex items-center justify-center -ml-1">
              <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-md overflow-visible">
                <defs>
                  <clipPath id="clip">
                    <rect x="0" y="0" width="100" height="100" />
                  </clipPath>
                </defs>
                <g clipPath="url(#clip)">
                  {/* Cyan Offset */}
                  <g transform="translate(-2, 0)">
                    <rect x="30" y="10" width="40" height="10" fill="#22d3ee" opacity="0.8" />
                    <rect x="30" y="80" width="40" height="10" fill="#22d3ee" opacity="0.8" />
                    <rect x="20" y="20" width="10" height="60" fill="#22d3ee" opacity="0.8" />
                    <rect x="70" y="20" width="10" height="60" fill="#22d3ee" opacity="0.8" />
                  </g>
                  {/* Magenta Offset */}
                  <g transform="translate(2, 0)">
                    <rect x="30" y="10" width="40" height="10" fill="#e879f9" opacity="0.8" />
                    <rect x="30" y="80" width="40" height="10" fill="#e879f9" opacity="0.8" />
                    <rect x="20" y="20" width="10" height="60" fill="#e879f9" opacity="0.8" />
                    <rect x="70" y="20" width="10" height="60" fill="#e879f9" opacity="0.8" />
                  </g>
                  {/* Main Body */}
                  <rect x="30" y="10" width="40" height="10" fill="#fff" />
                  <rect x="30" y="80" width="40" height="10" fill="#fff" />
                  <rect x="20" y="20" width="10" height="60" fill="#fff" />
                  <rect x="70" y="20" width="10" height="60" fill="#fff" />

                  {/* Glitch Blocks */}
                  <rect x="15" y="30" width="15" height="5" fill="#22d3ee" />
                  <rect x="75" y="60" width="20" height="5" fill="#e879f9" />
                </g>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-1">
                Big<span className="text-accent-purple">O</span>
              </h1>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-4">
            <button
              onClick={onInterleave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${isInterleaveMode
                ? 'bg-accent-purple text-white shadow-purple-500/20'
                : 'bg-navy-800 text-gray-300 hover:bg-navy-700 border border-navy-700'
                }`}
            >
              <Shuffle size={16} />
              {isInterleaveMode ? 'Exit Shuffle' : 'Shuffle Quiz'}
            </button>
          </div>

          {/* Retention Heatmap */}
          <div className="flex items-center gap-6">
            {/* Health Heatmap Visualization */}
            <div className="hidden lg:flex flex-col gap-1 items-end">
              <div className="flex gap-1">
                {stats.streakData.map((d, i) => {
                  const isSelected = selectedDate === d.timestamp;
                  return (
                    <button
                      key={i}
                      onClick={() => onDateSelect(isSelected ? null : d.timestamp)}
                      title={`${d.date}: ${d.count} solved. Avg Health: ${d.healthScore.toFixed(1)}`}
                      className={`w-3 h-3 rounded-sm border transition-all ${getHealthColor(d.healthScore, d.count)} ${isSelected ? 'ring-2 ring-white scale-125 z-10' : 'opacity-80 hover:opacity-100'}`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between w-full text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                <span>Retention Health</span>
                {selectedDate && <span className="text-accent-blue font-bold cursor-pointer" onClick={() => onDateSelect(null)}>Clear Filter</span>}
              </div>
            </div>

            <div className="flex gap-4 text-sm border-l border-navy-700 pl-6">
              <div className="text-center">
                <div className="font-bold text-accent-coral">{stats.critical}</div>
                <div className="text-[10px] text-gray-500 uppercase">Due</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-accent-amber">{stats.fading}</div>
                <div className="text-[10px] text-gray-500 uppercase">Fade</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-accent-emerald">{stats.mastered}</div>
                <div className="text-[10px] text-gray-500 uppercase">Safe</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
