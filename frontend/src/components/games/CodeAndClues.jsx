import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiClock, FiSearch, FiAward, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const snippets = [
  {
    title: "React State Bug",
    code: `function Counter() {
  const [count, setCount] = useState(0);
  
  const incrementTwice = () => {
    setCount(count + 1);
    setCount(count + 1); // Bug here
  };
  
  return <button onClick={incrementTwice}>{count}</button>;
}`,
    bugLine: 5,
    explanation: "State updates in React are batched. Using the previous state value directly from closure (count + 1) twice will result in it only incrementing by 1. Use the updater function: setCount(prev => prev + 1)."
  },
  {
    title: "Memory Leak",
    code: `useEffect(() => {
  const timer = setInterval(() => {
    console.log("Tick");
  }, 1000);
  
  // Missing cleanup function
}, []);`,
    bugLine: 5,
    explanation: "Missing cleanup function. The interval will continue running even after the component unmounts, causing a memory leak. Return a cleanup function: () => clearInterval(timer)."
  },
  {
    title: "Async Issue",
    code: `async function fetchData() {
  const result = fetch('https://api.example.com/data'); // Missing await
  const data = await result.json();
  return data;
}`,
    bugLine: 1,
    explanation: "fetch() returns a Promise. You need to await it before calling .json() on the Response object."
  }
];

const CodeAndClues = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0 && !gameOver && !revealed) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isPlaying && !revealed) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, gameOver, revealed]);

  const startGame = () => {
    setScore(0);
    setCurrentIndex(0);
    setTimeLeft(90);
    setGameOver(false);
    setIsPlaying(true);
    setRevealed(false);
    setSelectedLine(null);
  };

  const handleLineClick = (index) => {
    if (revealed || gameOver) return;
    setSelectedLine(index);
    setRevealed(true);
    
    if (index === snippets[currentIndex].bugLine) {
      setScore(score + 20);
    }
  };

  const nextSnippet = () => {
    if (currentIndex < snippets.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRevealed(false);
      setSelectedLine(null);
    } else {
      handleGameOver();
    }
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);
    
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post('/gaming/result', {
          gameName: 'Code & Clues',
          score,
          durationSeconds: 90 - timeLeft,
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
    <div className="h-full flex flex-col p-8 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      
      <div className="flex justify-between items-center z-10 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Modules
        </button>
        <div className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
          CODE & CLUES
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-emerald-400">
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
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center text-white">
              <FiSearch size={40} />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Find the Bug</h2>
            <p className="text-slate-400 mb-8">Analyze the provided code snippet and click on the exact line containing the logical error before time runs out.</p>
            <button onClick={startGame} className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Start Investigation
            </button>
          </div>
        ) : gameOver ? (
          <div className="text-center bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl animate-in zoom-in">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAward size={40} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Investigation Complete</h3>
            <p className="text-slate-400 mb-8">You found bugs worth {score} points.</p>
            <button onClick={startGame} className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-all mx-auto">
              New Case
            </button>
          </div>
        ) : (
          <div className="w-full max-w-4xl flex flex-col h-full max-h-[70vh]">
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-1">Snippet {currentIndex + 1} / {snippets.length}</div>
                <h3 className="text-2xl font-bold text-white">{snippets[currentIndex].title}</h3>
              </div>
              {revealed && (
                <button onClick={nextSnippet} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-sm transition-all">
                  {currentIndex < snippets.length - 1 ? 'Next Snippet' : 'Finish Game'}
                </button>
              )}
            </div>
            
            <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex-1 flex flex-col font-mono text-sm relative">
              <div className="flex-1 overflow-y-auto p-4">
                {snippets[currentIndex].code.split('\n').map((line, idx) => {
                  const isBugLine = idx === snippets[currentIndex].bugLine;
                  const isSelected = selectedLine === idx;
                  
                  let lineClasses = "flex group cursor-pointer transition-colors py-1 px-2 rounded ";
                  if (!revealed) {
                    lineClasses += "hover:bg-white/10 text-slate-300";
                  } else {
                    if (isBugLine) {
                      lineClasses += "bg-red-500/20 border border-red-500/50 text-red-200";
                    } else if (isSelected && !isBugLine) {
                      lineClasses += "bg-white/10 border border-white/20 text-slate-400";
                    } else {
                      lineClasses += "text-slate-500 opacity-50";
                    }
                  }

                  return (
                    <div key={idx} onClick={() => handleLineClick(idx)} className={lineClasses}>
                      <span className="w-8 text-slate-600 shrink-0 select-none">{idx + 1}</span>
                      <pre className="whitespace-pre-wrap font-inherit m-0">{line || ' '}</pre>
                      {revealed && isBugLine && (
                        <div className="ml-auto text-red-400">
                          <FiAlertCircle />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {revealed && (
                <div className={`p-6 border-t animate-in slide-in-from-bottom-4 ${selectedLine === snippets[currentIndex].bugLine ? 'bg-emerald-900/40 border-emerald-500/30' : 'bg-red-900/40 border-red-500/30'}`}>
                  <h4 className={`font-bold mb-2 ${selectedLine === snippets[currentIndex].bugLine ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedLine === snippets[currentIndex].bugLine ? 'Correct Bug Identified!' : 'Incorrect Line Identified'}
                  </h4>
                  <p className="text-slate-300 leading-relaxed">{snippets[currentIndex].explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAndClues;
