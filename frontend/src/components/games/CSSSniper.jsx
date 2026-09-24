import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CSS_QUESTIONS = [
  {
    html: `<div id="app">\n  <p class="text">Hello</p>\n  <span class="text highlight">World</span>\n</div>`,
    target: "the span element",
    answer: "span.highlight",
    options: [".text", "span.highlight", "#app > .text", "div span"]
  },
  {
    html: `<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li class="active">Item 3</li>\n</ul>`,
    target: "the third list item",
    answer: "li:nth-child(3)",
    options: ["li:last-child", "li:nth-child(3)", "ul > li.active", "All of the above"]
  },
  {
    html: `<form>\n  <input type="text" />\n  <input type="password" />\n</form>`,
    target: "the password input",
    answer: "input[type=\"password\"]",
    options: ["input.password", "input[type=\"password\"]", "form > input:last", "input:nth-of-type(2)"]
  },
  {
    html: `<div class="container">\n  <a href="#">Link</a>\n  <p><a href="#">Nested Link</a></p>\n</div>`,
    target: "only the direct child link of container",
    answer: ".container > a",
    options: [".container a", ".container > a", "a:first-child", "div a"]
  },
  {
    html: `<article>\n  <h2>Title</h2>\n  <p>Content</p>\n  <p>More Content</p>\n</article>`,
    target: "the first paragraph immediately following the h2",
    answer: "h2 + p",
    options: ["h2 ~ p", "h2 + p", "article p:first-child", "p:first-of-type"]
  }
];

const CSSSniper = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const startTimeRef = useRef(null);

  const startGame = () => {
    setQuestions([...CSS_QUESTIONS].sort(() => 0.5 - Math.random()));
    setScore(0);
    setTimeLeft(60);
    setCurrentIndex(0);
    setIsPlaying(true);
    setIsGameOver(false);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setIsGameOver(true);
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      axios.post('/gaming/result', {
        gameName: 'CSS Sniper',
        score: score,
        maxScore: null,
        level: 'medium',
        durationSeconds,
        details: { finalTimeLeft: timeLeft }
      }).catch(err => console.error('Failed to save game result', err));
    }
  }, [isPlaying, timeLeft]);

  const handleGuess = (val) => {
    const q = questions[currentIndex];
    if (val === q.answer) {
      setScore(s => s + 10);
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(c => c + 1);
    } else {
      setQuestions(prev => [...prev].sort(() => 0.5 - Math.random()));
      setCurrentIndex(0);
    }
  };

  const currentOptions = React.useMemo(() => {
    if (!questions[currentIndex]) return [];
    return [...questions[currentIndex].options].sort(() => 0.5 - Math.random());
  }, [currentIndex, questions]);

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
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 ml-2">Module 06</div>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-none mb-8 uppercase">CSS<br/>Sniper</h1>
          <p className="text-gray-400 font-light max-w-lg text-base md:text-xl mb-12">
            Target the specific HTML element using the most precise CSS Selector. 60 seconds on the clock. One shot, one kill.
          </p>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit cursor-crosshair">
            Lock & Load
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

      {/* Game State - Golden Ratio Triptych */}
      {isPlaying && questions[currentIndex] && (
        <div className="flex-1 flex flex-col md:flex-row w-full h-full animate-in fade-in duration-700 pt-24 md:pt-32 pb-12 items-stretch justify-center max-w-7xl mx-auto gap-12 md:gap-16">
          
          {/* Left: Target & Source Document */}
          <div className="w-full md:w-[55%] flex flex-col justify-center gap-12 md:gap-20 h-full py-4">
            
            {/* Target */}
            <div>
              <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-4">Eliminate</div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-tight">
                {questions[currentIndex].target}
              </div>
            </div>

            {/* HTML */}
            <div>
              <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-4">Source Document</div>
              <pre className="text-lg md:text-xl lg:text-2xl font-mono text-white/50 leading-relaxed font-light overflow-x-auto whitespace-pre-wrap">
                {questions[currentIndex].html}
              </pre>
            </div>
          </div>

          {/* Right: Options */}
          <div className="w-full md:w-[45%] flex flex-col justify-center h-full border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-16">
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8 md:mb-16">Select Weapon</div>
            <div className="flex flex-col gap-6 md:gap-10">
              {currentOptions.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleGuess(opt)}
                  className="group relative flex items-center w-fit text-left outline-none transition-all duration-500 hover:translate-x-6 cursor-crosshair"
                >
                   <span className="text-[10px] tracking-[0.5em] text-gray-600 font-bold w-8 md:w-12 opacity-0 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                   <span className="text-xl md:text-2xl lg:text-3xl font-mono text-white/40 group-hover:text-white transition-colors duration-500">
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
        <div className="flex-1 flex flex-col justify-center items-start text-left animate-in fade-in duration-1000 max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 ml-2">Final Accuracy Score</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            Restart Simulation
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CSSSniper;
