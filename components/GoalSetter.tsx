import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

interface GoalSetterProps {
    isOpen: boolean;
    currentGoal: Goal | null;
    onSave: (goal: Goal) => void;
    onClear: () => void;
    onClose: () => void;
}

const GoalSetter: React.FC<GoalSetterProps> = ({ isOpen, currentGoal, onSave, onClear, onClose }) => {
    const [type, setType] = useState<Goal['type']>(currentGoal?.type || 'time');
    const [period, setPeriod] = useState<Goal['period']>(currentGoal?.period || 'daily');
    const [target, setTarget] = useState<number>(currentGoal?.target || 15);

    useEffect(() => {
        if (isOpen) {
            setType(currentGoal?.type || 'time');
            setPeriod(currentGoal?.period || 'daily');
            setTarget(currentGoal?.target || (currentGoal?.type === 'time' ? 15 : 3));
        }
    }, [isOpen, currentGoal]);

    const handleSave = () => {
        if (target > 0) {
            onSave({ type, period, target });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={onClose}>
            <div className="w-full max-w-md p-6 bg-black/40 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/10 text-white" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-center">Set Your Practice Goal</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-white/80 mb-2">Goal Type</label>
                        <div className="flex gap-2">
                            <button onClick={() => setType('time')} className={`flex-1 p-3 rounded-lg text-sm font-semibold transition-colors ${type === 'time' ? 'bg-blue-500' : 'bg-black/30 hover:bg-black/50'}`}>Time Spent</button>
                            <button onClick={() => setType('conversations')} className={`flex-1 p-3 rounded-lg text-sm font-semibold transition-colors ${type === 'conversations' ? 'bg-blue-500' : 'bg-black/30 hover:bg-black/50'}`}>Conversations</button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-white/80 mb-2">Time Period</label>
                        <div className="flex gap-2">
                            <button onClick={() => setPeriod('daily')} className={`flex-1 p-3 rounded-lg text-sm font-semibold transition-colors ${period === 'daily' ? 'bg-blue-500' : 'bg-black/30 hover:bg-black/50'}`}>Daily</button>
                            <button onClick={() => setPeriod('weekly')} className={`flex-1 p-3 rounded-lg text-sm font-semibold transition-colors ${period === 'weekly' ? 'bg-blue-500' : 'bg-black/30 hover:bg-black/50'}`}>Weekly</button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="target-input" className="block text-sm font-semibold text-white/80 mb-2">
                            Target {type === 'time' ? '(minutes)' : '(conversations)'}
                        </label>
                        <input
                            id="target-input"
                            type="number"
                            min="1"
                            value={target}
                            onChange={(e) => setTarget(parseInt(e.target.value, 10) || 1)}
                            className="w-full p-3 border border-white/10 rounded-xl bg-black/20 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button onClick={handleSave} className="flex-1 px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                        Save Goal
                    </button>
                    <button onClick={onClear} className="px-4 py-3 bg-red-600/80 rounded-lg hover:bg-red-600 font-semibold transition-colors">
                        Clear Goal
                    </button>
                     <button onClick={onClose} className="px-4 py-3 bg-black/30 rounded-lg hover:bg-black/50 font-semibold transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalSetter;
