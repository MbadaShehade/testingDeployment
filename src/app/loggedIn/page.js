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
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </main>
    </div>
  );
}