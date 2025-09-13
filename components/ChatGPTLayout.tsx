'use client';

import React, { useState, useRef, useEffect } from 'react';
import { profile } from '@/lib/data/profile';
import { coreSkills } from '@/lib/data/skills';
import {
  LinkedinLogo,
  GithubLogo,
  WhatsappLogo,
  EnvelopeSimple,
  Phone,
  CalendarPlus,
  PaperPlaneRight,
} from "@phosphor-icons/react/dist/ssr";
import { motion, AnimatePresence } from 'framer-motion';
import MacHeader from './MacHeader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface StreamingTextProps {
  text: string;
  onComplete?: () => void;
}

function StreamingText({ text, onComplete }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 20);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayedText}<span className="animate-pulse">|</span></span>;
}

const Greeting = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
  const suggestions = [
    "What's your background?",
    "Tell me about your skills"
  ];

  return (
    <div className="mx-auto mt-auto mb-8 flex flex-col justify-end px-4 w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 font-heading text-center"
      >
        Ask me anything about my experience!
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-3 justify-center items-center"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.1, ease: "easeOut" }}
            onClick={() => onSendMessage(suggestion)}
            className="px-4 py-2 bg-border hover:bg-accent text-sm whitespace-nowrap rounded-full transition-all duration-200 cursor-pointer hover:scale-105"
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

const PromptInput = ({ onSubmit, input, setInput, isLoading }: {
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full overflow-hidden rounded-2xl border bg-[#1E1E1E] shadow-sm">
      <div className="flex items-end gap-2 p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about my experience..."
          className="flex-1 resize-none border-none bg-transparent p-2 text-sm outline-none focus:ring-0 min-h-[44px] max-h-32"
          style={{ fontSize: '16px' }}
          disabled={isLoading}
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          id="composer-submit-button"
          aria-label="Send prompt"
          data-testid="send-button"
          className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-center"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
          </svg>
        </button>
      </div>
    </form>
  );
};

const ChatGPTLayout = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'Sorry, I could not process your request.',
        isStreaming: true,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MacHeader />
      <div className="h-[calc(100vh-29px)] flex flex-col bg-background">
      {/* Header with profile info */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-shrink-0 border-b border-border bg-card mt-2 w-full md:w-[65%] mx-auto shadow-sm rounded-t-2xl"
      >
        <div className="max-w-4xl mx-auto px-4 py-6 text-center w-4/5">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-heading font-semibold mb-2"
          >
            {profile.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground mb-1 font-body"
          >
            {profile.role}
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base text-muted-foreground mb-4 font-heading"
          >
            {profile.hook}
          </motion.p>

          <motion.nav 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 justify-center mb-4"
          >
            {profile.socials.map((social, index) => (
              <motion.a
                key={social.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                href={social.href}
                className="w-10 h-10 aspect-square flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border flex-shrink-0"
                aria-label={social.label}
                title={social.label}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                {social.id === 'linkedin' && <LinkedinLogo size={20} />}
                {social.id === 'github' && <GithubLogo size={20} />}
                {social.id === 'whatsapp' && <WhatsappLogo size={20} />}
                {social.id === 'email' && <EnvelopeSimple size={20} />}
                {social.id === 'phone' && <Phone size={20} />}
                {social.id === 'calendly' && <CalendarPlus size={20} />}
              </motion.a>
            ))}
          </motion.nav>
        </div>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto w-full md:w-[65%] mx-auto border-l border-r border-border shadow-sm">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 min-h-full flex flex-col justify-end">
          <AnimatePresence>
            {messages.length === 0 && <Greeting onSendMessage={async (message) => {
              setInput(message);
              setTimeout(() => {
                const form = document.querySelector('form');
                if (form) {
                  const event = new Event('submit', { bubbles: true, cancelable: true });
                  form.dispatchEvent(event);
                }
              }, 0);
            }} />}
          </AnimatePresence>
          
          {messages.map((message, index) => (
            <motion.div 
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground border border-border'
                }`}>
                  <div className="font-body">
                    {message.role === 'assistant' && message.isStreaming ? (
                      <StreamingText 
                        text={message.content}
                        onComplete={() => {
                          setMessages(prev => 
                            prev.map(m => 
                              m.id === message.id ? { ...m, isStreaming: false } : m
                            )
                          );
                        }}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-6"
            >
              <div className="bg-card border border-border px-4 py-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex-shrink-0 border-t border-border bg-card w-full md:w-[65%] mx-auto shadow-sm rounded-b-2xl"
      >
        <div className="w-full md:max-w-4xl mx-auto px-4 py-4 md:w-[70%]">
          <PromptInput 
            onSubmit={handleSubmit}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default ChatGPTLayout;
