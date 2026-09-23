import React, { useState, useEffect, useRef } from 'react';

const SNIPPETS = [
  "function factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}",
  "const sum = arr.reduce((a, b) => a + b, 0);",
  "app.get('/api/users', async (req, res) => {\n  const users = await User.find();\n  res.json(users);\n});",
  "document.getElementById('btn').addEventListener('click', () => {\n  console.log('Clicked!');\n});",
  "for (let i = 0; i < 10; i++) {\n  console.log(i);\n}"
];

const CodeRacer = ({ onBack }) => {
  const [snippet, setSnippet] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const randomSnippet = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
    setSnippet(randomSnippet);
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleInputChange = (e) => {
    if (isFinished) return;
    
    const val = e.target.value;
    
    // Start timer on first keystroke
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setInput(val);

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === snippet[i]) correctChars++;
    }
    const acc = val.length === 0 ? 100 : Math.round((correctChars / val.length) * 100);
    setAccuracy(acc);

    // Check completion
    if (val === snippet) {
      const endTime = Date.now();
      const timeInMinutes = (endTime - startTime) / 60000;
      const words = snippet.length / 5; // Standard WPM calculation (5 chars = 1 word)
      setWpm(Math.round(words / timeInMinutes));
      setIsFinished(true);
    }
  };

  const renderSnippet = () => {
    return snippet.split('').map((char, index) => {
      let color = 'text-[#444]'; // Un-typed
      
      if (index < input.length) {
        if (input[index] === char) {
          color = 'text-white'; // Correct
        } else {
          color = 'text-red-500 bg-red-500/20'; // Incorrect
        }
      } else if (index === input.length) {
        color = 'text-white border-b-2 border-white animate-pulse'; // Cursor
      }

      return (
        <span 
          key={index} 
          className={`${color} transition-colors duration-75`}
        >
          {char === '\n' ? '↵\n' : char}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full mx-auto relative bg-black text-white overflow-hidden selection:bg-white/20 selection:text-white font-sans">
      
      {/* Background Watermark Stats */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.03] overflow-hidden">
        <div className="text-[30vw] font-black leading-none tracking-tighter">
          {input.length === 0 ? '0' : wpm}
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        
        {/* Minimal Header */}
        <div className="flex justify-between items-center p-8 md:p-12 w-full">
          <button 
            onClick={onBack} 
            className="group flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-all"
          >
            <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
            Return
          </button>
          
          <div className="flex gap-12 text-right">
            <div>
              <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold mb-1">Velocity</div>
              <div className="text-3xl font-light">
                {input.length === 0 ? '--' : wpm} <span className="text-sm text-gray-600">wpm</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold mb-1">Accuracy</div>
              <div className={`text-3xl font-light ${(accuracy < 90 && input.length > 0) ? 'text-red-500' : 'text-white'}`}>
                {input.length === 0 ? '--' : accuracy}<span className="text-sm text-gray-600">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
          {!isFinished ? (
            <div className="w-full max-w-4xl relative">
              <div className="absolute -top-12 left-0 text-xs font-medium text-gray-600 tracking-widest uppercase">
                Input Source
              </div>
              
              <div className="relative">
                <pre className="whitespace-pre-wrap leading-[1.8] font-mono text-2xl md:text-4xl tracking-tight">
                  {renderSnippet()}
                </pre>
                
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-default resize-none z-20"
                  spellCheck="false"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            </div>
          ) : (
            <div className="text-center animate-in fade-in duration-700 flex flex-col items-center">
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">Complete.</h2>
              <div className="flex items-center gap-16 my-12">
                <div className="text-center">
                  <div className="text-7xl font-light mb-2">{wpm}</div>
                  <div className="text-xs text-gray-500 tracking-[0.3em] uppercase">WPM</div>
                </div>
                <div className="w-[1px] h-20 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-7xl font-light mb-2">{accuracy}%</div>
                  <div className="text-xs text-gray-500 tracking-[0.3em] uppercase">Accuracy</div>
                </div>
              </div>
              
              <button 
                onClick={initializeGame} 
                className="group relative px-12 py-5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <div className="absolute inset-0 border border-white/30"></div>
                <span className="relative z-10 text-xs font-bold tracking-[0.3em] uppercase text-white group-hover:text-black transition-colors duration-500">
                  Next Challenge
                </span>
              </button>
            </div>
          )}
        </div>
        
        {/* Minimal Footer */}
        <div className="p-8 md:p-12 flex justify-between items-center text-gray-600 text-[10px] tracking-widest uppercase font-bold">
          <div>Code Racer / Module 01</div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Awaiting Input
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRacer;
