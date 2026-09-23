import React, { useState, useEffect } from 'react';

const HTTP_STATUS_CODES = [
  { code: 200, meaning: "OK" },
  { code: 201, meaning: "Created" },
  { code: 204, meaning: "No Content" },
  { code: 301, meaning: "Moved Permanently" },
  { code: 304, meaning: "Not Modified" },
  { code: 400, meaning: "Bad Request" },
  { code: 401, meaning: "Unauthorized" },
  { code: 403, meaning: "Forbidden" },
  { code: 404, meaning: "Not Found" },
  { code: 409, meaning: "Conflict" },
  { code: 418, meaning: "I'm a teapot" },
  { code: 429, meaning: "Too Many Requests" },
  { code: 500, meaning: "Internal Server Error" },
  { code: 502, meaning: "Bad Gateway" },
  { code: 503, meaning: "Service Unavailable" }
];

const HttpStatusGame = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const startRound = () => {
    const target = HTTP_STATUS_CODES[Math.floor(Math.random() * HTTP_STATUS_CODES.length)];
    
    // Pick 3 random wrong answers
    let wrongOptions = [...HTTP_STATUS_CODES].filter(s => s.code !== target.code);
    wrongOptions = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const opts = [target.meaning, ...wrongOptions.map(w => w.meaning)].sort(() => 0.5 - Math.random());
    
    setCurrentQuestion(target);
    setOptions(opts);
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

  const handleGuess = (guessedMeaning) => {
    if (guessedMeaning === currentQuestion.meaning) {
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
        
        <div className="flex-1 flex flex-col justify-center items-start text-left max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 ml-2">Module 08</div>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-none mb-8 uppercase">Status<br/>Decoder</h1>
          <p className="text-gray-400 font-light max-w-lg text-base md:text-xl mb-12">
            Test your API knowledge. Match the HTTP status code to its exact meaning.
          </p>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            Initiate Handshake
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

      {/* Game State - 50/50 Split */}
      {isPlaying && currentQuestion && (
        <div className="flex-1 flex flex-col md:flex-row w-full h-full animate-in fade-in duration-700 pt-24 md:pt-32 pb-12 items-stretch justify-center max-w-[90rem] mx-auto gap-8 md:gap-16">
          
          {/* Left: The Scenario (Question) */}
          <div className="w-full md:w-1/2 flex flex-col justify-start pt-0 border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-16">
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8">HTTP Status Code</div>
            <p className="text-[5rem] md:text-[6rem] lg:text-[8rem] font-mono font-light text-white leading-none tracking-tighter">
              {currentQuestion.code}
            </p>
          </div>

          {/* Right: The Options (Answers) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center h-full pt-8 md:pt-0 md:pl-8">
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8 md:mb-12">Select Meaning</div>
            <div className="flex flex-col gap-6 md:gap-10">
              {options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleGuess(opt)}
                  className="group flex items-center gap-6 w-full outline-none"
                >
                  <span className="text-sm md:text-base font-bold text-gray-700 opacity-50 group-hover:opacity-100 transition-opacity w-8 text-right">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white/40 group-hover:text-white transition-all duration-500 bg-left-bottom bg-gradient-to-r from-white to-white bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] pb-2 uppercase tracking-tighter text-left">
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Game Over State */}
      {isGameOver && (
        <div className="flex-1 flex flex-col justify-center items-end text-right animate-in fade-in duration-1000 max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 mr-2">Final Status Score</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
            Restart Simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default HttpStatusGame;
