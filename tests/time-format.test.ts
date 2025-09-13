import { describe, it, expect } from 'vitest';

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

describe('formatTime', () => {
  it('formats time in HH:mm 24-hour format', () => {
    const testDate = new Date('2023-01-01T14:30:00');
    const result = formatTime(testDate);
    expect(result).toBe('14:30');
  });

  it('handles midnight correctly', () => {
    const testDate = new Date('2023-01-01T00:00:00');
    const result = formatTime(testDate);
    expect(result).toBe('00:00');
  });

  it('handles noon correctly', () => {
    const testDate = new Date('2023-01-01T12:00:00');
    const result = formatTime(testDate);
    expect(result).toBe('12:00');
  });
});
