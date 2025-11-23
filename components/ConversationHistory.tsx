import React, { useState, useEffect } from 'react';
import { ConversationSession } from '../types';
import ConversationView from './ConversationView';

interface ConversationHistoryProps {
    sessions: ConversationSession[];
    setSessions: React.Dispatch<React.SetStateAction<ConversationSession[]>>;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ sessions, setSessions }) => {
    const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to delete all conversation history? This action cannot be undone.')) {
            localStorage.removeItem('fluent-pal-history');
            setSessions([]);
            setSelectedSession(null);
        }
    };
    
    const formatDuration = (seconds?: number) => {
        if (!seconds || seconds < 1) return null;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} min, ${remainingSeconds} sec`;
    };

    if (selectedSession) {
        const formattedDuration = formatDuration(selectedSession.duration);
        return (
            <div className="animate-fade-in">
                <button
                    onClick={() => setSelectedSession(null)}
                    className="mb-4 px-4 py-2 bg-black/20 rounded-xl hover:bg-black/30 transition-colors flex items-center space-x-2"
                    aria-label="Back to history list"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    <span>Back to History</span>
                </button>
                <div className="mb-4 text-center border-b border-white/10 pb-3">
                    <h3 className="text-xl font-bold">{selectedSession.language} - {selectedSession.topic || 'General'}</h3>
                    <p className="text-sm text-white/70">
                        {new Date(selectedSession.timestamp).toLocaleString()}
                        {formattedDuration && ` · ${formattedDuration}`}
                    </p>
                     <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-1 mt-2">
                         {selectedSession.voice && <span className="text-xs font-medium bg-purple-500/40 text-purple-200 px-2 py-1 rounded-full">{selectedSession.voice}</span>}
                         {selectedSession.nativeLanguage && <span className="text-xs font-medium bg-green-500/40 text-green-200 px-2 py-1 rounded-full">To {selectedSession.nativeLanguage}</span>}
                         {selectedSession.isTtsEnabled && <span className="text-xs font-medium bg-cyan-500/40 text-cyan-200 px-2 py-1 rounded-full">TTS On</span>}
                     </div>
                </div>
                <ConversationView conversation={selectedSession.messages} nativeLanguage={selectedSession.nativeLanguage}/>
            </div>
        );
    }

    // Sort sessions before displaying
    const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <h2 className="text-2xl font-bold">History</h2>
                {sessions.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        className="px-3 py-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-semibold"
                        aria-label="Clear all conversation history"
                    >
                        Clear History
                    </button>
                )}
            </div>
            {sortedSessions.length > 0 ? (
                <ul className="space-y-3">
                    {sortedSessions.map(session => {
                        const formattedDuration = formatDuration(session.duration);
                        return (
                            <li
                                key={session.id}
                                onClick={() => setSelectedSession(session)}
                                className="p-4 border border-white/10 rounded-xl cursor-pointer bg-black/30 hover:bg-black/40 transition-colors duration-200 ease-in-out"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setSelectedSession(session)}
                                aria-label={`View conversation from ${new Date(session.timestamp).toLocaleString()}`}
                            >
                                <div className="flex justify-between items-start">
                                   <div className="flex-1">
                                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                            <span className="font-semibold text-blue-300">{session.language}</span>
                                            <span className="text-xs font-medium bg-white/20 text-white/90 px-2 py-1 rounded-full">{session.topic || 'General'}</span>
                                        </div>
                                         <p className="text-sm text-white/70 mt-2 italic truncate">
                                            "{session.messages[0]?.text || 'Empty conversation'}"
                                        </p>
                                   </div>
                                    <div className="text-right ml-2 flex-shrink-0">
                                        <p className="text-xs text-white/60">
                                            {new Date(session.timestamp).toLocaleDateString()}
                                        </p>
                                        {formattedDuration && (
                                            <p className="text-xs font-semibold text-blue-300 mt-1">{formattedDuration}</p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <div className="text-center text-white/60 py-10">
                    <p className="mb-2">No past conversations found.</p>
                    <p className="text-sm">Start a new conversation to see your history here!</p>
                </div>
            )}
        </div>
    );
};

export default ConversationHistory;
