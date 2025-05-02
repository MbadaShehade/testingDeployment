'use client';
import './Header.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import leftFlower from '/public/leftTopSidesFlower.png';
import rightFlower from '/public/rightTopSidesFlower.png';
import Navigation from '../Navigation/Navigation';

export default function Header({ isLoggedIn , hiveDetails }) {
  const router = useRouter();

  return (
    <>
      <header id = "header" className="App-header">
        <Image src={leftFlower} className="corner-flower corner-flower-left" alt="Decorative flower" width={200} height={200} draggable={false} />
        <Image src={rightFlower} className="corner-flower corner-flower-right" alt="Decorative flower" width={200} height={200} draggable={false} />
        
        <div className="header-content">
          
          <h1 style={{cursor: isLoggedIn || hiveDetails ? 'default' : 'pointer'}} className="logo-text" onClick={() => isLoggedIn || hiveDetails ? null : router.push('/')}>HiveGuard</h1>
          <Navigation isLoggedIn={isLoggedIn} hiveDetails={hiveDetails}/>
        </div>
      </header>
    </>
  );
}