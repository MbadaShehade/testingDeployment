import './Introduction.css';
import Image from 'next/image';
import leftFlowerWithBee from '/public/leftFlowerWithBee.png';
import beeHiveImage from '/public/beeHiveMainPage.png';
import LoginButton from '../../ClientComponents/LoginButton/LoginButton';


export default function Introduction() {
    return (
        <>
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
                        style={{ 
                            maxWidth: '220px', 
                            transform: 'scale(1.3)',
                            position: 'relative',
                            left: '-10px',
                            display: 'block'
                        }}
                        width={220}
                        height={220}
                        priority={true}
                        draggable={false}
                        />
                    </div>
                    </div>
                    
                    <div className="beehive-image-container">
                    <Image 
                        src={beeHiveImage} 
                        alt="Beehive with monitoring system" 
                        className="beehive-image" 
                        width={600} 
                        height={600}
                        priority={true}
                        quality={100}
                        draggable={false}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            maxHeight: '600px'
                        }}
                    />
                    </div>
                </div>
            </section> 
        </>
    );
}