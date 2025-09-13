'use client';

import { useEffect } from 'react';

interface ArticleStylesProps {
  slug: string;
}

const ArticleStyles = ({ slug }: ArticleStylesProps) => {
  useEffect(() => {
    // Check if stylesheet is already loaded
    const existingLink = document.querySelector(`link[data-article-styles="${slug}"]`);
    if (existingLink) return;

    // Create and load stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/blog/${slug}/${slug}.css`; // Adjust path as needed
    link.setAttribute('data-article-styles', slug);
    
    document.head.appendChild(link);
    
    // Cleanup function
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [slug]);

  return null;
};

export default ArticleStyles;