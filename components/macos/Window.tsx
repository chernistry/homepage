'use client';
import React from 'react';
import Draggable from 'react-draggable';
import type { ReactNode } from 'react';

export type WinProps = {
  id: string;
  title: string;
  z: number;
  onClose: () => void;
  onMaximize: () => void;
  onClick: () => void;
  children: ReactNode;
};

export default function Window({
  id,
  title,
  z,
  onClose,
  onMaximize,
  onClick,
  children,
}: WinProps) {
  return (
    <Draggable handle=".title-bar">
      <div
        id={id}
        style={{ zIndex: z }}
        className="fixed top-40 left-40 w-[640px] h-[420px] rounded border bg-background shadow"
      >
        <div
          className="title-bar cursor-move px-2 py-1 border-b flex items-center gap-2"
          onMouseDown={onClick}
        >
          <span
            className="window-button close-button w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer flex items-center justify-center text-xs text-red-900 hover:text-red-800"
            onClick={onClose}
          >
            ×
          </span>
          <span
            className="window-button minimize-button w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer flex items-center justify-center text-xs text-yellow-900 hover:text-yellow-800"
            onClick={onClose}
          >
            −
          </span>
          <span
            className="window-button maximize-button w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer flex items-center justify-center text-xs text-green-900 hover:text-green-800"
            onClick={onMaximize}
          >
            +
          </span>
          <div className="title-text ml-2 text-sm">{title}</div>
        </div>
        <div className="p-2 h-[calc(100%-28px)] overflow-auto">{children}</div>
        <div className="resize-handle" />
      </div>
    </Draggable>
  );
}
