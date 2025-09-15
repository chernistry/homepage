'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { expoChatConfig, type ChatConfig } from '@/lib/expo-chat-config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url?: string; id?: string }>;
  timestamp: number;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  config: ChatConfig;
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ExpoChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const sendMessage = useCallback(async (content: string) => {
    if (content.trim().length === 0 || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const requestBody: any = { query: content.trim() };
      if (conversationId) {
        requestBody.conversationId = conversationId;
      }

      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Save conversation ID for future requests
      if (data.chatId && !conversationId) {
        setConversationId(data.chatId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'Sorry, I could not process your request.',
        sources: data.sources || [],
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationId]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      isOpen,
      config: expoChatConfig,
      sendMessage,
      toggleChat,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ExpoChatProvider');
  }
  return context;
}
