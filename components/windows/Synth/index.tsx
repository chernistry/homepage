import React, { useState } from 'react';

export default function Synth() {
  const [volume, setVolume] = useState(0.7);
  
  const pads = [
    'C', 'C#', 'D', 'D#',
    'E', 'F', 'F#', 'G',
    'G#', 'A', 'A#', 'B',
    'C2', 'C#2', 'D2', 'D#2'
  ];

  const handlePadClick = (note: string) => {
    // Placeholder for future audio implementation
    console.log(`Playing note: ${note} at volume: ${volume}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {pads.map((note, i) => (
          <button
            key={note}
            onClick={() => handlePadClick(note)}
            className="h-12 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm font-mono transition-colors active:scale-95"
          >
            {note}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-3">
        <label htmlFor="volume" className="text-sm font-medium">Volume:</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm w-12">{Math.round(volume * 100)}%</span>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Audio synthesis coming in future updates
      </div>
    </div>
  );
}
