'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Formats a Date object to HH:mm format (24-hour)
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * macOS-style header with navigation and live clock
 */
export default function MacHeader() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const updateTime = () => setTime(formatTime(new Date()));
    const intervalId = setInterval(updateTime, 60_000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="mac-header">
      <div className="mac-header-left">
        <Link href="/" className="mac-btn mac-item">
          ●
        </Link>
        <Link href="/" className="mac-item">
          Home
        </Link>
      </div>
      <div className="mac-header-right" aria-label={`Current time: ${time}`}>
        {time}
      </div>
    </div>
  );
}
