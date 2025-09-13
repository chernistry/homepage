'use client';
import React from 'react';

type DockProps = {
  onLaunch: (windowId: string) => void;
};

const DOCK_ITEMS = [
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'tech', label: 'Tech', icon: '⚙️' },
  { id: 'about', label: 'About', icon: '👤' },
  { id: 'terminal', label: 'Terminal', icon: '💻' },
  { id: 'synth', label: 'Synth', icon: '🎹' },
];

export default function Dock({ onLaunch }: DockProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/10">
      {DOCK_ITEMS.map((item) => (
        <button
          key={item.id}
          className="w-12 h-12 flex items-center justify-center text-xl hover:scale-110 transition-transform duration-200 rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
          onClick={() => onLaunch(item.id)}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
