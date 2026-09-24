import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login({ setToken, onClose }) {
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Use the actual auth API route
      const res = await axios.post('auth/google/', {
        credential: credentialResponse.credential,
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      if (onClose) onClose();
    } catch (err) {
      console.error("Google Auth Error:", err.response?.data);
      setError('Google Authentication failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google Login Failed');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-black/90 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Stars on the full screen backdrop */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 2px, transparent 2px)', backgroundSize: '150px 150px' }}></div>

      {/* Modal Container without box background */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center justify-center p-10 animate-in zoom-in-95 duration-300">

        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-20 text-gray-500 hover:text-white transition-colors p-2"
          >
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}

        {/* Right Side: Original Login Content */}
        <div className="relative z-10 flex w-full flex-col items-center text-center">
          {/* TestNova AI Logo Area */}
          <div data-aos="fade-down" className="mb-8 mt-2 animate-float-3d">
            <div className="relative h-16 w-16 animate-spin-3d" style={{ transformStyle: 'preserve-3d' }}>
              {/* Front */}
              <div className="absolute inset-0 border-[3px] border-white bg-white/10 backdrop-blur-sm rounded-sm" style={{ transform: 'translateZ(32px)' }}></div>
              {/* Back */}
              <div className="absolute inset-0 border-[3px] border-white bg-white/10 backdrop-blur-sm rounded-sm" style={{ transform: 'rotateY(180deg) translateZ(32px)' }}></div>
              {/* Left */}
              <div className="absolute inset-0 border-[3px] border-white bg-white/10 backdrop-blur-sm rounded-sm" style={{ transform: 'rotateY(-90deg) translateZ(32px)' }}></div>
              {/* Right */}
              <div className="absolute inset-0 border-[3px] border-white bg-white/10 backdrop-blur-sm rounded-sm" style={{ transform: 'rotateY(90deg) translateZ(32px)' }}></div>
              {/* Top */}
              <div className="absolute inset-0 border-[3px] border-white bg-white/10 backdrop-blur-sm rounded-sm" style={{ transform: 'rotateX(90deg) translateZ(32px)' }}></div>
              {/* Bottom */}
              <div className="absolute inset-0 border-[3px] border-white bg-white/10 backdrop-blur-sm rounded-sm" style={{ transform: 'rotateX(-90deg) translateZ(32px)' }}></div>
            </div>
          </div>

          <h1 data-aos="fade-up" data-aos-delay="100" className="mb-3 text-3xl font-bold text-white tracking-tight">Welcome to<br/>TestNova AI</h1>
          
          <p data-aos="fade-up" data-aos-delay="200" className="mb-8 text-gray-300">Log in with your Google account to continue</p>

          {error && (
            <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div data-aos="zoom-in" data-aos-delay="300" className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              size="large"
              theme="outline"
              shape="rectangular"
              width="300"
              text="continue_with"
            />
          </div>
          
          <div data-aos="fade-in" data-aos-delay="400" className="mt-8 text-xs text-gray-400 max-w-[280px]">
            By continuing, you agree to TestNova AI's Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
