'use client';
import './Navigation.css';
import { useState, useEffect, useRef } from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    //auto-close the mobile menu when switching to a larger screen.
    window.addEventListener('resize', handleResize);


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

    // Handle hash navigation when coming from another page
    if (window.location.hash) {
      setTimeout(() => {
        const targetId = window.location.hash.substring(1);
        const element = document.getElementById(targetId);
        if (element) {
          window.scrollTo({
            top: 0,
            behavior: 'auto'
          });
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }, 300);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    
    // If we're not on the home page, navigate to home page with hash
    if (pathname !== '/') {
      router.push(`/#${targetId}`);
      if (menuOpen) {
        setMenuOpen(false);
      }
      return;
    }
    
    // If we're already on the home page, just scroll to the element
    const element = document.getElementById(targetId);
    if (element) {
      // First scroll to top, then to the element for better UX
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
      
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
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
  );
} 