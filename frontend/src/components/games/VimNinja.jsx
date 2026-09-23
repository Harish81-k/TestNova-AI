import React, { useState, useEffect } from 'react';

const CHALLENGES = [
  {
    id: 1,
    title: "Global Replacement",
    description: "You have a file where the word 'foo' needs to be replaced with 'bar' everywhere, on all lines. What is the single ex command to do this?",
    answer: ":%s/foo/bar/g"
  },
  {
    id: 2,
    title: "Delete Line",
    description: "Your cursor is anywhere on a line. What is the 2-keystroke normal mode command to delete the entire line?",
    answer: "dd"
  },
  {
    id: 3,
    title: "Jump to End",
    description: "You are at the top of a 1000-line file. What is the single normal mode keystroke to jump to the very bottom of the file?",
    answer: "G"
  },
  {
    id: 4,
    title: "Change Word",
    description: "Your cursor is at the beginning of a word you want to replace. What is the 2-keystroke command to delete the word and immediately drop into insert mode?",
    answer: "cw"
  },
  {
    id: 5,
    title: "Undo",
    description: "You just made a mistake. What is the single keystroke command in normal mode to undo your last action?",
    answer: "u"
  }
];

const VimNinja = ({ onBack }) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);

  const challenge = CHALLENGES[currentChallenge];

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    if (input.trim() === challenge.answer) {
      setScore(s => s + 200);
      setFeedback({ type: 'success', text: 'COMMAND ACCEPTED.' });
      
      setTimeout(() => {
        if (currentChallenge < CHALLENGES.length - 1) {
          setCurrentChallenge(c => c + 1);
          setInput("");
          setFeedback(null);
        } else {
          setIsGameOver(true);
        }
      }, 1000);
    } else {
      setScore(s => Math.max(0, s - 50));
      setFeedback({ type: 'error', text: 'INVALID COMMAND SEQUENCE.' });
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-black text-white overflow-y-auto overflow-x-hidden p-8 md:p-16 font-sans selection:bg-white/20 selection:text-white">
      
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
            <div className={`text-2xl md:text-3xl font-light ${timeLeft <= 60 ? 'text-white animate-pulse' : 'text-gray-300'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div>
            <div className="text-[9px] tracking-[0.3em] text-gray-600 uppercase font-bold mb-1">Score</div>
            <div className="text-2xl md:text-3xl font-light text-white">{score}</div>
          </div>
        </div>
      )}

      {/* Game State - 50/50 Split */}
      {!isGameOver && (
        <div className="flex-1 flex flex-col md:flex-row w-full h-full animate-in fade-in duration-700 pt-24 md:pt-32 pb-12 items-start justify-center max-w-[90rem] mx-auto gap-8 md:gap-16">
          
          {/* Left: The Scenario */}
          <div className="w-full md:w-1/2 flex flex-col justify-start border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-16 md:sticky md:top-32 h-fit">
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8">Trial {currentChallenge + 1} / {CHALLENGES.length}</div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-none uppercase">
              {challenge.title}
            </h2>
            <p className="text-xl md:text-2xl font-light text-gray-400 leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Right: Input Terminal */}
          <div className="w-full md:w-1/2 flex flex-col justify-start h-full pt-8 md:pt-0 md:pl-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-12">
              <div>
                <label className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8 block">Input Sequence</label>
                <div className="flex items-center border-b-2 border-white/20 focus-within:border-white transition-colors pb-2">
                  <span className="text-2xl md:text-4xl font-mono text-gray-600 mr-6 font-bold">~</span>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter command..."
                    className="w-full bg-transparent text-white text-2xl md:text-4xl font-mono outline-none placeholder-white/10"
                    autoFocus
                    disabled={feedback?.type === 'success'}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={!input.trim() || feedback?.type === 'success'}
                className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all disabled:opacity-30 disabled:hover:text-white w-fit"
              >
                Execute Action
                <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
              </button>
            </form>

            {feedback && (
              <div className={`mt-12 text-xs font-bold tracking-[0.3em] uppercase ${feedback.type === 'success' ? 'text-white' : 'text-gray-500'}`}>
                {feedback.text}
              </div>
            )}
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="flex-1 flex flex-col justify-center items-end text-right animate-in fade-in duration-1000 max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 mr-2">Dojo Complete</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={() => { setCurrentChallenge(0); setScore(0); setTimeLeft(300); setIsGameOver(false); setInput(""); }} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
            Restart Dojo
          </button>
        </div>
      )}
    </div>
  );
};

export default VimNinja;
