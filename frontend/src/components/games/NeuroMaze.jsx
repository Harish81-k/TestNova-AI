import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiClock, FiActivity, FiAward } from 'react-icons/fi';
import axios from 'axios';

const generateGate = () => {
  const gates = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];
  const gate = gates[Math.floor(Math.random() * gates.length)];
  const inputA = Math.random() > 0.5 ? 1 : 0;
  const inputB = Math.random() > 0.5 ? 1 : 0;
  
  let expected = 0;
  switch (gate) {
    case 'AND': expected = inputA & inputB; break;
    case 'OR': expected = inputA | inputB; break;
    case 'XOR': expected = inputA ^ inputB; break;
    case 'NAND': expected = !(inputA & inputB) ? 1 : 0; break;
    case 'NOR': expected = !(inputA | inputB) ? 1 : 0; break;
    default: expected = 0;
  }
  return { gate, inputA, inputB, expected };
};

const NeuroMaze = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [currentLogic, setCurrentLogic] = useState(null);

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
    setCurrentLogic(generateGate());
  };

  const handleAnswer = (answer) => {
    if (gameOver) return;
    
    if (answer === currentLogic.expected) {
      setScore(score + 10);
      setCurrentLogic(generateGate());
    } else {
      setTimeLeft(prev => Math.max(0, prev - 5)); // penalty
    }
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);
    
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post('/gaming/result', {
          gameName: 'NeuroMaze',
          score,
          durationSeconds: 60 - timeLeft,
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
    <div className="h-full flex flex-col p-8 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-pink-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      
      <div className="flex justify-between items-center z-10 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Modules
        </button>
        <div className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">
          NEUROMAZE
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-pink-400">
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
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl mx-auto mb-8 shadow-[0_0_40px_rgba(236,72,153,0.4)] flex items-center justify-center text-white">
              <FiActivity size={48} />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Logic Gate Traversal</h2>
            <p className="text-slate-400 mb-8">Process the inputs through the neural gates and determine the final binary output. Incorrect answers cost time.</p>
            <button onClick={startGame} className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] mx-auto">
              Initialize Traversal
            </button>
          </div>
        ) : gameOver ? (
          <div className="text-center bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl animate-in zoom-in">
            <div className="w-20 h-20 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAward size={40} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Traversal Complete</h3>
            <p className="text-slate-400 mb-8">Neural mapping score: {score}</p>
            <button onClick={startGame} className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] mx-auto">
              Re-initialize
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col items-center">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 w-full flex items-center justify-between mb-12 shadow-2xl backdrop-blur-xl relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent rounded-3xl pointer-events-none"></div>
              
              <div className="flex flex-col gap-8 z-10">
                <div className="w-16 h-16 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center text-3xl font-mono font-bold text-white shadow-inner">
                  {currentLogic.inputA}
                </div>
                <div className="w-16 h-16 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center text-3xl font-mono font-bold text-white shadow-inner">
                  {currentLogic.inputB}
                </div>
              </div>
              
              <div className="flex-1 flex justify-center z-10 relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-gradient-to-r from-slate-600 to-pink-500 -z-10"></div>
                <div className="px-8 py-6 bg-gradient-to-br from-pink-600 to-rose-700 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.5)] font-black text-3xl tracking-widest text-white border border-pink-400/50">
                  {currentLogic.gate}
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[50%] h-[120px] border-t border-b border-l border-slate-600 rounded-l-3xl -z-10 -translate-x-full border-r-0"></div>
              </div>
              
              <div className="z-10 flex flex-col gap-6">
                <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold text-center">Output?</h3>
                <div className="flex gap-4">
                  <button onClick={() => handleAnswer(1)} className="w-20 h-20 bg-white/5 hover:bg-pink-500/20 border border-white/20 hover:border-pink-500 rounded-2xl text-3xl font-mono font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                    1
                  </button>
                  <button onClick={() => handleAnswer(0)} className="w-20 h-20 bg-white/5 hover:bg-pink-500/20 border border-white/20 hover:border-pink-500 rounded-2xl text-3xl font-mono font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                    0
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuroMaze;
