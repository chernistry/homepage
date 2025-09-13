'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import Window from '@/components/macos/Window';
import Dock from '@/components/macos/Dock';

type WId = 'projects' | 'tech' | 'about' | 'terminal' | 'synth';
type WRec = { id: WId; title: string; comp: React.ComponentType };

const lazy = (p: string) => dynamic(() => import(p));

const DEFS: WRec[] = [
  { id: 'projects', title: 'Projects', comp: lazy('@/components/windows/Projects') },
  { id: 'tech', title: 'Tech', comp: lazy('@/components/windows/Tech') },
  { id: 'about', title: 'About', comp: lazy('@/components/windows/About') },
  { id: 'terminal', title: 'Terminal', comp: lazy('@/components/windows/Terminal') },
  { id: 'synth', title: 'Synthesizer', comp: lazy('@/components/windows/Synth') },
];

export default function WindowManager() {
  const z = useRef(10);
  const [open, setOpen] = useState<Record<WId, { open: boolean; z: number }>>({
    projects: { open: false, z: 10 },
    tech: { open: false, z: 10 },
    about: { open: false, z: 10 },
    terminal: { open: false, z: 10 },
    synth: { open: false, z: 10 },
  });

  // Load window state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('windowState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOpen(parsed);
      } catch (e) {
        // Ignore invalid saved state
      }
    }
  }, []);

  // Save window state to localStorage
  useEffect(() => {
    localStorage.setItem('windowState', JSON.stringify(open));
  }, [open]);

  const bring = (id: WId) =>
    setOpen((s) => ({ ...s, [id]: { ...s[id], z: (z.current += 1) } }));
  const show = (id: WId) =>
    setOpen((s) => ({ ...s, [id]: { open: true, z: (z.current += 1) } }));
  const hide = (id: WId) =>
    setOpen((s) => ({ ...s, [id]: { ...s[id], open: false } }));

  return (
    <>
      <Dock onLaunch={(id) => show(id as WId)} />
      {DEFS.map(({ id, title, comp: Comp }) =>
        open[id as WId]?.open ? (
          <Window
            key={id}
            id={`${id}-window`}
            title={title}
            z={open[id as WId].z}
            onClose={() => hide(id as WId)}
            onMaximize={() => bring(id as WId)}
            onClick={() => bring(id as WId)}
          >
            <Comp />
          </Window>
        ) : null
      )}
    </>
  );
}
