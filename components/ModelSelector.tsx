import React from 'react';
import { Sparkles, Cpu, Settings } from 'lucide-react';
import { AISettings } from '../types';

interface ModelSelectorProps {
    selectedProvider: 'gemini' | 'ollama';
    onSelect: (provider: 'gemini' | 'ollama') => void;
    settings: AISettings;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedProvider, onSelect, settings }) => {
    return (
        <div className="flex items-center gap-2 bg-navy-950/50 p-1 rounded-lg border border-navy-800">
            <button
                onClick={() => onSelect('gemini')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${selectedProvider === 'gemini'
                        ? 'bg-accent-purple/20 text-accent-purple shadow-sm ring-1 ring-accent-purple/50'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                title="Google Gemini (Cloud)"
            >
                <Sparkles size={14} /> Gemini
            </button>
            <button
                onClick={() => onSelect('ollama')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${selectedProvider === 'ollama'
                        ? 'bg-accent-blue/20 text-accent-blue shadow-sm ring-1 ring-accent-blue/50'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                title={`Ollama Local (${settings.ollamaModel})`}
            >
                <Cpu size={14} /> Ollama
            </button>
        </div>
    );
};

export default ModelSelector;
