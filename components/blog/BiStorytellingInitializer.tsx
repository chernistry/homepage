'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __initBiStorytelling?: () => void;
  }
}

const BiStorytellingInitializer = () => {
  useEffect(() => {
    // Check if the initialization function exists and call it
    if (window.__initBiStorytelling) {
      window.__initBiStorytelling();
    } else {
      // If not available yet, wait a bit and try again
      const timer = setTimeout(() => {
        if (window.__initBiStorytelling) {
          window.__initBiStorytelling();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};

export default BiStorytellingInitializer;