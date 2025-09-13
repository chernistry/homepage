export interface ChatConfig {
  apiEndpoint: string;
  theme: {
    colors: {
      primary: string;
      background: string;
      text: string;
    };
    borderRadius: string;
    fontFamily: string;
  };
  features: {
    backgroundMode: boolean;
    conversationPersistence: boolean;
    sourcesDisplay: boolean;
    typingIndicator: boolean;
  };
  limits: {
    maxMessageLength: number;
    conversationMemory: number;
  };
}

export const expoChatConfig: ChatConfig = {
  apiEndpoint: '/api/rag',
  theme: {
    colors: {
      primary: '#007AFF',
      background: 'rgba(255,255,255,0.95)',
      text: '#333333'
    },
    borderRadius: '8px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  features: {
    backgroundMode: true,
    conversationPersistence: true,
    sourcesDisplay: true,
    typingIndicator: true
  },
  limits: {
    maxMessageLength: 2000,
    conversationMemory: 100
  }
};
