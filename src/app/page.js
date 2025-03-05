import './globals.css';
import Image from 'next/image';
import Header from './components/ClientComponents/Header';
import Footer from './components/ServerComponents/Footer';
import MoreDetails from './components/ServerComponents/MoreDetails';
import ScrollAnimations from './components/ClientComponents/ScrollAnimations';
import LoginButton from './components/ClientComponents/LoginButton';
import DiscoverLink from './components/ClientComponents/DiscoverLink';
import beeHiveImage from '/public/beeHiveMainPage.png';
import leftFlowerWithBee from '/public/leftFlowerWithBee.png';
import honeySpoon from '/public/honeySpoon.png';
import leftFlyingBee from '/public/leftFlyingBeeP3.png';
import rightFlyingBee from '/public/rightFlyingBeeP3.png';
import beeHiveHouse from '/public/beeHiveHouse.png';

export default function Home() {
  return (
    <div className="App">
      <Header />
      <ScrollAnimations />

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
              
              <LoginButton />
              
              <div className="left-flower-bee-container">
                <Image 
                  src={leftFlowerWithBee} 
                  alt="Flower with bee" 
                  className="left-flower-bee" 
                  style={{ maxWidth: '220px', transform: 'scale(1.3)' }}
                  width={220}
                  height={220}
                />
              </div>
            </div>
            
            <div className="beehive-image-container">
              <Image 
                src={beeHiveImage} 
                alt="Beehive with monitoring system" 
                className="beehive-image" 
                width={400} 
                height={400} 
              />
            </div>
          </div>
        </section>

        <section id="problem" className="problem-section lg:mt-12">
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
            <DiscoverLink />
            <Image src={honeySpoon} alt="Honey spoon" className="honey-spoon-image" width={300} height={400} />
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <h2 className="how-it-works-title">How it works?</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-content">
                <h4 className="step-title">1.Setting sensors</h4>
                <p className="step-description">
                  Using 2 sensors to Measure temperature & humidity inside the beehive
                </p>
              </div>
              <Image src={leftFlyingBee} alt="Setting sensors illustration" width={200} height={200} />
            </div>

            <div className="step-item">
              <div className="step-content">
                <h4 className="step-title">2.Transmitting Data</h4>
                <p className="step-description">
                  Transmit data to the beekeeper's house using MQTT controller with lora1 connection
                </p>
              </div>
              <Image src={rightFlyingBee} alt="Data transmission illustration" width={200} height={200} />
            </div>

            <div className="step-item">
              <div className="step-content">
                <h4 className="step-title">3.Monitoring</h4>
                <p className="step-description">
                  Beekeeper checks hive conditions from their houses or anywhere and make decisions
                </p>
              </div>
              <Image 
                src={beeHiveHouse} 
                alt="Monitoring illustration" 
                className="monitoring-image"
                style={{ 
                  height: 'auto',
                  marginLeft: '250px',
                  flex: '0 0 auto'
                }} 
                width={500}
                height={500}
              />
            </div>
          </div>
        </section>
      
        <MoreDetails />
      </main>
      <Footer />
    </div>
  );
} 