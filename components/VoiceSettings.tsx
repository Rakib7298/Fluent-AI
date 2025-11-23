import React from 'react';

interface VoiceSettingsProps {
    speakingRate: number;
    onSpeakingRateChange: (rate: number) => void;
    pitch: number;
    onPitchChange: (pitch: number) => void;
    voice: string;
    onVoiceChange: (voice: string) => void;
    nativeLanguage: string;
    onNativeLanguageChange: (language: string) => void;
    isTtsEnabled: boolean;
    onTtsToggle: (enabled: boolean) => void;
    availableTtsVoices: SpeechSynthesisVoice[];
    selectedTtsVoice: string | null;
    onTtsVoiceChange: (voiceName: string) => void;
    disabled: boolean;
}

const VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
const NATIVE_LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Dutch', 'Russian', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 
    'Hindi', 'Bengali', 'Indonesian', 'Turkish', 'Vietnamese'
];

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
    speakingRate,
    onSpeakingRateChange,
    pitch,
    onPitchChange,
    voice,
    onVoiceChange,
    nativeLanguage,
    onNativeLanguageChange,
    isTtsEnabled,
    onTtsToggle,
    availableTtsVoices,
    selectedTtsVoice,
    onTtsVoiceChange,
    disabled
}) => {
    return (
        <div className="p-4 border border-white/10 rounded-xl bg-black/30">
            <h3 className="text-md font-semibold mb-4 text-white">AI Settings</h3>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="native-language-select" className="block text-sm font-semibold text-white/80 mb-2">
                        Your Native Language (for translations)
                    </label>
                     <div className="relative">
                        <select
                            id="native-language-select"
                            value={nativeLanguage}
                            onChange={(e) => onNativeLanguageChange(e.target.value)}
                            disabled={disabled}
                             className="w-full appearance-none p-3 border border-white/10 rounded-xl bg-black/20 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
                        >
                            {NATIVE_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang} className="bg-gray-900">
                                    {lang}
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

                <div className="border-t border-white/10 my-4"></div>
                <h4 className="text-sm font-semibold text-white/90">AI Voice (Live)</h4>
                 <div>
                    <label htmlFor="voice-select" className="block text-sm font-semibold text-white/80 mb-2">
                        Voice Model
                    </label>
                     <div className="relative">
                        <select
                            id="voice-select"
                            value={voice}
                            onChange={(e) => onVoiceChange(e.target.value)}
                            disabled={disabled}
                             className="w-full appearance-none p-3 border border-white/10 rounded-xl bg-black/20 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
                        >
                            {VOICES.map((v) => (
                                <option key={v} value={v} className="bg-gray-900">
                                    {v}
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
                <div>
                    <label htmlFor="speaking-rate" className="flex justify-between text-sm font-medium text-white/80 mb-1">
                        <span>Speaking Speed</span>
                        <span className="font-bold text-blue-300">{speakingRate.toFixed(1)}x</span>
                    </label>
                    <input
                        type="range"
                        id="speaking-rate"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={speakingRate}
                        onChange={(e) => onSpeakingRateChange(parseFloat(e.target.value))}
                        disabled={disabled}
                        className="w-full"
                        aria-label="Speaking speed"
                    />
                </div>
                <div>
                    <label htmlFor="pitch" className="flex justify-between text-sm font-medium text-white/80 mb-1">
                        <span>Pitch</span>
                         <span className="font-bold text-blue-300">{pitch > 0 ? '+' : ''}{pitch}</span>
                    </label>
                    <input
                        type="range"
                        id="pitch"
                        min="-10"
                        max="10"
                        step="1"
                        value={pitch}
                        onChange={(e) => onPitchChange(parseInt(e.target.value, 10))}
                        disabled={disabled}
                        className="w-full"
                        aria-label="Voice pitch"
                    />
                </div>
                
                <div className="border-t border-white/10 my-4"></div>
                <h4 className="text-sm font-semibold text-white/90">Text-to-Speech (Browser)</h4>
                 <div className="flex items-center justify-between">
                    <label htmlFor="tts-toggle" className="text-sm font-semibold text-white/80">
                        Enable Browser TTS
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="tts-toggle" className="sr-only peer" checked={isTtsEnabled} onChange={(e) => onTtsToggle(e.target.checked)} disabled={disabled} />
                        <div className="w-11 h-6 bg-black/30 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>
                 <div>
                    <label htmlFor="tts-voice-select" className="block text-sm font-semibold text-white/80 mb-2">
                        Browser Voice
                    </label>
                     <div className="relative">
                        <select
                            id="tts-voice-select"
                            value={selectedTtsVoice || ''}
                            onChange={(e) => onTtsVoiceChange(e.target.value)}
                            disabled={disabled || !isTtsEnabled || availableTtsVoices.length === 0}
                             className="w-full appearance-none p-3 border border-white/10 rounded-xl bg-black/20 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
                        >
                            {availableTtsVoices.length > 0 ? availableTtsVoices.map((v) => (
                                <option key={v.name} value={v.name} className="bg-gray-900">
                                    {v.name} ({v.lang})
                                </option>
                            )) : <option value="" disabled>No voices available</option>}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceSettings;