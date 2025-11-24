
import React from 'react';
import { UserProfile, FluencyDataPoint } from '../types';

const FluencyChart: React.FC<{ data: FluencyDataPoint[] }> = ({ data }) => {
    const width = 500; // SVG internal width
    const height = 150; // SVG internal height
    const padding = 20;

    if (data.length < 2) return null;

    const scores = data.map(d => d.score);
    const minScore = 0;
    const maxScore = 10;

    // Map data points to SVG coordinates
    const getX = (index: number) => (index / (data.length - 1)) * (width - 2 * padding) + padding;
    const getY = (score: number) => height - padding - ((score - minScore) / (maxScore - minScore)) * (height - 2 * padding);

    const path = "M" + data.map((d, i) => `${getX(i).toFixed(2)} ${getY(d.score).toFixed(2)}`).join(" L");

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label="Fluency score over time chart">
            {/* Y-axis labels */}
            <text x={padding - 5} y={getY(10) + 5} textAnchor="end" className="text-xs fill-current text-white/50">{maxScore}</text>
            <text x={padding - 5} y={getY(5) + 5} textAnchor="end" className="text-xs fill-current text-white/50">5</text>
            <text x={padding - 5} y={getY(0) + 5} textAnchor="end" className="text-xs fill-current text-white/50">{minScore}</text>
            
            {/* Grid lines */}
            <line x1={padding} y1={getY(10)} x2={width - padding} y2={getY(10)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1={padding} y1={getY(5)} x2={width - padding} y2={getY(5)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1={padding} y1={getY(0)} x2={width - padding} y2={getY(0)} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            
            {/* The line graph */}
            <path d={path} stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Points on the graph */}
            {data.map((d, i) => (
                <circle key={i} cx={getX(i)} cy={getY(d.score)} r="3" fill="#60a5fa" />
            ))}
        </svg>
    );
};


const ProfileView: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const sortedVocabulary = Object.entries(profile.vocabulary)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 20); // Top 20 words

    const sortedGrammar = Object.values(profile.grammarPoints)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 grammar points

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-center border-b border-white/10 pb-3">Your Progress Profile</h2>
            
            <div className="p-4 border border-white/10 rounded-xl bg-black/30">
                <h3 className="text-md font-semibold mb-4 text-white">Fluency Over Time</h3>
                {profile.fluencyHistory.length > 1 ? (
                    <FluencyChart data={profile.fluencyHistory} />
                ) : (
                    <p className="text-center text-white/60 text-sm py-8">
                        Complete more conversations to see your fluency trend.
                    </p>
                )}
            </div>
            
            <div className="p-4 border border-white/10 rounded-xl bg-black/30">
                 <h3 className="text-md font-semibold mb-4 text-white">Common Vocabulary</h3>
                 {sortedVocabulary.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {sortedVocabulary.map(([word, count]) => (
                            <span key={word} className="px-3 py-1 bg-black/40 rounded-full text-sm text-white/80">
                                {word} <span className="text-xs text-white/50 ml-1">{count}</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/60 text-sm py-4">
                        Your vocabulary will be tracked here as you speak.
                    </p>
                )}
            </div>
            
            <div className="p-4 border border-white/10 rounded-xl bg-black/30">
                 <h3 className="text-md font-semibold mb-4 text-white">Top Grammar Points to Practice</h3>
                 {sortedGrammar.length > 0 ? (
                    <div className="space-y-4">
                        {sortedGrammar.map((point, index) => (
                            <div key={index} className="p-3 bg-black/20 rounded-lg border border-white/10">
                                <p className="font-semibold text-white text-sm mb-1">{point.corrected}</p>
                                <p className="text-white/80 text-xs mb-2">{point.explanation}</p>
                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-xs text-white/70 italic">Mistake made <span className="font-bold text-yellow-300">{point.count}</span> time{point.count > 1 ? 's' : ''}.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/60 text-sm py-4">
                        Grammar points you need to work on will appear here.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProfileView;
