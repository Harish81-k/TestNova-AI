import React, { useState, useEffect } from 'react';

const generateRandomHex = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
};

const HexGuesser = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [targetColor, setTargetColor] = useState('');
  const [options, setOptions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const startRound = () => {
    const target = generateRandomHex();
    const opts = [target, generateRandomHex(), generateRandomHex(), generateRandomHex()];
    setTargetColor(target);
    setOptions(opts.sort(() => 0.5 - Math.random()));
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setIsGameOver(false);
    startRound();
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setIsGameOver(true);
    }
  }, [isPlaying, timeLeft]);

  const handleGuess = (hex) => {
    if (hex === targetColor) {
      setScore(s => s + 10);
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    startRound();
  };

  if (!isPlaying && !isGameOver) {
    return (
      <div className="flex flex-col md:flex-row h-full w-full font-sans bg-black">
        {/* Left Side - Black */}
        <div className="w-full h-2/3 md:w-1/2 md:h-full bg-black text-white p-8 md:p-16 flex flex-col justify-between">
          <button onClick={onBack} className="group flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-all w-fit">
            <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
            Return
          </button>
          
          <div className="my-auto">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">Hex<br/>Spectrum</h2>
            <p className="text-gray-400 font-light max-w-sm md:text-lg">Test your designer eye. Match the target spectrum to its precise hexadecimal origin.</p>
            
            <button onClick={startGame} className="group flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all mt-16 w-fit">
              Initiate Sequence
              <span className="w-12 h-[1px] bg-white group-hover:w-24 transition-all duration-700 ease-out"></span>
            </button>
          </div>
        </div>
        
        {/* Right Side - White Standby */}
        <div className="w-full h-1/3 md:w-1/2 md:h-full bg-white flex items-center justify-center">
          <div className="text-black text-[10px] tracking-[1em] uppercase font-bold text-center opacity-20">Standby</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full font-sans bg-black overflow-hidden selection:bg-white/20 selection:text-white">
      {/* Left Side - Controls & Options */}
      <div className="w-full h-2/3 md:w-1/2 md:h-full bg-black text-white p-8 md:p-16 flex flex-col justify-between relative z-10">
        <div className="flex justify-between items-start">
          <button onClick={onBack} className="group flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-all w-fit">
            <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
            Abort
          </button>
          
          {!isGameOver && (
            <div className="text-right flex gap-8 md:gap-12">
              <div>
                 <div className="text-[9px] tracking-[0.2em] text-gray-500 uppercase font-bold mb-1">Time</div>
                 <div className={`text-2xl md:text-3xl font-light ${timeLeft <= 10 ? 'text-white animate-pulse' : 'text-white'}`}>{timeLeft}</div>
              </div>
              <div>
                 <div className="text-[9px] tracking-[0.2em] text-gray-500 uppercase font-bold mb-1">Score</div>
                 <div className="text-2xl md:text-3xl font-light">{score}</div>
              </div>
            </div>
          )}
        </div>

        {isPlaying && (
          <div className="flex flex-col gap-6 md:gap-10 my-auto animate-in fade-in duration-500 slide-in-from-left-8">
            {options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => handleGuess(opt)}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-left group flex items-center gap-6 md:gap-8 w-fit"
              >
                <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-gray-700 group-hover:text-white transition-colors w-6">0{i+1}</span>
                <span className="text-white/20 group-hover:text-white transition-colors duration-300 font-mono">{opt}</span>
              </button>
            ))}
          </div>
        )}

        {isGameOver && (
          <div className="my-auto animate-in fade-in duration-1000">
            <div className="text-[10px] tracking-[0.5em] text-gray-500 uppercase font-bold mb-4">Final Score</div>
            <div className="text-8xl md:text-9xl font-black tracking-tighter text-white mb-12">{score}</div>
            
            <button onClick={startGame} className="group flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
              Restart Sequence
              <span className="w-12 h-[1px] bg-white group-hover:w-24 transition-all duration-700 ease-out"></span>
            </button>
          </div>
        )}
      </div>

      {/* Right Side - Target Color */}
      <div 
        className="w-full h-1/3 md:w-1/2 md:h-full transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative flex flex-col items-center justify-center md:items-end md:justify-end md:p-16"
        style={{ backgroundColor: isPlaying ? targetColor : '#ffffff' }}
      >
        <div className={`mix-blend-difference text-white/30 text-[10px] tracking-[1em] uppercase font-bold text-center ${!isPlaying && 'hidden'}`}>
          Target<br/>Spectrum
        </div>
      </div>
    </div>
  );
};

export default HexGuesser;
