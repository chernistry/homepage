import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import WindowManager from '@/components/macos/WindowManager';

describe('WindowManager', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders dock launcher buttons', () => {
    render(<WindowManager />);
    
    expect(screen.getByTitle('Projects')).toBeInTheDocument();
    expect(screen.getByTitle('Tech')).toBeInTheDocument();
    expect(screen.getByTitle('About')).toBeInTheDocument();
    expect(screen.getByTitle('Terminal')).toBeInTheDocument();
    expect(screen.getByTitle('Synth')).toBeInTheDocument();
  });

  it('opens window when dock button is clicked', () => {
    render(<WindowManager />);
    
    const projectsButton = screen.getByTitle('Projects');
    fireEvent.click(projectsButton);
    
    // Window should appear with title in title bar
    expect(screen.getByText('Projects', { selector: '.title-text' })).toBeInTheDocument();
  });
});
