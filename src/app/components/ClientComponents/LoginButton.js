'use client';

export default function LoginButton() {
  const handleLogin = () => {
    // Add login functionality here
    console.log('Login clicked');
  };

  return (
    <button className="login-button" onClick={handleLogin}>
      <b>Login Now</b>
    </button>
  );
} 