
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { ConversationRole, Message, ConnectionStatus, ConversationSession, Goal } from './types';
import { encode, decode, decodeAudioData } from './utils/audio';
import LanguageSelector from './components/LanguageSelector';
import ConversationView from './components/ConversationView';
import Controls from './components/Controls';
import VoiceSettings from './components/VoiceSettings';
import ConversationHistory from './components/ConversationHistory';
import TopicSelector from './components/TopicSelector';
import GoalTracker from './components/GoalTracker';
import GoalSetter from './components/GoalSetter';

const getFriendlyErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    if (message.includes('requested device not found')) {
        return "Microphone not found. Please make sure your microphone is connected and try again.";
    }
    if (message.includes('permission denied')) {
        return "Microphone access denied. Please enable microphone permissions in your browser settings for this site.";
    }
    if (message.includes('api key not provided')) {
        return "Gemini API key is missing. Please add your key in the AI Settings section.";
    }
    if (message.includes('api_key_invalid') || message.includes('api key not valid')) {
        return "Invalid API Key. Please check your API key configuration.";
    }
    if (message.includes('resource_exhausted') || message.includes('quota')) {
        return "You have exceeded your API quota. Please check your usage limits.";
    }
    if (message.includes('failed to fetch')) {
        return "Network error. Please check your internet connection and try again.";
    }
    if (message.includes('model is overloaded')) {
        return "The AI model is temporarily overloaded. Please try again in a few moments.";
    }
    return `An unexpected error occurred. Please try again.`;
};

