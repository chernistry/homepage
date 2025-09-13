
"use client";

import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  position: { x: number; y: number };
  onDrag: (position: { x: number; y: number }) => void;
  initialSize?: { width: number | string; height: number | string };
}

const Window: React.FC<WindowProps> = ({ title, children, onClose, position, onDrag, initialSize }) => {
  const [size, setSize] = useState({
    width: initialSize?.width || 500,
    height: initialSize?.height || 500,
  });
  const nodeRef = useRef(null);

  const onResize = (event: any, { size }: any) => {
    setSize({ width: size.width, height: size.height });
  };

  return (
    <Draggable 
      handle=".window-header" 
      nodeRef={nodeRef} 
      position={position} 
      onStop={(e, data) => onDrag({ x: data.x, y: data.y })}
    >
      <div ref={nodeRef} className="absolute">
        <Resizable
          width={typeof size.width === 'string' ? parseInt(size.width) : size.width}
          height={typeof size.height === 'string' ? parseInt(size.height) : size.height}
          onResize={onResize}
        >
          <div
            className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-lg shadow-lg flex flex-col"
            style={{ width: size.width, height: size.height }}
          >
            <div className="window-header h-7 bg-gray-200/80 dark:bg-gray-800/80 rounded-t-lg flex items-center px-2 cursor-move flex-shrink-0">
              <div className="flex gap-1.5">
                <button onClick={onClose} className="w-3 h-3 bg-red-500 rounded-full"></button>
                <button className="w-3 h-3 bg-yellow-500 rounded-full"></button>
                <button className="w-3 h-3 bg-green-500 rounded-full"></button>
              </div>
              <div className="flex-1 text-center text-sm font-medium text-gray-700 dark:text-gray-200 pr-12">
                {title}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {children}
            </div>
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
};

export default Window;
