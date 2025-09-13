'use client';
import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Draggable from 'react-draggable';

type Win = 'terminal' | 'synth' | null;
type WState = { z: number; open: boolean };

const Terminal = dynamic(() => import('./Terminal'), { ssr: false });
const Synth = dynamic(() => import('./Synth'), { ssr: false });

export default function WindowHost() {
  const [active, setActive] = useState<Win>(null);
  const [z, setZ] = useState(10);
  const zmap = useRef<Record<string, WState>>({
    terminal: { z: 10, open: false },
    synth: { z: 10, open: false },
  });

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
      <div className="fixed bottom-4 left-4 flex gap-2">
        <button
          className="px-2 py-1 rounded bg-neutral-200"
          onClick={() => open('terminal')}
        >
          Terminal
        </button>
        <button
          className="px-2 py-1 rounded bg-neutral-200"
          onClick={() => open('synth')}
        >
          Synth
        </button>
      </div>
      {zmap.current.terminal.open && (
        <Draggable handle=".win-title" onStart={() => bring('terminal')}>
          <div
            style={{ zIndex: zmap.current.terminal.z }}
            className="fixed top-24 left-12 w-[520px] h-[320px] rounded border bg-background shadow"
          >
            <div className="win-title cursor-move px-2 py-1 border-b">
              Terminal{' '}
              <button onClick={() => close('terminal')} className="float-right">
                ✕
              </button>
            </div>
            <div className="p-2 h-[calc(100%-28px)] overflow-auto">
              <Terminal />
            </div>
          </div>
        </Draggable>
      )}
      {zmap.current.synth.open && (
        <Draggable handle=".win-title" onStart={() => bring('synth')}>
          <div
            style={{ zIndex: zmap.current.synth.z }}
            className="fixed top-40 left-24 w-[520px] h-[320px] rounded border bg-background shadow"
          >
            <div className="win-title cursor-move px-2 py-1 border-b">
              Synth{' '}
              <button onClick={() => close('synth')} className="float-right">
                ✕
              </button>
            </div>
            <div className="p-2 h-[calc(100%-28px)] overflow-auto">
              <Synth />
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
}
