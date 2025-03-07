'use client';
import { useEffect } from 'react';

export default function ScrollHandler() {
  useEffect(() => {
    // Check if there's a stored scroll target
    const scrollTarget = sessionStorage.getItem('scrollTarget');
    if (scrollTarget) {
      // Function to attempt scrolling
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

  return null; // This component doesn't render anything
} 