import React from 'react';
import { Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full py-6 mt-12 border-t border-navy-800 bg-navy-900/50">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">

                {/* Minimal Brand */}
                <div className="font-bold text-gray-400 tracking-wide">
                    BigO
                </div>

                {/* Simple Credits & Links */}
                <div className="flex items-center gap-6">
                    <span className="opacity-70 text-sm">Created by Ruthvik</span>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/naga-ruthvik"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800/50 border border-navy-700/50 hover:bg-navy-800 hover:border-accent-purple/30 transition-all duration-300"
                        >
                            <Github size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                            <span className="text-sm text-gray-400 group-hover:text-white font-medium transition-colors">GitHub</span>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/nagaruthvik/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800/50 border border-navy-700/50 hover:bg-navy-800 hover:border-blue-500/30 transition-all duration-300"
                        >
                            <Linkedin size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-sm text-gray-400 group-hover:text-white font-medium transition-colors">LinkedIn</span>
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
