'use client';
import React from 'react';
import { useEffect } from 'react';
import { useMenuStore } from '@/lib/macos/menuStore';

export default function MenuBar() {
  const { active, setActive, time, tick, menus, bind } = useMenuStore();

  useEffect(() => {
    const id = setInterval(() => tick(), 60_000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    bind((id) => menus.go.items.find((i) => i.id === id)?.onClick?.());
  }, [bind, menus]);

  return (
    <div className="mac-header">
      <div className="mac-header-left">
        <button
          className="mac-btn"
          onClick={() => setActive(active ? '' : 'go')}
        >
          ●
        </button>
        {Object.entries(menus).map(([id, m]) => (
          <div
            key={id}
            className="mac-item"
            onClick={() => setActive(active === id ? null : id)}
          >
            {m.title}
          </div>
        ))}
      </div>
      <div className="mac-header-right" aria-label="Clock">
        {time}
      </div>
    </div>
  );
}
