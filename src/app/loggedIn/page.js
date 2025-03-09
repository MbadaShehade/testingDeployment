'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/ClientComponents/Header/Header';
import '../globals.css'; 
import Image from 'next/image';
import './loggedIn.css';


export default function LoggedInPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="App">
      <Header isLoggedIn={true}/>
      <main className="main-content">
      
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