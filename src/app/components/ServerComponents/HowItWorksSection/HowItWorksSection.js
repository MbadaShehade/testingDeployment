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
            <div className="step-item1">
                <h4 className="step-title">1.Setting sensors</h4>
                <p className="step-description"> Using 2 sensors to Measure temperature & humidity inside the beehive</p>
            </div>
            <Image 
            src={rightFlyingBee} 
            alt="Setting sensors illustration"
            className="step-imageRight" 
            draggable={false}
            /> 
            
            <div className="step-item2">
                <h4 className="step-title">2.Transmitting Data</h4>
                <p className="step-description">Transmit data to the beekeeper&apos;s house using MQTT controller with lora1 connection </p>
            </div>
            <Image 
            src={leftFlyingBee} 
            alt="Data transmission illustration"
            className="step-imageLeft" 
            draggable={false}
            />
            
            
            <div className="step-item3">
                <h4 className="step-title monitoring-title" style={{ fontWeight: 'bold', letterSpacing: '0.5px', minWidth: '200px' }}>3.Monitoring</h4>
                <p className="step-description">Beekeeper checks hive conditions from their houses or anywhere and make decisions</p> 
            </div>
            <Image 
            src={beeHiveHouse} 
            alt="Monitoring illustration" 
            className="monitoring-image"
            draggable={false}
            />            
            <div className="more-details-container">
                <MoreDetailsLink />
            </div>
        </div>
    </section>
);
}