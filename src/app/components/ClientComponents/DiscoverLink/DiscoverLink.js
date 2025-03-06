'use client';
import './DiscoverLink.css';
export default function DiscoverLink() {
  const handleClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="discover-content">
      <a href="#how-it-works" className="discover-link" onClick={handleClick}>
        <h3 className="discover-text">Discover Our Solution</h3>
        <div className="arrow-down">▼</div>
      </a>
    </div>
  );
} 