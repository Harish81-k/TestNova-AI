import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_PORT_DATA = [
  { port: "20/21", service: "FTP" },
  { port: "22", service: "SSH" },
  { port: "23", service: "Telnet" },
  { port: "25", service: "SMTP" },
  { port: "53", service: "DNS" },
  { port: "80", service: "HTTP" },
  { port: "110", service: "POP3" },
  { port: "143", service: "IMAP" },
  { port: "443", service: "HTTPS" },
  { port: "3306", service: "MySQL" },
  { port: "5432", service: "PostgreSQL" },
  { port: "27017", service: "MongoDB" },
  { port: "6379", service: "Redis" },
  { port: "8080", service: "HTTP Alternate" }
];

const PortMatcher = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [portData, setPortData] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const startRound = (data = portData) => {
    if (data.length === 0) return;
    const target = data[Math.floor(Math.random() * data.length)];
    
    // Pick 3 random wrong answers
    let wrongOptions = [...data].filter(p => p.port !== target.port);
    wrongOptions = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const opts = [target.port, ...wrongOptions.map(w => w.port)].sort(() => 0.5 - Math.random());
    
    setCurrentQuestion(target);
    setOptions(opts);
  };

  const initGame = async () => {
    setIsLoading(true);
    let data = [];
    try {
      const res = await axios.get('http://localhost:5000/api/gaming/generate/ports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      data = res.data && res.data.length >= 4 ? res.data : DEFAULT_PORT_DATA;
    } catch (e) {
      console.error(e);
      data = DEFAULT_PORT_DATA;
    }
    setPortData(data);
    setScore(0);
    setTimeLeft(45);
    setIsPlaying(true);
    setIsGameOver(false);
    setIsLoading(false);
    
    const target = data[Math.floor(Math.random() * data.length)];
    let wrongOptions = [...data].filter(p => p.port !== target.port);
    wrongOptions = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    const opts = [target.port, ...wrongOptions.map(w => w.port)].sort(() => 0.5 - Math.random());
    setCurrentQuestion(target);
    setOptions(opts);
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

  const handleGuess = (guessedPort) => {
    if (guessedPort === currentQuestion.port) {
      setScore(s => s + 10);
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    startRound(portData);
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
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6">Module 03</div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-8 uppercase">Port<br/>Authority</h1>
          <p className="text-gray-400 font-light max-w-md text-base md:text-lg mb-12">
            Test your networking knowledge. Match the correct default port to the specified network service before time runs out.
          </p>
          
          <button onClick={initGame} disabled={isLoading} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit disabled:opacity-50">
            {isLoading ? 'Generating Target Ports with AI...' : 'Initiate Sequence'}
            {!isLoading && <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-black text-white overflow-hidden p-8 md:p-16 font-sans selection:bg-white/20 selection:text-white">
      
      {/* Header Stats */}
      <div className="flex justify-between items-start z-20">
        <button onClick={onBack} className="group flex items-center gap-4 text-xs font-bold tracking-[0.3em] uppercase text-gray-500 hover:text-white transition-all w-fit">
          <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
          Abort
        </button>
        
        {!isGameOver && (
          <div className="flex gap-12 text-right">
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
      </div>

      {/* Game State - Brutalist Poster */}
      {isPlaying && currentQuestion && (
        <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-700 mt-12 md:mt-0">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-4">Target Protocol</div>
          <div className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-12 md:mb-16 uppercase break-words">
            {currentQuestion.service}
          </div>

          <div className="flex flex-wrap items-center gap-6 md:gap-12">
            {options.map((opt, i) => (
              <React.Fragment key={opt}>
                <button 
                  onClick={() => handleGuess(opt)} 
                  className="group relative flex flex-col items-start outline-none"
                >
                  <span className="text-[9px] md:text-[10px] tracking-[0.5em] text-gray-600 font-bold mb-2 group-hover:text-white transition-colors duration-500">PORT</span>
                  <span className="text-4xl md:text-5xl lg:text-6xl font-light text-white/30 group-hover:text-white transition-colors duration-500">{opt}</span>
                  <div className="absolute -bottom-4 left-0 w-0 h-[2px] bg-white group-hover:w-full transition-all duration-700 ease-out"></div>
                </button>
                {i < options.length - 1 && (
                  <span className="hidden md:block text-3xl md:text-4xl font-light text-white/10">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Game Over State */}
      {isGameOver && (
        <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-1000">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6">Final Protocol Score</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={initGame} disabled={isLoading} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit disabled:opacity-50">
            {isLoading ? 'Generating Target Ports with AI...' : 'Restart Sequence'}
            {!isLoading && <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>}
          </button>
        </div>
      )}
    </div>
  );
};

export default PortMatcher;
