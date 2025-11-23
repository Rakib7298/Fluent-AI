
import React from 'react';
import { ConnectionStatus } from '../types';

interface ControlsProps {
    status: ConnectionStatus;
    toggleConversation: () => void;
}

const MicrophoneIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 0 0-12 0v1.5a6 6 0 0 0 6 6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 0 1-3-3v-1.5a3 3 0 0 1 6 0v1.5a3 3 0 0 1-3 3Z" />
    </svg>
);

const Controls: React.FC<ControlsProps> = ({ status, toggleConversation }) => {
    let buttonClass = 'bg-gray-500 hover:bg-gray-600';
    let buttonText = 'Start';
    let showAnimation = false;

    switch (status) {
        case ConnectionStatus.DISCONNECTED:
            buttonClass = 'bg-blue-500 hover:bg-blue-600';
            buttonText = 'Start Conversation';
            break;
        case ConnectionStatus.CONNECTING:
            buttonClass = 'bg-yellow-500/80';
            buttonText = 'Connecting...';
            showAnimation = true;
            break;
        case ConnectionStatus.CONNECTED:
            buttonClass = 'bg-red-500 hover:bg-red-600';
            buttonText = 'Stop Conversation';
            showAnimation = true;
            break;
        case ConnectionStatus.ERROR:
            buttonClass = 'bg-yellow-500 hover:bg-yellow-600';
            buttonText = 'Retry';
            break;
    }

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={toggleConversation}
                disabled={status === ConnectionStatus.CONNECTING}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50 ${buttonClass}`}
            >
                {showAnimation && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${status === ConnectionStatus.CONNECTED ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
                )}
                <MicrophoneIcon className="w-12 h-12 z-10" />
            </button>
            <p className="mt-3 text-sm text-white/80 font-medium tracking-wide">{buttonText}</p>
        </div>
    );
};

export default Controls;
