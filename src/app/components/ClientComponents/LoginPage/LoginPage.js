'use client';

import { useState, useEffect, useRef } from 'react';
import './LoginPage.css';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(false); 
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const router = useRouter();
  
  const { theme } = useTheme();

  // Only show the UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showForgotPassword && 
          modalRef.current && 
          !modalRef.current.contains(event.target)) {
        setShowForgotPassword(false);
        setResetEmailSent(false);
        setResetEmail('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showForgotPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'signup',
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'User not found, Sign Up first') {
          // Switch to signup form and clear fields
          setIsLogin(false);
          setUsername('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
        throw new Error(data.error || 'Authentication failed');
      }

      // Clear form after successful authentication
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Redirect to logged in page
      router.push('/loggedIn');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Sign in with Google clicked');
    // TO DO: Google OAuth authentication implementation
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log('Password reset requested for:', resetEmail);
    // TO DO: call an API to send a password reset email
    setResetEmailSent(true);
    // Reset the form after 3 seconds and close the modal
    setTimeout(() => {
      setResetEmailSent(false);
      setShowForgotPassword(false);
      setResetEmail('');
    }, 3000);
  };

  if (!mounted) return null;

  return (
    <div className={`login-container theme-${theme}`}>
      <div className="login-wrapper">
        {/* Left side - Form */}
        <div className="login-card">
          <h1 className="login-title">Account Access</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Google Sign In Button */}
          <button 
            type="button" 
            className="google-sign-in-button"
            onClick={handleGoogleSignIn}
          >
            <div className="google-icon-wrapper">
              <svg className="google-icon" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </div>
            <span className="google-button-text">Sign in with Google</span>
          </button>
          
          <div className="separator">
            <span>or</span>
          </div>
          
          <div className="login-tabs">
            <button 
              onClick={() => setIsLogin(true)}
              className={`login-tab ${isLogin ? 'active' : ''}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`login-tab ${!isLogin ? 'active signup' : ''}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    User Name
                  </label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    required={!isLogin}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            
            {isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    User Name
                  </label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              {isLogin && (
                <button 
                  type="button" 
                  className="forgot-password-link"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required={!isLogin}
                />
              </div>
            )}
            
            <button
              type="submit"
              className="submit-button"
            >
              {!isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>
        
        {/* Right side - Image */}
        <div className="login-image">
          <Image 
            src="/honeyLogin.png" 
            alt="Login illustration" 
            width={500}
            height={500}
            draggable={false}
          />
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <button 
              className="modal-close"
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmailSent(false);
                setResetEmail('');
              }}
            >
              &times;
            </button>
            <h2 className="modal-title">Reset Password</h2>
            
            {!resetEmailSent ? (
              <form onSubmit={handleForgotPassword} className="reset-form">
                <p className="modal-description">
                  Enter your email address and we&apos;ll send you instructions to reset your password.
                </p>
                <div className="form-group">
                  <label htmlFor="resetEmail" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="resetEmail"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <button type="submit" className="submit-button">
                  Send Reset Link
                </button>
              </form>
            ) : (
              <div className="success-message">
                <p>Password reset link has been sent to your email!</p>
                <p className="small-text">Please check your inbox and follow the instructions.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}