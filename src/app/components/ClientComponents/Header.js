'use client';

import Image from 'next/image';
import leftFlower from '/public/leftTopSidesFlower.png';
import rightFlower from '/public/rightTopSidesFlower.png';
import Navigation from './Navigation';

export default function Header() {
  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <header className="App-header">
      <Image src={leftFlower} className="corner-flower corner-flower-left" alt="Decorative flower" width={200} height={200} />
      <Image src={rightFlower} className="corner-flower corner-flower-right" alt="Decorative flower" width={200} height={200} />
      
      <div className="header-content">
        <h1 className="logo-text" onClick={handleLogoClick}>HiveGuard</h1>
        <Navigation />
      </div>
    </header>
  );
}