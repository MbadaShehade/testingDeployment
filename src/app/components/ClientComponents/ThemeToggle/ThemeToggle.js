'use client';
import './ThemeToggle.css';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Only show the toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Render a placeholder with the same dimensions during SSR
  if (!mounted) {
    return <div className="theme-toggle-placeholder" aria-hidden="true" />;
  }

  return (
    <button 
      className="theme-toggle" 
      onClick={handleToggleTheme} 
      aria-label="Toggle dark mode"
      suppressHydrationWarning
    >
      <div className={`toggle-icon ${theme === 'dark' ? 'dark' : 'light'}`} suppressHydrationWarning>
        <div className="sun-moon">
          <div className="rays"></div>
        </div>
      </div>
    </button>
  );
}