'use client';
import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Draggable from 'react-draggable';

type Win = 'terminal' | 'synth' | null;
type WState = { z: number; open: boolean };

const Terminal = dynamic(() => import('./Terminal'), { ssr: false });
const Synth = dynamic(() => import('./Synth'), { ssr: false });

const WINDOWS = [
  { id: 'terminal', title: 'Terminal', component: Terminal, icon: '💻' },
  { id: 'synth', title: 'Synthesizer', component: Synth, icon: '🎹' },
] as const;

export default function WindowHost() {
  const [active, setActive] = useState<Win>(null);
  const [z, setZ] = useState(10);
  const zmap = useRef<Record<string, WState>>({
    terminal: { z: 10, open: false },
    synth: { z: 10, open: false },
  });

  // Load window state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('windowState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(zmap.current, parsed);
      } catch (e) {
        // Ignore invalid saved state
      }
    }
  }, []);

  // Save window state to localStorage
  useEffect(() => {
    localStorage.setItem('windowState', JSON.stringify(zmap.current));
  }, [zmap.current]);

  function open(w: Exclude<Win, null>) {
    zmap.current[w].open = true;
    bring(w);
    setActive(w);
  }

  function close(w: Exclude<Win, null>) {
    zmap.current[w].open = false;
    if (active === w) setActive(null);
  }

  function bring(w: Exclude<Win, null>) {
    const nz = z + 1;
    zmap.current[w].z = nz;
    setZ(nz);
  }

  return (
    <div>
      {/* Dock */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/10">
        {WINDOWS.map((win) => (
          <button
            key={win.id}
            className="w-12 h-12 flex items-center justify-center text-xl hover:scale-110 transition-transform duration-200 rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
            onClick={() => open(win.id as Exclude<Win, null>)}
            title={win.title}
          >
            {win.icon}
          </button>
        ))}
      </div>

      {/* Windows */}
      {WINDOWS.map((win) => {
        const Component = win.component;
        const isOpen = zmap.current[win.id]?.open;
        if (!isOpen) return null;

        return (
          <Draggable key={win.id} handle=".title-bar" onStart={() => bring(win.id as Exclude<Win, null>)}>
            <div
              style={{ zIndex: zmap.current[win.id].z }}
              className="fixed top-40 left-40 w-[640px] h-[420px] rounded border bg-background shadow"
            >
              <div className="title-bar cursor-move px-2 py-1 border-b flex items-center gap-2">
                <span
                  className="window-button close-button w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer flex items-center justify-center text-xs text-red-900 hover:text-red-800"
                  onClick={() => close(win.id as Exclude<Win, null>)}
                >
                  ×
                </span>
                <span
                  className="window-button minimize-button w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer flex items-center justify-center text-xs text-yellow-900 hover:text-yellow-800"
                  onClick={() => close(win.id as Exclude<Win, null>)}
                >
                  −
                </span>
                <span
                  className="window-button maximize-button w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer flex items-center justify-center text-xs text-green-900 hover:text-green-800"
                  onClick={() => bring(win.id as Exclude<Win, null>)}
                >
                  +
                </span>
                <div className="title-text ml-2 text-sm">{win.title}</div>
              </div>
              <div className="p-2 h-[calc(100%-28px)] overflow-auto">
                <Component />
              </div>
            </div>
          </Draggable>
        );
      })}
    </div>
  );
}
