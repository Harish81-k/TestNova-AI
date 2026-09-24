import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const QUESTIONS = [
  { q: "What comes next: 2, 4, 8, 16, ?", a: "32", options: ["24", "32", "64", "20"] },
  { q: "If A=1, B=2, C=3, what is E?", a: "5", options: ["4", "5", "6", "7"] },
  { q: "What is 15% of 200?", a: "30", options: ["25", "30", "35", "40"] },
  { q: "Which is the odd one out: Java, Python, HTML, C++?", a: "HTML", options: ["Java", "Python", "HTML", "C++"] },
  { q: "Solve: 8 + 2 * 4", a: "16", options: ["40", "16", "32", "14"] },
  { q: "What comes next: 1, 1, 2, 3, 5, ?", a: "8", options: ["6", "7", "8", "9"] },
  { q: "If NO = 1415, what is YES?", a: "25519", options: ["24519", "25519", "25518", "25419"] },
  { q: "Solve: 100 / (4 + 6)", a: "10", options: ["20", "15", "10", "5"] },
  { q: "What is the square root of 144?", a: "12", options: ["10", "12", "14", "16"] },
  { q: "Which is the fastest sorting algorithm on average?", a: "Quick Sort", options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Insertion Sort"] }
];

const RapidFireLogic = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [questions, setQuestions] = useState([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setScore(0);
    setTimeLeft(60);
    setCurrentIndex(0);
    setIsPlaying(true);
    setIsGameOver(false);
    startTimeRef.current = Date.now();
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    axios.post('/gaming/result', {
      gameName: 'Rapid Fire Logic',
      score: score,
      maxScore: null,
      level: 'medium',
      durationSeconds,
      details: { questionsAnswered: currentIndex }
    }).catch(err => console.error('Failed to save game result', err));
  };

  const handleAnswer = (selected) => {
    if (selected === questions[currentIndex].a) {
      setScore((s) => s + 10);
    } else {
      setScore((s) => Math.max(0, s - 5)); // Penalize for wrong answer
    }
    
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((c) => c + 1);
    } else {
      setQuestions(prev => [...prev].sort(() => 0.5 - Math.random()));
      setCurrentIndex(0);
    }
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
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 ml-2">Module 05</div>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-none mb-8 uppercase">Rapid Fire<br/>Logic</h1>
          <p className="text-gray-400 font-light max-w-lg text-base md:text-xl mb-12">
            Test your aptitude and logical reasoning. You have 60 seconds to answer as many questions as possible.
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
            <div className={`text-2xl md:text-3xl font-light ${timeLeft <= 10 ? 'text-white animate-pulse' : 'text-gray-300'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
          </div>
          <div>
            <div className="text-[9px] tracking-[0.3em] text-gray-600 uppercase font-bold mb-1">Score</div>
            <div className="text-2xl md:text-3xl font-light text-white">{score}</div>
          </div>
        </div>
      )}

      {/* Game State - 50/50 Split */}
      {isPlaying && questions[currentIndex] && (
        <div className="flex-1 flex flex-col md:flex-row w-full h-full animate-in fade-in duration-700 pt-24 md:pt-32 pb-12 items-stretch justify-center max-w-[90rem] mx-auto gap-8 md:gap-16">
          
          {/* Left: The Scenario (Question) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-16">
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8">Query {currentIndex + 1}</div>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              {questions[currentIndex].q}
            </p>
          </div>

          {/* Right: The Options (Answers) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center h-full pt-8 md:pt-0 md:pl-8">
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8 md:mb-12">Select Option</div>
            <div className="flex flex-col gap-6 md:gap-10">
              {questions[currentIndex].options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="group flex items-center gap-6 w-full outline-none text-left"
                >
                  <span className="text-sm md:text-base font-bold text-gray-700 opacity-50 group-hover:opacity-100 transition-opacity w-8 text-right shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl md:text-2xl lg:text-3xl font-mono font-light text-white/40 group-hover:text-white transition-all duration-500 bg-left-bottom bg-gradient-to-r from-white to-white bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] pb-2 uppercase">
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
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 mr-2">Time Expired</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
            Restart Sequence
          </button>
        </div>
      )}
    </div>
  );
};

export default RapidFireLogic;
