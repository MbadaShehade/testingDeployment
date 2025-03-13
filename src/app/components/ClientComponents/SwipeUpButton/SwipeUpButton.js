'use client';
import './SwipeUpButton.css';

export default function SwipeUpButton() {
  const handleClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('header');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="swipe-up-button-content cursor-pointer">
      <a className="swipe-up-button-link" onClick={handleClick}>
        <h1 className="swipe-up-button-text">Swipe Up</h1>
        <div className="arrow-up">▲</div>
      </a>
    </div>
  );
} 