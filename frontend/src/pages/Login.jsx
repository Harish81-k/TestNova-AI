import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login({ setToken }) {
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Use the actual auth API route
      const res = await axios.post('auth/google/', {
        credential: credentialResponse.credential,
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
    } catch (err) {
      console.error("Google Auth Error:", err.response?.data);
      setError('Google Authentication failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google Login Failed');
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      
      {/* Project Name Top Left */}
      <div className="absolute top-8 left-8 z-20 flex items-center">
         <span className="text-xl font-bold tracking-wide text-white">TestNova AI</span>
      </div>

      {/* Optional: Add some subtle "stars" or background pattern for the night view */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 2px, transparent 2px)', backgroundSize: '150px 150px' }}></div>

      <div className="relative z-10 flex w-full max-w-6xl mx-auto items-center justify-center px-8">
        {/* Right Side: Original Login Content */}
        <div className="flex w-full max-w-[400px] flex-col items-center p-8 text-center">
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

          <h1 data-aos="fade-up" data-aos-delay="100" className="mb-3 text-3xl font-bold text-white">Welcome to TestNova AI</h1>
          
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
          
          <div data-aos="fade-in" data-aos-delay="400" className="mt-8 text-xs text-gray-400">
            By continuing, you agree to TestNova AI's Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
