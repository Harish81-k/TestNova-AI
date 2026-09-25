import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiClock, FiTarget, FiAward, FiZap } from 'react-icons/fi';
import axios from 'axios';

const generateQuestion = () => {
  const type = Math.floor(Math.random() * 3);
  if (type === 0) { // Math
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 50) + 10;
    const isAdd = Math.random() > 0.5;
    return {
      type: 'math',
      question: `${a} ${isAdd ? '+' : '-'} ${b}`,
      answer: (isAdd ? a + b : a - b).toString(),
    };
  } else if (type === 1) { // Sequence
    const start = Math.floor(Math.random() * 10);
    const step = Math.floor(Math.random() * 5) + 2;
    const seq = [start, start+step, start+step*2, start+step*3];
    return {
      type: 'sequence',
      question: `${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ?`,
      answer: (start+step*4).toString(),
    };
  } else { // Binary
    const num = Math.floor(Math.random() * 15) + 1;
    return {
      type: 'binary',
      question: `Binary for ${num}?`,
      answer: num.toString(2),
    };
  }
};

const IQArena = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

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
    setTimeLeft(60);
    setGameOver(false);
    setIsPlaying(true);
    setCurrentQuestion(generateQuestion());
    setInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameOver || !input.trim()) return;
    
    if (input.trim() === currentQuestion.answer) {
      setScore(score + 5);
      setCurrentQuestion(generateQuestion());
      setInput('');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInput('');
    }
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);
    
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post('/gaming/result', {
          gameName: 'IQ Arena',
          score,
          durationSeconds: 60 - timeLeft,
          level: 'medium'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Failed to save score:', err);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#020617] relative overflow-hidden">
      <div className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      
      <div className="flex justify-between items-center z-10 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Modules
        </button>
        <div className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          IQ ARENA
        </div>
        <div className="flex gap-4">
          <div className={`px-6 py-2 rounded-xl border flex items-center gap-2 ${timeLeft <= 10 ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-blue-400'}`}>
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
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-8 shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center justify-center text-white">
              <FiZap size={40} />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Rapid Cognition</h2>
            <p className="text-slate-400 mb-8">Test your processing speed with rapid-fire math, sequence, and binary conversion problems. Answer as many as possible in 60 seconds.</p>
            <button onClick={startGame} className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] mx-auto flex items-center gap-2">
              <FiTarget /> Enter Arena
            </button>
          </div>
        ) : gameOver ? (
          <div className="text-center bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl animate-in zoom-in">
            <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAward size={40} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Time's Up</h3>
            <p className="text-slate-400 mb-8">Cognitive processing score: <span className="text-white font-bold">{score}</span></p>
            <button onClick={startGame} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] mx-auto">
              Play Again
            </button>
          </div>
        ) : (
          <div className={`w-full max-w-xl transition-transform ${shake ? 'animate-shake' : 'animate-in zoom-in duration-300'}`}>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl backdrop-blur-xl flex flex-col items-center">
              <span className="text-blue-400 uppercase tracking-widest text-xs font-bold mb-6 flex items-center gap-2">
                <FiZap /> {currentQuestion.type} problem
              </span>
              
              <div className="text-5xl md:text-6xl font-black text-white mb-12 tracking-tighter drop-shadow-md text-center break-all">
                {currentQuestion.question}
              </div>
              
              <form onSubmit={handleSubmit} className="w-full relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type answer and press Enter..."
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-6 py-5 text-2xl text-center text-white focus:outline-none focus:border-blue-500 shadow-inner font-mono transition-colors"
                  autoFocus
                />
              </form>
            </div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  );
};

export default IQArena;
