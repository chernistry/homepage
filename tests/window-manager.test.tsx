import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import WindowManager from '@/components/macos/WindowManager';

describe('WindowManager', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders window launcher buttons', () => {
    render(<WindowManager />);
    
    expect(screen.getByRole('button', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tech' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terminal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Synthesizer' })).toBeInTheDocument();
  });

  it('opens window when button is clicked', () => {
    render(<WindowManager />);
    
    const projectsButton = screen.getByRole('button', { name: 'Projects' });
    fireEvent.click(projectsButton);
    
    // Window should appear with title in title bar
    expect(screen.getByText('Projects', { selector: '.title-text' })).toBeInTheDocument();
  });
});
