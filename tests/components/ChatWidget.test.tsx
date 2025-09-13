import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWidget from '@/components/ChatWidget';

// Mock fetch
global.fetch = jest.fn();

describe('ChatWidget', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should render with proper accessibility labels', () => {
    render(<ChatWidget />);
    
    expect(screen.getByLabelText('Ask about my resume')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('should disable send button when input is too short', () => {
    render(<ChatWidget />);
    
    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
    
    const textarea = screen.getByLabelText('Ask about my resume');
    fireEvent.change(textarea, { target: { value: 'hi' } });
    expect(button).toBeDisabled();
    
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    expect(button).not.toBeDisabled();
  });

  it('should send message on Enter key', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ answer: 'Test response', sources: [] }),
    });

    render(<ChatWidget />);
    
    const textarea = screen.getByLabelText('Ask about my resume');
    fireEvent.change(textarea, { target: { value: 'test query' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/rag', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query: 'test query' }),
      }));
    });
  });

  it('should show error message on network failure', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ChatWidget />);
    
    const textarea = screen.getByLabelText('Ask about my resume');
    fireEvent.change(textarea, { target: { value: 'test query' } });
    
    const button = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error — try again');
    });
  });

  it('should display conversation messages', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        answer: 'I have experience with Python', 
        sources: [{ title: 'Resume', url: '/resume' }] 
      }),
    });

    render(<ChatWidget />);
    
    const textarea = screen.getByLabelText('Ask about my resume');
    fireEvent.change(textarea, { target: { value: 'Python experience?' } });
    
    const button = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Python experience?')).toBeInTheDocument();
      expect(screen.getByText('I have experience with Python')).toBeInTheDocument();
      expect(screen.getByText('Sources:')).toBeInTheDocument();
    });
  });
});
