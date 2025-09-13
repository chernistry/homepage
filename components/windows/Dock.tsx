"use client";

import React from 'react';
import { User, Book, EnvelopeSimple, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';

interface DockProps {
  openApp: (id: string) => void;
}

const Dock: React.FC<DockProps> = ({ openApp }) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
      <div className="flex items-center justify-center gap-4 p-2 bg-white/30 dark:bg-black/30 backdrop-blur-xl rounded-2xl shadow-lg">
        <button onClick={() => openApp('about')} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/50">
          <User size={32} />
        </button>
        <a href="#" className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/50">
          <LinkedinLogo size={32} />
        </a>
        <a href="#" className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/50">
          <GithubLogo size={32} />
        </a>
        <a href="#" className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/50">
          <EnvelopeSimple size={32} />
        </a>
        <a href="#" className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/50">
          <Book size={32} />
        </a>
      </div>
    </div>
  );
};

export default Dock;