const App: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    const [conversation, setConversation] = useState<Message[]>([
        { role: ConversationRole.AI, text: "Hello! What language would you like to practice today? Select one below and press the microphone to start." }
    ]);
    const [language, setLanguage] = useState<string>('Spanish');
    const [nativeLanguage, setNativeLanguage] = useState<string>('English');
    const [topic, setTopic] = useState<string>('General Conversation');
    const [speakingRate, setSpeakingRate] = useState<number>(1.0);
    const [pitch, setPitch] = useState<number>(0);
    const [voice, setVoice] = useState<string>('Zephyr');
    const [view, setView] = useState<'active' | 'history'>('active');
    const [customApiKey, setCustomApiKey] = useState<string>('');

    // Goal State
    const [goal, setGoal] = useState<Goal | null>(null);
    const [isGoalSetterOpen, setIsGoalSetterOpen] = useState(false);
    const [sessionsHistory, setSessionsHistory] = useState<ConversationSession[]>([]);

    // Text-to-Speech State
    const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
    const [availableTtsVoices, setAvailableTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedTtsVoice, setSelectedTtsVoice] = useState<string | null>(null);
    const [ttsError, setTtsError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sessionStartTimeRef = useRef<number | null>(null);
    const connectionStatusRef = useRef(connectionStatus);
    useEffect(() => {
        connectionStatusRef.current = connectionStatus;
    }, [connectionStatus]);

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const nextAudioStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    // Load goals, history, and API key from localStorage
    useEffect(() => {
        try {
            const savedGoal = localStorage.getItem('fluent-pal-goal');
            if (savedGoal) setGoal(JSON.parse(savedGoal));

            const savedHistory = localStorage.getItem('fluent-pal-history');
            if (savedHistory) setSessionsHistory(JSON.parse(savedHistory));

            const savedApiKey = localStorage.getItem('fluent-pal-api-key');
            if (savedApiKey) setCustomApiKey(savedApiKey);
        } catch (error) {
            console.error("Failed to load data from localStorage:", error);
        }
    }, []);
    
    const handleApiKeyChange = (key: string) => {
        setCustomApiKey(key);
        try {
            if (key) {
                localStorage.setItem('fluent-pal-api-key', key);
            } else {
                localStorage.removeItem('fluent-pal-api-key');
            }
        } catch (error) {
            console.error("Failed to save API key:", error);
        }
    };

    // Save goal to localStorage
    const handleSetGoal = (newGoal: Goal | null) => {
        setGoal(newGoal);
        try {
            if (newGoal) {
                localStorage.setItem('fluent-pal-goal', JSON.stringify(newGoal));
            } else {
                localStorage.removeItem('fluent-pal-goal');
            }
        } catch (error) {
            console.error("Failed to save goal:", error);
        }
        setIsGoalSetterOpen(false);
    };

    const loadTtsVoices = useCallback(() => {
        setTtsError(null);
        try {
            if (typeof window.speechSynthesis === 'undefined') {
                 setTtsError("TTS is not supported on this browser.");
                 return;
            }
            // Sometimes voices are not available immediately
            setTimeout(() => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    setAvailableTtsVoices(voices);
                    if (!selectedTtsVoice) {
                        const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
                        if (defaultVoice) {
                            setSelectedTtsVoice(defaultVoice.name);
                        }
                    }
                } else {
                    setTtsError("No browser voices found. TTS may not work correctly.");
                }
            }, 150); // Small delay to allow voices to load
        } catch (error) {
            console.error("Error loading TTS voices:", error);
            setTtsError("Could not load TTS voices due to an error.");
        }
    }, [selectedTtsVoice]);

     // Load browser TTS voices
    useEffect(() => {
        window.speechSynthesis.onvoiceschanged = loadTtsVoices;
        loadTtsVoices();
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [loadTtsVoices]);

    const speakText = useCallback((text: string) => {
        if (!isTtsEnabled || !text || !selectedTtsVoice || typeof window.speechSynthesis === 'undefined') return;

        setTtsError(null);
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = availableTtsVoices.find(v => v.name === selectedTtsVoice);
        
        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn(`Selected TTS voice "${selectedTtsVoice}" not found. Using default.`);
        }
        
        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error);
            setTtsError(`Speech error: ${event.error}. Disabling TTS.`);
            setIsTtsEnabled(false);
        };

        try {
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Failed to speak text:", error);
            setTtsError("Failed to initiate speech. Disabling TTS.");
            setIsTtsEnabled(false);
        }
    }, [isTtsEnabled, selectedTtsVoice, availableTtsVoices]);

    const cleanupConnection = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(e => console.error("Error closing session:", e));
            sessionPromiseRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(e => console.error("Error closing input audio context:", e));
            inputAudioContextRef.current = null;
        }

        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context:", e));
            outputAudioContextRef.current = null;
        }

        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextAudioStartTimeRef.current = 0;
        window.speechSynthesis.cancel();
    }, []);

    const handleDisconnect = useCallback(() => {
        cleanupConnection();

        const duration = sessionStartTimeRef.current ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000) : 0;
        sessionStartTimeRef.current = null;

        // Save conversation before resetting
        if (conversation.length > 1) { // Only save if there's more than the initial message
            try {
                const data = localStorage.getItem('fluent-pal-history');
                const sessions: ConversationSession[] = data ? JSON.parse(data) : [];
                
                const newSession: ConversationSession = {
                    id: `session_${Date.now()}`,
                    timestamp: Date.now(),
                    language: language,
                    nativeLanguage: nativeLanguage,
                    topic: topic,
                    voice: voice,
                    isTtsEnabled: isTtsEnabled,
                    messages: conversation.slice(1), // Exclude the initial welcome message
                    duration: duration > 1 ? duration : 0,
                };
                
                const updatedSessions = [...sessions, newSession];
                localStorage.setItem('fluent-pal-history', JSON.stringify(updatedSessions));
                setSessionsHistory(updatedSessions); // Update state for GoalTracker
            } catch (error)
 {
                console.error("Failed to save conversation history:", error);
            }
        }
        
        // Reset conversation state for the next session
        setConversation([
            { role: ConversationRole.AI, text: "Hello! What language would you like to practice today? Select one below and press the microphone to start." }
        ]);

        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        console.log('Disconnected and cleaned up resources.');
    }, [cleanupConnection, conversation, language, topic, voice, nativeLanguage, isTtsEnabled]);
    
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        handleDisconnect();
      };
    }, [handleDisconnect]);

    const createBlob = (data: Float32Array): Blob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    };

    const handleTranslate = async (messageIndex: number, textToTranslate: string) => {
        setConversation(prev =>
            prev.map((msg, index) =>
                index === messageIndex ? { ...msg, isTranslating: true, translationError: false } : msg
            )
        );

        try {
            // Build conversation context for better translation accuracy
            const conversationContext = conversation
                .slice(Math.max(0, messageIndex - 4), messageIndex) // Get last 4 messages for context
                .map(msg => `${msg.role === ConversationRole.USER ? 'User' : 'AI Tutor'}: ${msg.text}`)
                .join('\n');
            
            const prompt = `You are a translation assistant for a language learning app. A user is practicing ${language} and has requested a translation of the AI tutor's last message into their native language, ${nativeLanguage}.

Here is the recent context of their conversation:
---
${conversationContext}
---

Based on this context, please provide a natural and accurate translation of the following sentence into ${nativeLanguage}.

Original sentence (${language}): "${textToTranslate}"

${nativeLanguage} Translation:`;

            const apiKey = customApiKey || process.env.API_KEY;
            if (!apiKey) {
                throw new Error("API key not provided. Please set your API key in the settings.");
            }
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const translation = response.text;

            if (!translation) {
                throw new Error("Received an empty translation.");
            }

            setConversation(prev =>
                prev.map((msg, index) =>
                    index === messageIndex ? { ...msg, isTranslating: false, translation: translation, translationError: false } : msg
                )
            );
        } catch (error) {
            console.error("Translation failed:", error);
            const friendlyError = getFriendlyErrorMessage(error as Error);
            setConversation(prev =>
                prev.map((msg, index) =>
                    index === messageIndex ? { ...msg, isTranslating: false, translation: friendlyError, translationError: true } : msg
                )
            );
        }
    };

    const toggleConversation = async () => {
        if (connectionStatus === ConnectionStatus.CONNECTED) {
            handleDisconnect();
            return;
        }

        if (connectionStatus === ConnectionStatus.CONNECTING) {
            return;
        }

        // If retrying, remove the previous error message
        if (connectionStatus === ConnectionStatus.ERROR) {
            setConversation(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === ConversationRole.AI && (lastMessage.text.startsWith('Error:') || lastMessage.text.startsWith('An error occurred:'))) {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        }

        setConnectionStatus(ConnectionStatus.CONNECTING);
        sessionStartTimeRef.current = Date.now();

        const topicInstruction = topic === 'General Conversation' 
            ? '' 
            : `Your goal is to help me practice my conversational skills in ${language} about the topic of ${topic}. Please start the conversation about ${topic} and steer it towards that subject.`;

        const systemInstruction = `You are a friendly, patient, and encouraging language tutor for a user practicing ${language}.
Your primary goal is to help them improve. You have two main feedback tasks: Grammar Correction and Pronunciation Scoring.

1.  **Engage in Conversation:** Have a natural, back-and-forth conversation. ${topicInstruction}. Keep your responses relatively short.

2.  **Pronunciation Scoring:** After each user turn, you MUST provide a pronunciation score. The score should be on a scale of 1-10. Provide specific, concise feedback on one or two sounds they can improve. Format this using a special block at the end of your response: "PRONUNCIATION_BLOCK::[Score out of 10] | [Specific feedback]".
    *Example: "PRONUNCIATION_BLOCK::8 | Your 'r' sound in 'perro' was good, but try to make the 'j' sound in 'hijo' stronger."*

3.  **Grammar Correction:** Listen carefully for grammatical errors. If you detect one, you MUST provide a detailed correction. The correction must include the corrected sentence, a clear explanation of the grammar rule, and an example of correct usage. Format this using a special block: "CORRECTION_BLOCK::[The user's original sentence] | [The corrected sentence] | [A detailed explanation] | [An example of correct usage]".
    *Example: "CORRECTION_BLOCK::He go to school yesterday. | He went to school yesterday. | The verb 'go' is irregular. When talking about the past, we use the past tense form, which is 'went'. | She went to the store this morning."*

4.  **Response Structure:** Your final response MUST be structured in this order:
    1.  Your conversational reply.
    2.  The PRONUNCIATION_BLOCK (mandatory for every turn).
    3.  The CORRECTION_BLOCK (only if there was a grammar error).

Example of a full response with a grammar error:
"That's interesting! I enjoy hiking too. What's your favorite place to hike?PRONUNCIATION_BLOCK::7 | The 'th' sound in 'that's' was a little unclear. Try placing your tongue between your teeth.CORRECTION_BLOCK::I like go hiking. | I like to go hiking. | We use 'to go' after the verb 'like'.| I like to swim in the summer."

Example of a response without a grammar error:
"It's a beautiful day, isn't it?PRONUNCIATION_BLOCK::9 | Your intonation was excellent on that question!"`;
        
        try {
            const apiKey = customApiKey || process.env.API_KEY;
            if (!apiKey) {
                throw new Error("API key not provided. Please set your API key in the settings.");
            }
            const ai = new GoogleGenAI({ apiKey });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { 
                            prebuiltVoiceConfig: { voiceName: voice },
                            speakingRate: speakingRate,
                            pitch: pitch,
                        },
                    },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: systemInstruction,
                },
                callbacks: {
                    onopen: () => {
                        console.log('Connection opened.');
                        setConnectionStatus(ConnectionStatus.CONNECTED);
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                       if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            currentOutputTranscriptionRef.current += text;
                        }
                        
                        if (message.serverContent?.inputTranscription) {
                           const text = message.serverContent.inputTranscription.text;
                           currentInputTranscriptionRef.current += text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscriptionRef.current.trim();
                            let fullOutput = currentOutputTranscriptionRef.current.trim();
                           
                            setConversation(prev => {
                                let newConversation = [...prev];
                                if (prev[prev.length - 1]?.text === "Hello! What language would you like to practice today? Select one below and press the microphone to start.") {
                                    newConversation = [];
                                }
                                if (fullInput) newConversation.push({ role: ConversationRole.USER, text: fullInput });
                                
                                let aiReplyText = fullOutput;
                                let correctionData = null;
                                let pronunciationData = null;

                                // Helper to find the last user message index
                                const findLastUserMessageIndex = (conv: Message[]) => {
                                    for (let i = conv.length - 1; i >= 0; i--) {
                                        if (conv[i].role === ConversationRole.USER) return i;
                                    }
                                    return -1;
                                };

                                // Parse from the end of the string backwards.
                                // 1. Grammar Correction
                                if (aiReplyText.includes('CORRECTION_BLOCK::')) {
                                    const parts = aiReplyText.split('CORRECTION_BLOCK::');
                                    aiReplyText = parts[0].trim();
                                    const correctionString = parts[1].trim();
                                    const correctionParts = correctionString.split('|').map(p => p.trim());
                                    if (correctionParts.length === 4) {
                                        correctionData = {
                                            corrected: correctionParts[1],
                                            explanation: correctionParts[2],
                                            example: correctionParts[3],
                                        };
                                    }
                                }

                                // 2. Pronunciation Feedback
                                if (aiReplyText.includes('PRONUNCIATION_BLOCK::')) {
                                    const parts = aiReplyText.split('PRONUNCIATION_BLOCK::');
                                    aiReplyText = parts[0].trim();
                                    const feedbackString = parts[1].trim();
                                    const feedbackParts = feedbackString.split('|').map(p => p.trim());
                                    if (feedbackParts.length === 2) {
                                        const score = parseInt(feedbackParts[0], 10);
                                        if (!isNaN(score)) {
                                            pronunciationData = {
                                                score: score,
                                                feedback: feedbackParts[1],
                                            };
                                        }
                                    }
                                }

                                const lastUserMessageIndex = findLastUserMessageIndex(newConversation);
                                if (lastUserMessageIndex !== -1) {
                                    if (correctionData) {
                                        newConversation[lastUserMessageIndex].correction = correctionData;
                                    }
                                    if (pronunciationData) {
                                        newConversation[lastUserMessageIndex].pronunciationFeedback = pronunciationData;
                                    }
                                }

                                if (aiReplyText) newConversation.push({ role: ConversationRole.AI, text: aiReplyText });
                                
                                speakText(aiReplyText);

                                return newConversation;
                            });

                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const outputContext = outputAudioContextRef.current!;
                            nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, outputContext.currentTime);

                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                outputContext,
                                24000,
                                1,
                            );

                            const source = outputContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputContext.destination);
                            
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });
                            
                            source.start(nextAudioStartTimeRef.current);
                            nextAudioStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                        
                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                          audioSourcesRef.current.forEach(source => source.stop());
                          audioSourcesRef.current.clear();
                          nextAudioStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: Error) => {
                        console.error('An error occurred:', e);
                        const friendlyError = getFriendlyErrorMessage(e);
                        setConversation(prev => [...prev, { role: ConversationRole.AI, text: `An error occurred: ${friendlyError}` }]);
                        setConnectionStatus(ConnectionStatus.ERROR);
                        cleanupConnection();
                    },
                    onclose: () => {
                        console.log('Connection closed.');
                         // Check ref to prevent resetting UI after an error has been displayed
                        if (connectionStatusRef.current !== ConnectionStatus.ERROR) {
                            handleDisconnect();
                        }
                    },
                },
            });
            await sessionPromiseRef.current;
        } catch (error) {
            console.error('Failed to start conversation:', error);
            const friendlyError = getFriendlyErrorMessage(error as Error);
            setConversation(prev => [...prev, { role: ConversationRole.AI, text: `Error: ${friendlyError}` }]);
            setConnectionStatus(ConnectionStatus.ERROR);
            cleanupConnection();
        }
    };

    return (
        <div className="flex items-center justify-center h-screen text-white p-4">
           <div className="w-full max-w-2xl h-[95vh] flex flex-col bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                <header className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold">Fluent Pal</h1>
                        <p className="text-sm text-white/70">Your AI Language Practice Partner</p>
                    </div>
                    <button
                        onClick={() => {
                            if (view === 'history') {
                                setView('active');
                            } else {
                                // Refresh history when switching to it
                                const savedHistory = localStorage.getItem('fluent-pal-history');
                                if (savedHistory) setSessionsHistory(JSON.parse(savedHistory));
                                setView('history');
                            }
                        }}
                        disabled={connectionStatus !== ConnectionStatus.DISCONNECTED}
                        className="px-4 py-2 text-sm font-medium bg-black/20 rounded-xl hover:bg-black/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {view === 'active' ? 'View History' : 'Back to Practice'}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                        {view === 'active' ? (
                            <>
                                <GoalTracker
                                    goal={goal}
                                    sessions={sessionsHistory}
                                    onOpenGoalSetter={() => setIsGoalSetterOpen(true)}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <LanguageSelector
                                        selectedLanguage={language}
                                        onSelectLanguage={setLanguage}
                                        disabled={connectionStatus !== ConnectionStatus.DISCONNECTED}
                                    />
                                     <TopicSelector
                                        selectedTopic={topic}
                                        onSelectTopic={setTopic}
                                        disabled={connectionStatus !== ConnectionStatus.DISCONNECTED}
                                    />
                                </div>
                                <VoiceSettings
                                    speakingRate={speakingRate}
                                    onSpeakingRateChange={setSpeakingRate}
                                    pitch={pitch}
                                    onPitchChange={setPitch}
                                    voice={voice}
                                    onVoiceChange={setVoice}
                                    nativeLanguage={nativeLanguage}
                                    onNativeLanguageChange={setNativeLanguage}
                                    customApiKey={customApiKey}
                                    onApiKeyChange={handleApiKeyChange}
                                    isTtsEnabled={isTtsEnabled}
                                    onTtsToggle={setIsTtsEnabled}
                                    availableTtsVoices={availableTtsVoices}
                                    selectedTtsVoice={selectedTtsVoice}
                                    onTtsVoiceChange={setSelectedTtsVoice}
                                    ttsError={ttsError}
                                    onRetryTts={loadTtsVoices}
                                    disabled={connectionStatus !== ConnectionStatus.DISCONNECTED}
                                />
                                <ConversationView conversation={conversation} onTranslate={handleTranslate} nativeLanguage={nativeLanguage} />
                            </>
                        ) : (
                            <ConversationHistory sessions={sessionsHistory} setSessions={setSessionsHistory} />
                        )}
                </main>

                {view === 'active' && (
                    <footer className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
                            <Controls
                                status={connectionStatus}
                                toggleConversation={toggleConversation}
                            />
                    </footer>
                )}
            </div>
            {isGoalSetterOpen && (
                <GoalSetter
                    isOpen={isGoalSetterOpen}
                    currentGoal={goal}
                    onSave={handleSetGoal}
                    onClear={() => handleSetGoal(null)}
                    onClose={() => setIsGoalSetterOpen(false)}
                />
            )}
        </div>
    );
};

export default App;
