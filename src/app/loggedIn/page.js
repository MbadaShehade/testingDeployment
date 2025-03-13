'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/ClientComponents/Header/Header';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import BeehiveManagement from '../components/ClientComponents/BeeHiveManagement/BeehiveManagement';
import FlowersRenderer from '../components/ClientComponents/FlowersRenderer/FlowersRenderer';
import './loggedIn.css';
export default function LoggedInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const email = searchParams.get('email') ;
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Only show the UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    router.push('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleOverlayClick = (e) => {
    // Only close if the click is directly on the overlay, not its children
    if (e.target.className === 'logout-modal-overlay') {
      setShowLogoutConfirm(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="App">
      <div className={showLogoutConfirm ? 'header-hidden' : ''}>
        <Header isLoggedIn={true} hiveDetails={false}/>
        <button
            onClick={handleLogoutClick}
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
      </div>
      <FlowersRenderer />
      <main className={`main-content ${showLogoutConfirm ? 'content-hidden' : ''}`}>
        
        <h2 className={`welcome-title ${theme === 'dark' ? 'dark' : 'light'}`}>
          Welcome,{username}!
        </h2>
        <p className="welcome-description">
          Your HiveGuard dashboard gives you real-time insights into your beehive conditions. 
          Monitor temperature and humidity levels, receive alerts for potential mold risks, 
          and access historical data to ensure your bees thrive in a healthy environment.
        </p>
      </main>
      <div className={showLogoutConfirm ? 'beehive-management-hidden' : ''}>
      </div>

      <BeehiveManagement email={email} username={username}/>
      
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={handleOverlayClick}>
          <div className="logout-modal">
            <div className="logout-modal-content">
              <h3 className="logout-modal-title">Are you sure you want to logout?</h3>
              <div className="logout-modal-buttons">
                <button 
                  onClick={handleCancelLogout} 
                  className="logout-modal-button cancel-button"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmLogout} 
                  className="logout-modal-button confirm-button"
                >
                  <Image 
                    src={"/logout.png"} 
                    className='logout-image' 
                    alt="Logout"
                    width={16}
                    height={16}
                  />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}