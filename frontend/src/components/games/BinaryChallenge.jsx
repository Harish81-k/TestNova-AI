import React, { useState, useEffect } from 'react';

const generateBinaryQuestion = () => {
  // Generate random number between 1 and 255 (8-bit)
  const dec = Math.floor(Math.random() * 255) + 1;
  const bin = dec.toString(2).padStart(8, '0');
  
  // Generate 3 wrong options close to the answer
  const wrong1 = Math.max(1, dec + Math.floor(Math.random() * 10) + 1);
  const wrong2 = Math.max(1, dec - Math.floor(Math.random() * 10) - 1);
  let wrong3 = dec ^ (1 << Math.floor(Math.random() * 8)); // Flip one random bit
  if (wrong3 === dec) wrong3 = dec + 5;

  const opts = [dec, wrong1, wrong2, wrong3];
  
  return {
    bin,
    dec,
    options: opts.sort(() => 0.5 - Math.random())
  };
};

const BinaryChallenge = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const startRound = () => {
    setQuestion(generateBinaryQuestion());
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
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

  const handleGuess = (val) => {
    if (val === question.dec) {
      setScore(s => s + 10);
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    startRound();
  };

  if (!isPlaying && !isGameOver) {
    return (
      <div className="relative flex flex-col h-full w-full bg-black text-white p-8 md:p-16 font-sans selection:bg-white/20 selection:text-white">
        <div className="z-20">
          <button onClick={onBack} className="group flex items-center gap-4 text-xs font-bold tracking-[0.3em] uppercase text-gray-500 hover:text-white transition-all w-fit">
            <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
            Return
          </button>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6">Module 04</div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-8 uppercase">Binary<br/>Brain</h1>
          <p className="text-gray-400 font-light max-w-md text-base md:text-lg mb-12">
            Convert 8-bit binary numbers to decimal format as fast as possible. Test your computational logic.
          </p>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            Initiate Sequence
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-black text-white overflow-hidden p-8 md:p-16 font-sans selection:bg-white/20 selection:text-white">
      
      {/* Header Stats */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
        <button onClick={onBack} className="group flex items-center gap-4 text-xs font-bold tracking-[0.3em] uppercase text-gray-500 hover:text-white transition-all w-fit">
          <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
          Abort
        </button>
      </div>

      {!isGameOver && (
        <div className="absolute top-8 right-8 md:top-12 md:right-12 text-right z-20 flex gap-12 pointer-events-none">
          <div>
            <div className="text-[9px] tracking-[0.3em] text-gray-600 uppercase font-bold mb-1">Time</div>
            <div className={`text-2xl md:text-3xl font-light ${timeLeft <= 10 ? 'text-white animate-pulse' : 'text-gray-300'}`}>{timeLeft}</div>
          </div>
          <div>
            <div className="text-[9px] tracking-[0.3em] text-gray-600 uppercase font-bold mb-1">Score</div>
            <div className="text-2xl md:text-3xl font-light text-white">{score}</div>
          </div>
        </div>
      )}

      {/* Game State - Neat Centered Horizon */}
      {isPlaying && question && (
        <div className="flex-1 flex flex-col justify-center items-center animate-in fade-in duration-700 w-full h-full mt-12 md:mt-0">
          
          <div className="text-center mb-16 md:mb-24 w-full px-4">
            <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6">8-Bit Sequence</div>
            <div className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-mono font-light tracking-[0.2em] md:tracking-[0.4em] text-white">
              {question.bin}
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20">
            {question.options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => handleGuess(opt)} 
                className="group relative flex flex-col items-center outline-none"
              >
                <span className="absolute -top-8 text-[9px] tracking-[0.4em] text-gray-600 font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">BASE-10</span>
                <span className="text-4xl md:text-5xl lg:text-6xl font-light text-white/40 group-hover:text-white transition-colors duration-500">
                  {opt}
                </span>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-500 ease-out"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Over State */}
      {isGameOver && (
        <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-1000">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6">Final Computation Score</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            Restart Sequence
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BinaryChallenge;
