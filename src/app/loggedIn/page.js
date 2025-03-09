'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/ClientComponents/Header/Header';
import '../globals.css'; 
import Image from 'next/image';
import './loggedIn.css';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';


export default function LoggedInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'User';
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Only show the UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <div className="App">
      <Header isLoggedIn={true}/>
      <main className="main-content">
        <h2 className={`welcome-title ${theme === 'dark' ? 'dark' : 'light'}`}>
          Welcome, {username}!
        </h2>
        <p className="welcome-description">
          Your HiveGuard dashboard gives you real-time insights into your beehive conditions. 
          Monitor temperature and humidity levels, receive alerts for potential mold risks, 
          and access historical data to ensure your bees thrive in a healthy environment.
        </p>
        <button
          onClick={handleLogout}
          className='logout-button'
        >
         <Image 
           src={"/logout.png"} 
           className='logout-image' 
           alt="Logout"
           width={20}
           height={20}
         />
         <b className='logout-text'>Logout</b>
        </button>
        

      </main>
    </div>
  );
}