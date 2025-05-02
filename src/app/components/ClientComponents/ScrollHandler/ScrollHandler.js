'use client';
import { useEffect } from 'react';

export default function ScrollHandler() {
  useEffect(() => {
    const scrollTarget = sessionStorage.getItem('scrollTarget');
    if (scrollTarget) {
      
      const scrollToTarget = () => {
        const element = document.getElementById(scrollTarget);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          sessionStorage.removeItem('scrollTarget');
        }
      };

      // Try to scroll immediately if document is ready
      if (document.readyState === 'complete') {
        scrollToTarget();
      } else {
        // If document is not ready, wait for a shorter time
        setTimeout(scrollToTarget, 350);
      }
    }
  }, []);

  return null; 
} 