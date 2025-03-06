import './HowItWorksSection.css';
import Image from 'next/image';
import leftFlyingBee from '/public/leftFlyingBeeP3.png';
import rightFlyingBee from '/public/rightFlyingBeeP3.png';
import beeHiveHouse from '/public/beeHiveHouse.png';
import MoreDetailsLink from '../../ClientComponents/MoreDetailsLink/MoreDetailsLink';

export default function HowItWorksSection() {
  return (
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
            <Image 
              src={rightFlyingBee} 
              alt="Setting sensors illustration" 
              width={200} 
              height={200}
              style={{
                marginLeft: 'auto',
                marginTop:'-90px',
                objectFit: 'contain', // Preserves aspect ratio
                width: '300px', // Force width
                height: '300px' // Force height
              }}
            />
        </div>

        <div className="step-itemLeft">
            <div className="step-content">
            <h4 className="step-title">2.Transmitting Data</h4>
            <p className="step-description">
                Transmit data to the beekeeper&apos;s house using MQTT controller with lora1 connection
            </p>
            </div>
            <Image 
              src={leftFlyingBee} 
              alt="Data transmission illustration" 
              width={200} 
              height={200} 
              style={{
                marginLeft:'-400px', 
                marginTop:'0px',
                objectFit: 'contain', // Preserves aspect ratio
                width: '200px', // Force width
                height: '300px' // Force height
              }} 
            />
        </div>

        <div className="step-item">
            <div className="step-content">
            <h4 className="step-title monitoring-title" style={{ fontWeight: 'bold', letterSpacing: '0.5px', minWidth: '200px' }}>3.Monitoring</h4>
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
                marginLeft: '850px',
                flex: '0 0 auto',
                marginTop:'-300px'
            }} 
            width={500}
            height={500}
            />
        </div>
        
        <div className="more-details-container">
            <MoreDetailsLink />
        </div>
        </div>
    </section>
);
}