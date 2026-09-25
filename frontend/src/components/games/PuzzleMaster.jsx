import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiClock, FiCheck, FiPlay, FiAward } from 'react-icons/fi';
import axios from 'axios';

const puzzles = [
  {
    question: "Which data structure is best for implementing a LIFO mechanism?",
    options: ["Queue", "Stack", "Linked List", "Binary Tree"],
    answer: "Stack"
  },
  {
    question: "In a Microservices architecture, what pattern is used to handle distributed transactions?",
    options: ["Singleton", "Saga Pattern", "Observer", "Factory"],
    answer: "Saga Pattern"
  },
  {
    question: "What is the time complexity of searching in a perfectly balanced Binary Search Tree?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    answer: "O(log n)"
  },
  {
    question: "Which caching strategy writes data to the cache and the backing store simultaneously?",
    options: ["Write-Through", "Write-Back", "Write-Around", "Cache-Aside"],
    answer: "Write-Through"
  },
  {
    question: "Which algorithm is used to find the shortest path in a graph with non-negative edge weights?",
    options: ["DFS", "Kruskal's", "Dijkstra's", "Prim's"],
    answer: "Dijkstra's"
  }
];

const PuzzleMaster = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

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
    setCurrentIndex(0);
    setTimeLeft(60);
    setGameOver(false);
    setIsPlaying(true);
    setSelectedOption(null);
  };

  const handleOptionClick = (option) => {
    if (gameOver) return;
    setSelectedOption(option);
    
    if (option === puzzles[currentIndex].answer) {
      setScore(score + 10);
    }

    setTimeout(() => {
      if (currentIndex < puzzles.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        handleGameOver();
      }
    }, 1000);
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);
    
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post('/gaming/result', {
          gameName: 'PuzzleMaster',
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
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      
      <div className="flex justify-between items-center z-10 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <FiArrowLeft /> Back to Modules
        </button>
        <div className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          PUZZLEMASTER
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-cyan-400">
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
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto mb-8 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center justify-center text-white rotate-12">
              <FiCheck size={48} className="-rotate-12" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Algorithmic Mastery</h2>
            <p className="text-slate-400 mb-8">Map out the correct data structures and architectural patterns to solve complex problems before time runs out.</p>
            <button onClick={startGame} className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 mx-auto">
              <FiPlay /> Begin Assessment
            </button>
          </div>
        ) : gameOver ? (
          <div className="text-center bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl animate-in zoom-in">
            <div className="w-20 h-20 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAward size={40} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Assessment Complete</h3>
            <p className="text-slate-400 mb-8">You achieved a mastery score of {score}.</p>
            <button onClick={startGame} className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] mx-auto">
              Retake Assessment
            </button>
          </div>
        ) : (
          <div className="w-full max-w-3xl">
            <div className="mb-4 text-cyan-400 font-bold uppercase tracking-widest text-sm">Question {currentIndex + 1} / {puzzles.length}</div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-10 leading-tight">
              {puzzles[currentIndex].question}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {puzzles[currentIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                  className={`p-6 rounded-2xl text-left font-semibold text-lg transition-all duration-300 border ${
                    selectedOption === option 
                      ? option === puzzles[currentIndex].answer
                        ? 'bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                        : 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                      : selectedOption !== null && option === puzzles[currentIndex].answer
                        ? 'bg-green-500/10 border-green-500/50 text-green-300' // Show correct answer if wrong
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 text-slate-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleMaster;
