'use client';
import './Navigation.css';
import { useState, useEffect, useRef } from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation({ isLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Handle page refresh - always start from top
    if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
      window.scrollTo(0, 0);
      if (window.location.hash) {
        router.replace('/');
      }
    } 
    // Handle navigation from other pages (like /login)
    else if (window.location.hash && pathname === '/') {
      const targetId = window.location.hash.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        // Give time for the page to properly load and render
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }

    // 1. menuOpen - the menu must currently be open
    // 2. menuRef.current exists - the menu DOM element must be rendered
    // 3. click was not inside menu - event.target is not contained in menuRef
    // 4. click was not on hamburger - event.target is not contained in hamburgerRef
    const handleClickOutside = (event) => {
      if (menuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          hamburgerRef.current &&
          !hamburgerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    //event listener to close menu when clicking outside
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleSmoothScroll = async (e, targetId) => {
    e.preventDefault();
    
    // If we're not on the home page, navigate to home page with hash
    if (pathname !== '/') {
      // Store the target section in sessionStorage
      sessionStorage.setItem('scrollTarget', targetId);
      await router.push('/');
      
      // After navigation, check for stored target and scroll
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          // Clear the stored target
          sessionStorage.removeItem('scrollTarget');
        }, 350);
      }
      
      if (menuOpen) {
        setMenuOpen(false);
      }
      return;
    }
    
    // If we're already on the home page, just scroll to the element
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
      {isLoggedIn ? (
        <>
          {windowWidth <= 700 ? (
            <>
              <div className="mobile-header-controls">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </>
          ) : (
            <>
              <div className="header-controls">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {windowWidth <= 1420 ? (
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
              <nav>
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
      )}
    </>
  );
}