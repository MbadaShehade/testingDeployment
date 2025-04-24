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
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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

  // Function to determine if input is email or phone
  const detectInputType = (value) => {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(value)) {
      setLoginMethod('email');
      setEmail(value);
    } else {
      // Still updating the contact info, but not setting a specific type yet
      setLoginMethod('');
      setEmail('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
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

      // Add specific error handling for JSON parsing
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // This catches the specific JSON parsing error
        console.error('JSON parsing error:', jsonError);
        setIsLoading(false);
        setError(`Server returned invalid JSON. This usually means the server is down or not properly connected to the database. Status: ${response.status}`);
        return;
      }

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
      
      // Show success state for 2 seconds
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        // Store both the original password (for MQTT) and encrypted password (from DB)
        const originalPassword = password; // The password before encryption
        router.push(`/loggedIn?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(originalPassword)}`);
      }, 1000);

    } catch (err) {
      setIsLoading(false);
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
      {(isLoading || isSuccess) && (
        <div className="loading-overlay">
          <div className="loading-card">
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <p className="loading-text">Processing your request...</p>
              </>
            ) : (
              <>
                <div className="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="loading-text">Success! Redirecting...</p>
              </>
            )}
          </div>
        </div>
      )}
      
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
            )}
            
            {isLogin && (
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
            )}
            
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
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <button 
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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