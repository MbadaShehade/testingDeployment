'use client';
import './Header.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import leftFlower from '/public/leftTopSidesFlower.png';
import rightFlower from '/public/rightTopSidesFlower.png';
import Navigation from '../Navigation/Navigation';

export default function Header({ isLoggedIn }) {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <>
      <header className="App-header">
        <Image src={leftFlower} className="corner-flower corner-flower-left" alt="Decorative flower" width={200} height={200} draggable={false} />
        <Image src={rightFlower} className="corner-flower corner-flower-right" alt="Decorative flower" width={200} height={200} draggable={false} />
        
        <div className="header-content">
          <h1 className="logo-text cursor-pointer" onClick={handleLogoClick}>HiveGuard</h1>
          <Navigation isLoggedIn={isLoggedIn}/>
        </div>
      </header>
    </>
  );
}