import './ProblemSection.css';
import Image from 'next/image';
import DiscoverLink from '../../ClientComponents/DiscoverLink/DiscoverLink';
import honeySpoon from '/public/honeySpoon.png';

export default function ProblemSection() {
  return (
    <section id="problem" className="problem-section">
      <h2 className="section-title">The Problem</h2>
      <div className="problem-items">
        <div className="problem-item">
          <h3 className="problem-subtitle">Weather changes</h3>
          <p className="problem-description">High humidity in winter promotes mold growth in beehives. When moisture levels exceed 60% during colder months, conditions become ideal for various mold species to flourish.</p>
        </div>
        
        <div className="problem-item">
          <h3 className="problem-subtitle">Health Impact</h3>
          <p className="problem-description">Mold affects the quality of stored honey that we consume, potentially introducing harmful compounds. These contaminants can alter honey&apos;s flavor, reduce its nutritional benefits, and pose health risks to consumers.</p>
        </div>
        
        <div className="problem-item">
          <h3 className="problem-subtitle">Colony Collapse</h3>
          <p className="problem-description">Persistent mold makes hives uninhabitable for bees, forcing colonies to abandon their homes. Mold-infested hives weaken the colony&apos;s immune system, making bees more susceptible to parasites and other pathogens.</p>
        </div>
        
        <div className="problem-item">
          <h3 className="problem-subtitle">Reduce Productivity</h3>
          <p className="problem-description">Bees expend more energy removing moldy combs instead of collecting nectar or producing honey. This diverts up to 30% of the colony&apos;s workforce, dramatically reducing honey yields and pollination efficiency.</p>
        </div>
      </div>
      
      <div className="discover-solution">
        <DiscoverLink />
        <Image src={honeySpoon} alt="Honey spoon" className="honey-spoon-image" width={300} height={300} draggable={false} />
      </div>
    </section>
  );
}