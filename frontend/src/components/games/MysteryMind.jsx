import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiClock, FiLock, FiAward, FiUnlock } from 'react-icons/fi';
import axios from 'axios';

const generateCipher = () => {
  const words = ['payload', 'admin', 'database', 'token', 'secure', 'hacker', 'system'];
  const word = words[Math.random() * words.length | 0];
  const type = Math.random() > 0.5 ? 'base64' : 'caesar';
  
  if (type === 'base64') {
    return { 
      type: 'Base64', 
      cipher: btoa(word), 
      answer: word,
      hint: 'A standard encoding scheme often ending with = padding.'
    };
  } else {
    // Caesar cipher (shift by 3)
    const shifted = word.split('').map(c => String.fromCharCode(((c.charCodeAt(0) - 97 + 3) % 26) + 97)).join('');
    return {
      type: 'Caesar Cipher (ROT3)',
      cipher: shifted,
      answer: word,
      hint: 'Shift each letter backwards in the alphabet by 3.'
    };
  }
};

const MysteryMind = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [input, setInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0 && !gameOver) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, gameOver]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(120);
    setGameOver(false);
    setIsPlaying(true);
    setCurrentChallenge(generateCipher());
    setInput('');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameOver || !input.trim()) return;
    
    if (input.toLowerCase().trim() === currentChallenge.answer) {
      setScore(score + 15);
      setCurrentChallenge(generateCipher());
      setInput('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect decryption. Try again.');
      setTimeLeft(prev => Math.max(0, prev - 5));
    }
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);
    
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post('/gaming/save', {
          game: 'MysteryMind',
          score,
          timeSpent: 120 - timeLeft,
          level: 'hard'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Failed to save score:', err);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-[80%] h-[80%] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      
      <div className="flex justify-between items-center z-10 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Modules
        </button>
        <div className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          MYSTERYMIND
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-amber-400">
            <FiClock /> <span className="font-mono font-bold">{timeLeft}s</span>
          </div>
          <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-xs font-bold uppercase mr-2">Score</span>
            <span className="text-xl font-black text-white">{score}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center z-10">
        {!isPlaying && !gameOver ? (
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl mx-auto mb-8 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center text-white">
              <FiLock size={40} />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Cryptographic Cracker</h2>
            <p className="text-slate-400 mb-8">Decrypt the intercepted payloads. Use the hints provided to figure out the cipher algorithm and retrieve the plaintext.</p>
            <button onClick={startGame} className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] mx-auto flex items-center gap-2">
              <FiUnlock /> Breach System
            </button>
          </div>
        ) : gameOver ? (
          <div className="text-center bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl animate-in zoom-in">
            <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAward size={40} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">System Locked</h3>
            <p className="text-slate-400 mb-8">Decryption score: {score}</p>
            <button onClick={startGame} className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] mx-auto">
              Re-attempt Breach
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="bg-[#111] border border-amber-500/30 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                  <FiLock className="text-amber-500" /> Intercepted Cipher
                </h3>
                <span className="text-xs font-mono bg-white/5 px-3 py-1 rounded text-slate-300 border border-white/10">{currentChallenge.type}</span>
              </div>
              
              <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-2xl text-center text-amber-400 tracking-widest mb-8 break-all shadow-inner">
                {currentChallenge.cipher}
              </div>
              
              <p className="text-sm text-slate-500 mb-8 italic text-center">Hint: {currentChallenge.hint}</p>
              
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setErrorMsg(''); }}
                  placeholder="Enter decrypted plaintext..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  autoFocus
                />
                <button type="submit" className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  Decrypt
                </button>
              </form>
              
              {errorMsg && (
                <p className="text-red-400 text-sm mt-4 text-center animate-pulse">{errorMsg}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MysteryMind;
