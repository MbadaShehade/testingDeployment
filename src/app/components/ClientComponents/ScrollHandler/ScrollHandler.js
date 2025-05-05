'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run this on the homepage
    if (pathname !== '/') return;

    const scrollTarget = sessionStorage.getItem('scrollTarget');
    if (scrollTarget) {
      const element = document.getElementById(scrollTarget);
      if (element) {
        // Scroll immediately without delay
        element.scrollIntoView({ behavior: 'smooth' });
        sessionStorage.removeItem('scrollTarget');
      }
    } else if (window.location.hash) {
      // Handle direct URL with hash (e.g., /#problem)
      const targetId = window.location.hash.substring(1);
      const element = document.getElementById(targetId);
      
      if (element) {
        // Scroll immediately without delay
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname]);

  return null; 
} 