'use client';

import { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Add click event listener to handle clicks outside the menu
    const handleClickOutside = (event) => {
      if (menuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          hamburgerRef.current &&
          !hamburgerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (menuOpen) {
        setMenuOpen(false);
      }
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {windowWidth <= 768 ? (
        <>
          <div className="hamburger-menu" onClick={toggleMenu} ref={hamburgerRef}>
            <div className={`hamburger ${menuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {menuOpen && (
            <div className="mobile-menu" ref={menuRef}>
              <nav>
                <ul className="mobile-nav-links">
                  <li><a href="#problem" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'problem')}><i>The Problem</i></a></li>
                  <li><a href="#how-it-works" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'how-it-works')}><i>Our Solution</i></a></li>
                </ul>
              </nav>
              <div className="mobile-header-controls">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li><a href="#problem" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'problem')}><i>The Problem</i></a></li>
              <li><a href="#how-it-works" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'how-it-works')}><i>Our Solution</i></a></li>
            </ul>
          </nav>
          <div className="header-controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </>
      )}
    </>
  );
} 