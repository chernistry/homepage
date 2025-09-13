'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __peInitDone?: boolean;
    copyFullArticle?: () => void;
  }
}

const PromptEngineeringInitializer = () => {
  useEffect(() => {
    // Dispatch the article:ready event to trigger initialization
    window.dispatchEvent(new Event('article:ready'));
    
    // Also try to initialize directly if the function exists
    const initEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(initEvent);
  }, []);

  return null;
};

export default PromptEngineeringInitializer;