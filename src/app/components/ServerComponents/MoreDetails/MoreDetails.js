import './MoreDetails.css';
import Image from 'next/image';
import honeySpoonLast from '/public/honeySpoonLast.png';

export default function MoreDetails() {
  return (
    <section id="more-details" className="technical-details-section">
      <div className="technical-details-content">
        <p className="technical-description">
          The system begins with a solar panel that converts sunlight into electrical energy, ensuring that in low sunlight conditions, a battery can be used as an alternative power source.
        </p>
        <p className="technical-description">
          An air pump will regulate airflow inside the beehive to maintain proper ventilation. Inside the beehive, two sensors will continuously measure humidity and temperature.
        </p>
        <p className="technical-description">
          Data collected by the sensors will be transmitted using MQTT with an LoRa1 connection to an M5Stack device located in the beekeeper&apos;s house. This setup is necessary because the beehive&apos;s location lacks internet access. From the beekeeper&apos;s house, the data will be forwarded to the Mosquitto cloud service.
        </p>
        <div className="technical-description">
          <p>
            Once in the cloud, the data can be processed to generate graphs, charts, and additional insights for the beekeeper. The information will be accessible from anywhere.
          </p>
          <Image 
            src={honeySpoonLast} 
            alt="Honey spoon illustration" 
            style={{ 
              maxWidth: '400px',
              height: 'auto', 
              float: 'right',
              marginLeft: '20px',
              marginTop: '-20px',
              transform: 'scale(1.1) rotate(5deg)',
            }} 
            width={400}
            height={400}
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
} 