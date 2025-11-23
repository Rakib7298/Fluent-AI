
import React, { useState } from 'react';

interface VoiceSettingsProps {
    speakingRate: number;
    onSpeakingRateChange: (rate: number) => void;
    pitch: number;
    onPitchChange: (pitch: number) => void;
    voice: string;
    onVoiceChange: (voice: string) => void;
    nativeLanguage: string;
    onNativeLanguageChange: (language: string) => void;
    customApiKey: string;
    onApiKeyChange: (key: string) => void;
    isTtsEnabled: boolean;
    onTtsToggle: (enabled: boolean) => void;
    availableTtsVoices: SpeechSynthesisVoice[];
    selectedTtsVoice: string | null;
    onTtsVoiceChange: (voiceName: string) => void;
    ttsError: string | null;
    onRetryTts: () => void;
    disabled: boolean;
}

const VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
const NATIVE_LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Dutch', 'Russian', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 
    'Hindi', 'Bengali', 'Indonesian', 'Turkish', 'Vietnamese'
];

const EyeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeSlashIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);


const VoiceSettings: React.FC<VoiceSettingsProps> = ({
    speakingRate,
    onSpeakingRateChange,
    pitch,
    onPitchChange,
    voice,
    onVoiceChange,
    nativeLanguage,
    onNativeLanguageChange,
    customApiKey,
    onApiKeyChange,
    isTtsEnabled,
    onTtsToggle,
    availableTtsVoices,
    selectedTtsVoice,
    onTtsVoiceChange,
    ttsError,
    onRetryTts,
    disabled
}) => {
    const [showApiKey, setShowApiKey] = useState(false);

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
                <h4 className="text-sm font-semibold text-white/90">Custom Gemini API Key</h4>
                <div>
                    <label htmlFor="api-key-input" className="block text-sm font-semibold text-white/80 mb-2">
                        API Key (Optional)
                    </label>
                    <div className="relative">
                        <input
                            id="api-key-input"
                            type={showApiKey ? 'text' : 'password'}
                            placeholder="Enter your Gemini API key"
                            value={customApiKey}
                            onChange={(e) => onApiKeyChange(e.target.value)}
                            disabled={disabled}
                            className="w-full p-3 pr-10 border border-white/10 rounded-xl bg-black/20 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-white/60 hover:text-white/90 disabled:opacity-50"
                            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                            disabled={disabled}
                        >
                            {showApiKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-xs text-white/60 mt-2">
                        Your key is stored only in your browser. If blank, the app's default key is used.
                    </p>
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
                 {ttsError && (
                    <div className="p-3 mb-4 rounded-lg bg-red-500/30 border border-red-500/50 text-red-200 flex items-center justify-between gap-2">
                        <p className="text-sm">{ttsError}</p>
                        <button
                            onClick={onRetryTts}
                            className="text-sm font-semibold underline hover:text-white flex-shrink-0"
                            aria-label="Retry loading text-to-speech voices"
                        >
                            Retry
                        </button>
                    </div>
                 )}
                 <div className="flex items-center justify-between">
                    <label htmlFor="tts-toggle" className="text-sm font-semibold text-white/80">
                        Enable Browser TTS
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="tts-toggle" className="sr-only peer" checked={isTtsEnabled} onChange={(e) => onTtsToggle(e.target.checked)} disabled={disabled || !!ttsError} />
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
                            disabled={disabled || !isTtsEnabled || availableTtsVoices.length === 0 || !!ttsError}
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
