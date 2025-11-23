
export enum ConversationRole {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  role: ConversationRole;
  text: string;
  translation?: string;
  isTranslating?: boolean;
  translationError?: boolean;
  isError?: boolean;
  correction?: {
    corrected: string;
    explanation: string;
    example: string;
  };
  pronunciationFeedback?: {
    score: number;
    feedback: string;
  };
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export interface ConversationSession {
  id: string;
  timestamp: number;
  language: string;
  nativeLanguage?: string;
  topic?: string;
  voice?: string;
  isTtsEnabled?: boolean;
  duration?: number; // Duration in seconds
  messages: Message[];
}

export interface Goal {
  type: 'time' | 'conversations';
  period: 'daily' | 'weekly';
  target: number;
}
