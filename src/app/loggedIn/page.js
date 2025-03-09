'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/ClientComponents/Header/Header';
import '../globals.css'; 

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
        >
          Logout
        </button>
      </main>
    </div>
  );
}