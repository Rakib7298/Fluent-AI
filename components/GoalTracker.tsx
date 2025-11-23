import React, { useMemo } from 'react';
import { Goal, ConversationSession } from '../types';

interface GoalTrackerProps {
    goal: Goal | null;
    sessions: ConversationSession[];
    onOpenGoalSetter: () => void;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ goal, sessions, onOpenGoalSetter }) => {
    const progressData = useMemo(() => {
        if (!goal) return { current: 0, target: 0, percentage: 0 };

        const now = new Date();
        const startOfPeriod = new Date(now);
        if (goal.period === 'daily') {
            startOfPeriod.setHours(0, 0, 0, 0);
        } else { // weekly
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            startOfPeriod.setDate(diff);
            startOfPeriod.setHours(0, 0, 0, 0);
        }

        const relevantSessions = sessions.filter(s => s.timestamp >= startOfPeriod.getTime());
        
        let currentProgress = 0;
        if (goal.type === 'time') {
            const totalSeconds = relevantSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            currentProgress = Math.floor(totalSeconds / 60); // convert to minutes
        } else { // conversations
            currentProgress = relevantSessions.length;
        }

        const percentage = goal.target > 0 ? Math.min((currentProgress / goal.target) * 100, 100) : 0;

        return { current: currentProgress, target: goal.target, percentage };
    }, [goal, sessions]);

    const getGoalText = () => {
        if (!goal) return "No goal set";
        const unit = goal.type === 'time' ? 'min' : 'conv';
        return `${progressData.current} / ${progressData.target} ${unit}`;
    }

    const isGoalComplete = progressData.percentage >= 100;

    return (
        <div className="p-4 border border-white/10 rounded-xl bg-black/30 flex items-center justify-between gap-4">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                     <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        <span>{goal ? `${goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} Practice Goal` : 'Practice Goals'}</span>
                        {isGoalComplete && (
                            <span className="text-green-400" title="Goal Achieved!">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </span>
                        )}
                    </h3>
                    <span className="text-sm font-bold text-blue-300">{getGoalText()}</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2.5">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-500 ease-out ${isGoalComplete ? 'bg-gradient-to-r from-green-400 to-teal-500 animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                        style={{ width: `${progressData.percentage}%` }}
                        role="progressbar"
                        aria-valuenow={progressData.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Goal progress"
                    ></div>
                </div>
            </div>
            <button
                onClick={onOpenGoalSetter}
                className="px-4 py-2 text-sm font-medium bg-black/30 rounded-xl hover:bg-black/40 transition-colors flex-shrink-0"
            >
                {goal ? 'Edit Goal' : 'Set Goal'}
            </button>
        </div>
    );
};

export default GoalTracker;
