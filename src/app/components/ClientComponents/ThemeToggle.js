'use client';

import { useState } from 'react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Update the root App class
    document.querySelector('.App')?.classList.toggle('dark-mode');
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      <div className={`toggle-icon ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="sun-moon">
          <div className="rays"></div>
        </div>
      </div>
    </button>
  );
} 