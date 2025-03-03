import './App.css';
import { useState, useEffect, useRef } from 'react';
import leftFlower from './images/mainPage/leftTopSidesFlower.png';
import rightFlower from './images/mainPage/rightTopSidesFlower.png';
import beeHiveImage from './images/mainPage/beeHiveMainPage.png';
import leftFlowerWithBee from './images/mainPage/leftFlowerWithBee.png';
import honeySpoon from './images/mainPage/honeySpoon.png';
import leftFlyingBee from './images/mainPage/leftFlyingBeeP3.png';
import rightFlyingBee from './images/mainPage/rightFlyingBeeP3.png';
import beeHiveHouse from './images/mainPage/beeHiveHouse.png';
import honeySpoonLast from './images/mainPage/honeySpoonLast.png';
//import leftSideFlowers from './images/mainPage/ leftSideFlowers.png';
//import rightSideFlowers from './images/mainPage/rightSideFlowers.png';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [beeHouseWidth, setBeeHouseWidth] = useState(window.innerWidth <= 768 ? '300px' : '500px');

  // Refs for sections
  const problemTitleRef = useRef(null);
  const problemItemsRef = useRef(null);
  const howItWorksTitleRef = useRef(null);
  const stepsContainerRef = useRef(null);

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width > 768) {
        setMenuOpen(false);
      }
      setBeeHouseWidth(width <= 768 ? '300px' : '400px');
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

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
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
      problemTitleRef.current,
      ...(problemItemsRef.current?.querySelectorAll('.problem-item') || []),
      howItWorksTitleRef.current,
      stepsContainerRef.current
    ].filter(Boolean);

    elements.forEach(element => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      elements.forEach(element => {
        if (element) {
          observer.unobserve(element);
        }
      });
    };
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

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Corner flower decorations */}
      <img src={leftFlower} className="corner-flower corner-flower-left" alt="Decorative flower" />
      <img src={rightFlower} className="corner-flower corner-flower-right" alt="Decorative flower" />
      
      <header className="App-header">
        <div className="header-content">
          <h1 className="logo-text" onClick={() => window.location.reload()}>HiveGuard</h1>
          
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
                  <li><a href="#problem" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'problem')}>The Problem</a></li>
                  <li><a href="#how-it-works" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'how-it-works')}>Our Solution</a></li>
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
                <li><a href="#problem" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'problem')}>The Problem</a></li>
                <li><a href="#how-it-works" className="nav-link" onClick={(e) => handleSmoothScroll(e, 'how-it-works')}>Our Solution</a></li>
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
                <span className="title-regular">Protect Your Hive With IOT</span>
              </h2>
              
              <p className="hero-description">
                HiveGuard offers an innovative IoT-based monitoring system that prevents mold growth in
                beehives. Our smart sensors continuously track temperature and humidity levels, providing real-
                time data through an intuitive dashboard.
              </p>
              
              <button className="login-button">
                <b>Login Now</b>
              </button>
              
              <div className="left-flower-bee-container" style={{ marginLeft: '-180px', position: 'relative', zIndex: 5 }}>
                <img 
                  src={leftFlowerWithBee} 
                  alt="Flower with bee" 
                  className="left-flower-bee" 
                  style={{ maxWidth: '220px', transform: 'scale(1.3)' }}
                />
              </div>
            </div>
            
            <div className="beehive-image-container" style={{ marginRight: '-50px', position: 'relative', zIndex: 4 }}>
              <img src={beeHiveImage} alt="Beehive with monitoring system" className="beehive-image" />
            </div>
          </div>
        </section>

        <section id="problem" className="problem-section">
          <h2 className="section-title" ref={problemTitleRef} style = {{marginTop: windowWidth > 768 ? '150px' : '0px'}}>The Problem</h2>
          <div className="problem-items" ref={problemItemsRef}>
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
            <div className="discover-content">
              <a href="#how-it-works" className="discover-link" onClick={(e) => handleSmoothScroll(e, 'how-it-works')}>
                <h3 className="discover-text">Discover Our Solution</h3>
                <div className="arrow-down">▼</div>
              </a>
            </div>
            <img src={honeySpoon} alt="Honey spoon" className="honey-spoon-image" />
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section" style={{ marginTop: windowWidth > 768 ? '320px' : '100px' }}>
          <h2 className="how-it-works-title" ref={howItWorksTitleRef}>How it works?</h2>
          <div className="steps-container" ref={stepsContainerRef}>
            <div className="step-item">
              <div className="step-content">
               
                <h4 className="step-title">1.Setting sensors</h4>
                <p className="step-description">
                  Using 2 sensors to Measure temperature & humidity inside the beehive
                </p>
              </div>
              <img src={leftFlyingBee} alt="Setting sensors illustration" />
            </div>

            <div className="step-item">
              <div className="step-content">
                <h4 className="step-title">2.Transmitting Data</h4>
                <p className="step-description">
                  Transmit data to the beekeeper's house using MQTT controller with lora1 connection
                </p>
              </div>
              <img src={rightFlyingBee} alt="Data transmission illustration" />
            </div>

            <div className="step-item" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginTop: windowWidth > 768 ? '-100px' : '0px' 
            }}>
              <div className="step-content" style={{ flex: '0 0 50%' }}>
                <h4 className="step-title">3.Monitoring</h4>
                <p className="step-description">
                  Beekeeper checks hive conditions from their houses or anywhere and make decisions
                </p>
              </div>
              <img 
                src={beeHiveHouse} 
                alt="Monitoring illustration" 
                style={{ 
                  width: windowWidth > 768 ? '500px' : '350px',
                  height: 'auto',
                  marginLeft: '250px',
                  flex: '0 0 auto',
                  transition: 'all 0.3s ease',
                  marginTop: windowWidth > 768 ? '-100px' : '0px'
                }} 
              />
            </div>
          </div>
        </section>
        
        <div className="discover-solution" style={{ marginTop: '100px' }}>
          <div className="discover-content">
            <a href="#" className="discover-link">
              <h3 className="discover-text">More Details</h3>
              <div className="arrow-down">▼</div>
            </a>
          </div>
        </div>
        
        <section className="technical-details-section">
          <div className="technical-details-content">
            <p className="technical-description">
              The system begins with a solar panel that converts sunlight into electrical energy, ensuring that in low sunlight conditions, a battery can be used as an alternative power source.
            </p>
            <p className="technical-description">
              An air pump will regulate airflow inside the beehive to maintain proper ventilation. Inside the beehive, two sensors will continuously measure humidity and temperature.
            </p>
            <p className="technical-description">
              Data collected by the sensors will be transmitted using MQTT with an LoRa1 connection to an M5Stack device located in the beekeeper's house. This setup is necessary because the beehive's location lacks internet access. From the beekeeper's house, the data will be forwarded to the Mosquitto cloud service.
            </p>
            <div className="technical-description" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <p style={{ margin: 0 }}>
                Once in the cloud, the data can be processed to generate graphs, charts, and additional insights for the beekeeper. The information will be accessible from anywhere.
              </p>
              <img 
                src={honeySpoonLast} 
                alt="Honey spoon illustration" 
                style={{ 
                  maxWidth: windowWidth > 768 ? '330px' : '200px',
                  height: 'auto',
                  transition: 'all 0.3s ease'
                }} 
              />
            </div>
          </div>
        </section>
        
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="copyright">
            ©2025 Copyright all rights reserved
          </div>
          <div className="contact-info">
            <div className="contact-item">
              <svg className="contact-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              0523339912
            </div>
            <div className="contact-item">
              <svg className="contact-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              temp@gmail.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
