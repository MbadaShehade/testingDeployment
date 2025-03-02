import './App.css';
import { useState, useEffect } from 'react';
import leftFlower from './images/mainPage/leftTopSidesFlower.png';
import rightFlower from './images/mainPage/rightTopSidesFlower.png';
import beeHiveImage from './images/mainPage/beeHiveMainPage.png';
import leftFlowerWithBee from './images/mainPage/leftFlowerWithBee.png';
import leftSideFlowers from './images/mainPage/ leftSideFlowers.png';
import rightSideFlowers from './images/mainPage/rightSideFlowers.png';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Control flower visibility based on scroll position
  useEffect(() => {
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
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'English' ? 'Hebrew' : 'English');
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Corner flower decorations */}
      <img src={leftFlower} className="corner-flower corner-flower-left" alt="Decorative flower" />
      <img src={rightFlower} className="corner-flower corner-flower-right" alt="Decorative flower" />
      
      <header className="App-header">
        <div className="header-content">
          <h1 className="logo-text">HiveGuard</h1>
          
          {windowWidth <= 768 ? (
            <div className="hamburger-menu" onClick={toggleMenu}>
              <div className={`hamburger ${menuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (
            <>
              <nav className="desktop-nav">
                <ul className="nav-links">
                  <li><a href="#problem" className="nav-link">The Problem</a></li>
                  <li><a href="#solution" className="nav-link">Our Solution</a></li>
                </ul>
              </nav>

              <div className="header-controls">
                <div className="language-selector" onClick={toggleLanguage}>
                  <div className="globe-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>{language}</span>
                  <span className="dropdown-arrow">▼</span>
                </div>
                
                <button className="theme-toggle" onClick={toggleTheme}>
                  <div className={`toggle-icon ${isDarkMode ? 'dark' : 'light'}`}>
                    <div className="sun-moon">
                      <div className="rays"></div>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Mobile menu dropdown */}
        {windowWidth <= 768 && menuOpen && (
          <div className="mobile-menu">
            <nav>
              <ul className="mobile-nav-links">
                <li><a href="#problem" className="nav-link" onClick={() => setMenuOpen(false)}>The Problem</a></li>
                <li><a href="#solution" className="nav-link" onClick={() => setMenuOpen(false)}>Our Solution</a></li>
              </ul>
            </nav>
            <div className="mobile-header-controls">
              <div className="language-selector" onClick={toggleLanguage}>
                <div className="globe-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>{language}</span>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              <button className="theme-toggle" onClick={toggleTheme}>
                <div className={`toggle-icon ${isDarkMode ? 'dark' : 'light'}`}>
                  <div className="sun-moon">
                    <div className="rays"></div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content-wrapper">
            <div className="hero-text-content">
              <h2 className="main-title">
                <span className="title-regular">Protect Your Hive with IoT</span>
              </h2>
              
              <p className="hero-description">
                HiveGuard offers an innovative IoT-based monitoring system that prevents mold growth in
                beehives. Our smart sensors continuously track temperature and humidity levels, providing real-
                time data through an intuitive dashboard
              </p>
              
              <button className="login-button">
                <b>log in now</b>
              </button>
              
              <div className="left-flower-bee-container">
                <img src={leftFlowerWithBee} alt="Flower with bee" className="left-flower-bee" />
              </div>
            </div>
            
            <div className="beehive-image-container">
              <img src={beeHiveImage} alt="Beehive with monitoring system" className="beehive-image" />
            </div>
          </div>
        </section>

        <section id="problem" className="problem-section">
          {/* Side flower decorations for problem section */}
          <img src={leftSideFlowers} className="side-flower side-flower-left" alt="Left side decorative flowers" />
          <img src={rightSideFlowers} className="side-flower side-flower-right" alt="Right side decorative flowers" />
          
          <h2 className="section-title">The Problem</h2>
          
          <div className="problem-items">
            <div className="problem-item">
              <h3 className="problem-subtitle">Weather changes</h3>
              <p className="problem-description">High humidity in winter promotes mold growth in beehives. When moisture levels exceed 60% during colder months, conditions become ideal for various mold species to flourish.</p>
            </div>
            
            <div className="problem-item">
              <h3 className="problem-subtitle">Health Impact</h3>
              <p className="problem-description">Mold affects the quality of stored honey that we consume, potentially introducing harmful compounds. These contaminants can alter honey's flavor, reduce its nutritional benefits, and pose health risks to consumers.</p>
            </div>
            
            <div className="problem-item">
              <h3 className="problem-subtitle">Colony Collapse</h3>
              <p className="problem-description">Persistent mold makes hives uninhabitable for bees, forcing colonies to abandon their homes. Mold-infested hives weaken the colony's immune system, making bees more susceptible to parasites and other pathogens.</p>
            </div>
            
            <div className="problem-item">
              <h3 className="problem-subtitle">Reduce Productivity</h3>
              <p className="problem-description">Bees expend more energy removing moldy combs instead of collecting nectar or producing honey. This diverts up to 30% of the colony's workforce, dramatically reducing honey yields and pollination efficiency.</p>
            </div>
          </div>
          
          <div className="discover-solution">
            <a href="#solution" className="discover-link">
              <h3 className="discover-text">Discover Our Solution</h3>
              <div className="arrow-down">▼</div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
