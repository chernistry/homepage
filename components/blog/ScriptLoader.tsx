'use client';

import { useEffect } from 'react';

interface ScriptLoaderProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ScriptLoader = ({ src, onLoad, onError }: ScriptLoaderProps) => {
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      if (onLoad) onLoad();
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    if (onLoad) {
      script.onload = onLoad;
    }
    
    if (onError) {
      script.onerror = onError;
    }
    
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [src, onLoad, onError]);

  return null;
};

export default ScriptLoader;