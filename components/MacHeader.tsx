'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon } from "@phosphor-icons/react";

/**
 * Formats a Date object to HH:mm format (24-hour)
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

type MenuItem = {
  id: string;
  label: string;
  shortcut?: string;
  onClick?: () => void;
};

const GO_MENU: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    shortcut: '⇧⌘H',
    onClick: () => { window.location.href = '/'; },
  },
  {
    id: 'blog',
    label: 'Blog',
    shortcut: '⇧⌘B',
    onClick: () => { window.location.href = '/blog'; },
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    onClick: () => { window.open('https://www.linkedin.com/in/sasha-chernysh/', '_blank'); },
  },
  {
    id: 'github',
    label: 'GitHub',
    onClick: () => { window.open('https://github.com/chernistry', '_blank'); },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    onClick: () => { window.open('https://wa.me/972505357563', '_blank'); },
  },
  {
    id: 'email',
    label: 'Email',
    onClick: () => { window.location.href = 'mailto:alex@hireex.ai'; },
  },
  {
    id: 'phone',
    label: 'Phone',
    onClick: () => { window.location.href = 'tel:+972505357563'; },
  },
  {
    id: 'book-call',
    label: 'Book a Call',
    onClick: () => { window.open('https://calendly.com/alexchernysh/15min', '_blank'); },
  },
];

/**
 * macOS-style header with navigation, dropdown menus, theme toggle, and live clock
 */
export default function MacHeader() {
  const [time, setTime] = useState(() => formatTime(new Date()));
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const updateTime = () => setTime(formatTime(new Date()));
    const intervalId = setInterval(updateTime, 60_000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.metaKey) {
        if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          window.location.href = '/';
        }
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          window.location.href = '/blog';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="mac-header">
      <div className="mac-header-left">
        <button
          className="mac-btn mac-item"
          onClick={() => setActiveMenu(activeMenu === 'go' ? null : 'go')}
        >
          ●
        </button>
        
        <div className="relative">
          <button
            className="mac-item"
            onClick={() => setActiveMenu(activeMenu === 'go' ? null : 'go')}
          >
            Go
          </button>
          {activeMenu === 'go' && (
            <div className="absolute top-full left-0 bg-popover border border-border rounded shadow-lg py-1 min-w-[120px] z-50">
              {GO_MENU.map((item) => (
                <button
                  key={item.id}
                  className="w-full px-3 py-1 text-left hover:bg-accent hover:text-accent-foreground flex justify-between text-sm text-popover-foreground"
                  onClick={() => {
                    item.onClick?.();
                    setActiveMenu(null);
                  }}
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs opacity-60">{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="mac-item"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      <div className="mac-header-right" aria-label={`Current time: ${time}`}>
        {time}
      </div>
    </div>
  );
}
