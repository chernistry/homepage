'use client';
import { create } from 'zustand';

export type MenuItem = {
  id: string;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type Menu = {
  title: string;
  items: MenuItem[];
};

export type MenuState = {
  active: string | null;
  time: string;
  menus: Record<string, Menu>;
  setActive(m: string | null): void;
  tick(): void;
  bind(handler: (id: string) => void): void;
};

export const useMenuStore = create<MenuState>((set, get) => ({
  active: null,
  time: new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }),
  menus: {
    go: {
      title: 'Go',
      items: [
        {
          id: 'home',
          label: 'Home',
          shortcut: '⇧⌘H',
          onClick: () => {
            window.location.href = '/';
          },
        },
        {
          id: 'blog',
          label: 'Blog',
          shortcut: '⇧⌘B',
          onClick: () => {
            window.location.href = '/blog';
          },
        },
      ],
    },
  },
  setActive: (m) => set({ active: m }),
  tick: () =>
    set({
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    }),
  bind: (handler) => {
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.metaKey && e.key.toLowerCase() === 'h')
        handler('home');
      if (e.shiftKey && e.metaKey && e.key.toLowerCase() === 'b')
        handler('blog');
    });
  },
}));
