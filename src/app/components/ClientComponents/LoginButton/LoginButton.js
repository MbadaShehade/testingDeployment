'use client';
import './LoginButton.css';
import { useRouter } from 'next/navigation';

export default function LoginButton() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <button className="login-button" onClick={handleLogin}>
      <b>Login Now</b>
    </button>
  );
} 