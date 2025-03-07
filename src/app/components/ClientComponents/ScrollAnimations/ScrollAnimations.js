'use client';

import { useEffect } from 'react';

export default function ScrollAnimations() {
  useEffect(() => {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe all section elements
    const elements = [
      document.querySelector('.section-title'),
      ...document.querySelectorAll('.problem-item'),
      document.querySelector('.how-it-works-title'),
      document.querySelector('.steps-container')
    ].filter(Boolean);

    elements.forEach(element => {
      if (element) {
        observer.observe(element);
      }
    });

    // Control flower visibility based on scroll position
    const handleScroll = () => {
      const problemSection = document.getElementById('problem');
      const flowers = document.querySelectorAll('.side-flower');
      
      if (problemSection) {
        const rect = problemSection.getBoundingClientRect();
        const isVisible = 
          rect.top < window.innerHeight && 
          rect.bottom > 0;
        
        flowers.forEach(flower => {
          flower.style.opacity = isVisible ? '1' : '0';
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      elements.forEach(element => {
        if (element) {
          observer.unobserve(element);
        }
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null; // This component doesn't render anything
}