import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ChatWidget from '@/components/ChatWidget';

describe('ChatWidget', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with proper accessibility labels', () => {
    render(<ChatWidget />);
    expect(screen.getByLabelText('Ask about my resume')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('disables send button when query is too short', () => {
    render(<ChatWidget />);
    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
  });
});
