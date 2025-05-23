'use client';
import './ThemeToggle.css';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Only update the component state after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Always render the toggle, but only make it functional after mounting
  const currentTheme = mounted ? theme : 'light';
  
  return (
    <button 
      className="theme-toggle" 
      onClick={mounted ? handleToggleTheme : undefined} 
      aria-label="Toggle dark mode"
      suppressHydrationWarning
    >
      <div className={`toggle-icon ${currentTheme === 'dark' ? 'dark' : 'light'}`} suppressHydrationWarning>
        <div className="sun-moon">
          <div className="rays"></div>
        </div>
      </div>
    </button>
  );
}