
import React, { useRef, useEffect } from 'react';
import { Message, ConversationRole } from '../types';

interface ConversationViewProps {
    conversation: Message[];
    onTranslate?: (messageIndex: number, textToTranslate: string) => void;
    nativeLanguage?: string;
}

const PronunciationFeedbackCard: React.FC<{ score: number; feedback: string }> = ({ score, feedback }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 10) * circumference;

    return (
        <div className="mt-2 max-w-xl w-full p-3 rounded-xl border border-indigo-500/50 bg-indigo-500/20 text-indigo-200">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 70 70">
                        <circle
                            className="text-white/10"
                            strokeWidth="5"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="35"
                            cy="35"
                        />
                        <circle
                            className="text-indigo-400"
                            strokeWidth="5"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="35"
                            cy="35"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                        />
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dy=".3em"
                            className="text-xl font-bold fill-current text-indigo-200"
                        >
                            {score}
                        </text>
                    </svg>
                </div>
                <div>
                    <p className="font-semibold text-sm mb-1 text-indigo-100">Pronunciation Feedback:</p>
                    <p className="text-white/80 text-xs">{feedback}</p>
                </div>
            </div>
        </div>
    );
};

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onTranslate, nativeLanguage = 'Bangla' }) => {
    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    return (
        <div className="space-y-6">
            {conversation.map((message, index) => (
                <div key={index} className={`flex flex-col ${message.role === ConversationRole.USER ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-xl px-5 py-3 rounded-2xl shadow-md ${
                        message.role === ConversationRole.USER
                            ? 'bg-blue-500 text-white rounded-br-lg'
                            : 'bg-black/20 text-white/90 rounded-bl-lg'
                    }`}>
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                    
                    {message.role === ConversationRole.USER && message.correction && (
                        <div className="mt-2 max-w-xl w-full p-3 rounded-xl border border-yellow-500/50 bg-yellow-500/20 text-yellow-200">
                            <div className="flex items-start space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-3.536a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 13.536L4.343 14.243a1 1 0 101.414 1.414l.707-.707a1 1 0 00-1.414-1.414zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-sm mb-1 text-yellow-100">Correction:</p>
                                    <p className="font-medium text-white text-sm mb-2">{message.correction.corrected}</p>
                                    <p className="text-white/80 text-xs">{message.correction.explanation}</p>
                                     {message.correction.example && (
                                        <div className="mt-2 pt-2 border-t border-yellow-500/30">
                                            <p className="text-xs text-yellow-100/90 font-semibold">Example:</p>
                                            <p className="text-xs text-white/80 italic">"{message.correction.example}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {message.role === ConversationRole.USER && message.pronunciationFeedback && (
                        <PronunciationFeedbackCard 
                            score={message.pronunciationFeedback.score} 
                            feedback={message.pronunciationFeedback.feedback} 
                        />
                    )}

                    {message.role === ConversationRole.AI && (
                        <div className="mt-2 max-w-xl w-full">
                            {message.isTranslating && (
                                <p className="text-xs text-white/60 italic px-2">Translating to {nativeLanguage}...</p>
                            )}
                            {message.translation && (
                                <div className={`mt-1 p-3 rounded-xl border ${
                                    message.translationError
                                        ? 'bg-red-500/30 border-red-500/50'
                                        : 'bg-black/20 border-white/10'
                                }`}>
                                    <p className={`text-xs ${
                                        message.translationError
                                            ? 'text-red-200'
                                            : 'text-white/80'
                                    }`}>{message.translation}</p>
                                </div>
                            )}
                            {!message.translation && !message.isTranslating && message.text && index > 0 && onTranslate && (
                                <button
                                    onClick={() => onTranslate(index, message.text)}
                                    className="text-xs font-semibold text-blue-300 hover:underline px-2 py-1"
                                >
                                    Translate to {nativeLanguage}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ConversationView;
