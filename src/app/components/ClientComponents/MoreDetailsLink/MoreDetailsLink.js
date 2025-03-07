'use client';
import './MoreDetailsLink.css';

export default function MoreDetailsLink() {
  const handleClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('more-details');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="more-details-content">
      <a href="#more-details" className="more-details-link" onClick={handleClick}>
        <h3 className="more-details-text">More Details</h3>
        <div className="arrow-down">▼</div>
      </a>
    </div>
  );
} 