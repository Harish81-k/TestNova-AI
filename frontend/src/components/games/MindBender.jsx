import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiPlay, FiRotateCcw, FiAward } from 'react-icons/fi';
import axios from 'axios';

const MindBender = ({ onBack }) => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [activeTile, setActiveTile] = useState(null);
  
  const gridSize = 9;
  const tiles = Array.from({ length: gridSize }, (_, i) => i);
  const sequenceSpeed = 800; // ms between flashes

  useEffect(() => {
    if (isPlaying && sequence.length > 0 && playerSequence.length === 0 && !gameOver) {
      playSequence();
    }
  }, [sequence, isPlaying, gameOver]);

  const startGame = () => {
    setSequence([Math.floor(Math.random() * gridSize)]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const playSequence = async () => {
    setIsShowingSequence(true);
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, sequenceSpeed / 2));
      setActiveTile(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, sequenceSpeed / 2));
      setActiveTile(null);
    }
    setIsShowingSequence(false);
  };

  const handleTileClick = (index) => {
    if (isShowingSequence || !isPlaying || gameOver) return;

    setActiveTile(index);
    setTimeout(() => setActiveTile(null), 200);

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    // Check if the current move is correct
    if (sequence[newPlayerSequence.length - 1] !== index) {
      handleGameOver();
      return;
    }

    // Check if the sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      setScore(score + 1);
      setTimeout(() => {
        setSequence([...sequence, Math.floor(Math.random() * gridSize)]);
        setPlayerSequence([]);
      }, 1000);
    }
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);
    
    // Save score
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post('/gaming/result', {
          gameName: 'MindBender',
          score,
          durationSeconds: score * 5, // rough estimate
          details: { roundsCompleted: score }
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Failed to save game result:', err);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="flex justify-between items-center z-10 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft /> Back to Modules
        </button>
        <div className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400">
          MINDBENDER
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mr-3">Score</span>
            <span className="text-xl font-black text-white">{score}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center z-10 relative">
        {!isPlaying && !gameOver ? (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-2xl mx-auto mb-8 shadow-[0_0_40px_rgba(192,38,211,0.4)] flex items-center justify-center text-white">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-12 h-12">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Sequence Mastery</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Memorize the sequence of flashing tiles. The sequence gets longer and faster with each correct round. One mistake ends the simulation.
            </p>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 mx-auto"
            >
              <FiPlay /> Initiate Sequence
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <div className="mb-8 h-8">
              {isShowingSequence ? (
                <div className="text-fuchsia-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-fuchsia-400"></div>
                  Observing Sequence...
                </div>
              ) : !gameOver && (
                <div className="text-blue-400 font-bold uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                  Your Turn ({playerSequence.length} / {sequence.length})
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-6 bg-white/[0.02] p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
              {tiles.map((tile) => (
                <button
                  key={tile}
                  onClick={() => handleTileClick(tile)}
                  disabled={isShowingSequence || gameOver}
                  className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl transition-all duration-200 ${
                    activeTile === tile
                      ? 'bg-fuchsia-500 shadow-[0_0_30px_rgba(192,38,211,0.6)] scale-95'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
                />
              ))}
            </div>

            {gameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-3xl animate-in fade-in zoom-in duration-300">
                <div className="text-center bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl">
                  <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiAward size={40} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Sequence Broken</h3>
                  <p className="text-slate-400 mb-8">You successfully recalled {score} sequences.</p>
                  <button 
                    onClick={startGame}
                    className="px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(192,38,211,0.3)] flex items-center gap-2 mx-auto"
                  >
                    <FiRotateCcw /> Retry Simulation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MindBender;
