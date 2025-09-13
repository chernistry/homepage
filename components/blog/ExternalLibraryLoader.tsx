'use client';

import { useEffect, useState } from 'react';
import ScriptLoader from './ScriptLoader';

interface ExternalLibraryLoaderProps {
  libraries: {
    src: string;
    name: string;
    globalVar?: string;
  }[];
  onLoaded?: () => void;
}

const ExternalLibraryLoader = ({ libraries, onLoaded }: ExternalLibraryLoaderProps) => {
  const [loadedLibraries, setLoadedLibraries] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Check if all libraries are loaded
    const allLoaded = libraries.every(lib => loadedLibraries[lib.name]);
    if (allLoaded && onLoaded) {
      onLoaded();
    }
  }, [loadedLibraries, libraries, onLoaded]);
  
  const handleLibraryLoad = (libraryName: string) => {
    setLoadedLibraries(prev => ({
      ...prev,
      [libraryName]: true
    }));
  };
  
  return (
    <>
      {libraries.map((library) => (
        <ScriptLoader
          key={library.name}
          src={library.src}
          onLoad={() => handleLibraryLoad(library.name)}
        />
      ))}
    </>
  );
};

export default ExternalLibraryLoader;