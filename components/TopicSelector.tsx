import React from 'react';

interface TopicSelectorProps {
    selectedTopic: string;
    onSelectTopic: (topic: string) => void;
    disabled: boolean;
}

const TOPICS = [
    'General Conversation', 'Travel & Directions', 'Food & Dining', 'Hobbies & Interests', 'Work & Career', 'Movies & TV Shows',
];

const TopicSelector: React.FC<TopicSelectorProps> = ({ selectedTopic, onSelectTopic, disabled }) => {
    return (
        <div>
            <label htmlFor="topic-select" className="block text-sm font-semibold text-white/80 mb-2">
                Conversation Topic
            </label>
             <div className="relative">
                <select
                    id="topic-select"
                    value={selectedTopic}
                    onChange={(e) => onSelectTopic(e.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none p-3 border border-white/10 rounded-xl bg-black/20 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
                >
                    {TOPICS.map((topic) => (
                         <option key={topic} value={topic} className="bg-gray-900">
                            {topic}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default TopicSelector;