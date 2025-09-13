
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Dock from './Dock';
import Window from './Window';
import AboutMe from './AboutMe';
import TrustedBy from '@/components/TrustedBy';

interface App {
  id: string;
  title: string;
  component: React.ReactNode;
  initialSize?: { width: number | string; height: number | string };
  position: { x: number; y: number };
}

const getInitialPosition = (initialSize: any) => {
  if (typeof window !== 'undefined') {
    const x = (window.innerWidth - (initialSize?.width || 700)) / 2;
    const y = (window.innerHeight - (initialSize?.height || 600)) / 2;
    return { x, y };
  }
  return { x: 200, y: 100 };
};

const initialApps: App[] = [
  {
    id: 'about',
    title: 'About Me',
    component: <AboutMe />,
    initialSize: { width: 700, height: 600 },
    position: getInitialPosition({ width: 700, height: 600 }),
  },
];

const Desktop = () => {
  const [openWindows, setOpenWindows] = useState<App[]>(initialApps);
  const desktopRef = useRef<HTMLDivElement>(null);

  const openApp = (id: string) => {
    const app = initialApps.find(app => app.id === id);
    if (app && !openWindows.find(w => w.id === id)) {
      setOpenWindows([...openWindows, app]);
    }
  };

  const closeApp = (id: string) => {
    setOpenWindows(openWindows.filter(w => w.id !== id));
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setOpenWindows(
      openWindows.map(app => (app.id === id ? { ...app, position } : app))
    );
  };

  return (
    <div ref={desktopRef} className="w-screen h-screen bg-cover bg-center" style={{backgroundImage: "url('/images/wallpaper.jpg')"}}>
      {openWindows.map(app => (
        <Window 
          key={app.id} 
          title={app.title} 
          onClose={() => closeApp(app.id)}
          position={app.position}
          onDrag={(position) => updateWindowPosition(app.id, position)}
          initialSize={app.initialSize}
        >
          {app.component}
        </Window>
      ))}
      <Dock openApp={openApp} />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <TrustedBy />
      </div>
    </div>
  );
};

export default Desktop;
