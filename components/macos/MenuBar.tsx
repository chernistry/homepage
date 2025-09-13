'use client';
import React from 'react';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useMenuStore } from '@/lib/macos/menuStore';

export default function MenuBar() {
  const { active, setActive, time, tick, menus, bind } = useMenuStore();
  const { theme, setTheme } = useTheme();

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
          <div key={id} className="relative">
            <div
              className="mac-item"
              onClick={() => setActive(active === id ? null : id)}
            >
              {m.title}
            </div>
            {active === id && (
              <div className="absolute top-full left-0 bg-white dark:bg-gray-800 border rounded shadow-lg py-1 min-w-[120px] z-50">
                {m.items.map((item) => (
                  <button
                    key={item.id}
                    className="w-full px-3 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between"
                    onClick={() => {
                      item.onClick?.();
                      setActive(null);
                    }}
                    disabled={item.disabled}
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
        ))}
        <button
          className="mac-item"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      <div className="mac-header-right" aria-label="Clock">
        {time}
      </div>
    </div>
  );
}
