import React, { useState, useEffect } from 'react';

const CHALLENGES = [
  {
    id: 1,
    title: "Payload Interception",
    description: "We intercepted this payload from a suspicious agent. It looks like standard encoding. Decode it to find the flag.",
    payload: "VEVTVE5PVkFfRkxBR3tCQVNFNjRfSVNfTk9UX0VOQ1JZUFRJT059",
    type: "input",
    answer: "TESTNOVA_FLAG{BASE64_IS_NOT_ENCRYPTION}"
  },
  {
    id: 2,
    title: "Ancient Cipher",
    description: "The agent used an ancient substitution cipher (Shift by 3) to hide this message. Decrypt it.",
    payload: "WHVWQRYD_IODJ{FDHVDU_FLSKHU_FUDFNHG}",
    type: "input",
    answer: "TESTNOVA_FLAG{CAESAR_CIPHER_CRACKED}"
  },
  {
    id: 3,
    title: "Machine Language",
    description: "We extracted this raw binary stream from memory. Convert it to ASCII text.",
    payload: "01010100 01000101 01010011 01010100 01001110 01001111 01010110 01000001 01011111 01000110 01001100 01000001 01000111",
    type: "input",
    answer: "TESTNOVA_FLAG"
  },
  {
    id: 4,
    title: "Hash Identification",
    description: "The database leaked a password hash: 5d41402abc4b2a76b9719d911017c592. Based on its length and character set, what algorithm generated this?",
    payload: "5d41402abc4b2a76b9719d911017c592",
    type: "choice",
    options: ["SHA-256", "MD5", "BCrypt", "Argon2"],
    answer: "MD5"
  }
];

const CryptographyBreaker = ({ onBack }) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

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
      setScore(s => s + 250);
      setFeedback({ type: 'success', text: 'DECRYPTION SUCCESSFUL. FLAG CAPTURED.' });
      
      setTimeout(() => {
        if (currentChallenge < CHALLENGES.length - 1) {
          setCurrentChallenge(c => c + 1);
          setInput("");
          setFeedback(null);
        } else {
          setIsGameOver(true);
        }
      }, 1500);
    } else {
      setScore(s => Math.max(0, s - 50));
      setFeedback({ type: 'error', text: 'DECRYPTION FAILED. INCORRECT FLAG.' });
    }
  };

  const handleChoice = (option) => {
    if (option === challenge.answer) {
      setScore(s => s + 250);
      setFeedback({ type: 'success', text: 'ALGORITHM VERIFIED.' });
      setTimeout(() => {
        if (currentChallenge < CHALLENGES.length - 1) {
          setCurrentChallenge(c => c + 1);
          setInput("");
          setFeedback(null);
        } else {
          setIsGameOver(true);
        }
      }, 1500);
    } else {
      setScore(s => Math.max(0, s - 50));
      setFeedback({ type: 'error', text: 'INCORRECT ALGORITHM DETECTED.' });
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
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8">Payload {currentChallenge + 1} / {CHALLENGES.length}</div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-none uppercase">
              {challenge.title}
            </h2>
            <p className="text-xl md:text-2xl font-light text-gray-400 leading-relaxed mb-12">
              {challenge.description}
            </p>
            
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-4">Target Payload</div>
            <code className="text-2xl md:text-3xl font-mono text-white break-all leading-tight">
              {challenge.payload}
            </code>
          </div>

          {/* Right: Input / Options */}
          <div className="w-full md:w-1/2 flex flex-col justify-start h-full pt-8 md:pt-0 md:pl-8">
            {challenge.type === 'input' ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-12">
                <div>
                  <label className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8 block">Enter Decrypted Flag</label>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="TESTNOVA_FLAG{...}"
                    className="w-full bg-transparent border-b-2 border-white/20 text-white text-xl md:text-3xl font-mono p-4 outline-none focus:border-white transition-colors placeholder-white/10"
                    autoFocus
                    disabled={feedback?.type === 'success'}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!input.trim() || feedback?.type === 'success'}
                  className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all disabled:opacity-30 disabled:hover:text-white w-fit"
                >
                  Submit Decryption
                  <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-12">
                <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8 block">Select Algorithm</div>
                <div className="flex flex-col gap-6">
                  {challenge.options.map((opt, i) => (
                    <button 
                      key={opt}
                      onClick={() => handleChoice(opt)}
                      disabled={feedback?.type === 'success'}
                      className="group flex items-center gap-6 w-full outline-none disabled:opacity-50"
                    >
                      <span className="text-sm md:text-base font-bold text-gray-700 opacity-50 group-hover:opacity-100 transition-opacity w-8 text-right">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xl md:text-2xl lg:text-3xl font-mono font-light text-white/40 group-hover:text-white transition-all duration-500 bg-left-bottom bg-gradient-to-r from-white to-white bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] pb-2">
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {feedback && (
              <div className={`mt-12 text-xs font-bold tracking-[0.3em] uppercase ${feedback.type === 'success' ? 'text-white' : 'text-gray-500'}`}>
                {feedback.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over State */}
      {isGameOver && (
        <div className="flex-1 flex flex-col justify-center items-end text-right animate-in fade-in duration-1000 max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 mr-2">Mission Accomplished</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={() => { setCurrentChallenge(0); setScore(0); setTimeLeft(600); setIsGameOver(false); setInput(""); }} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
            Restart Mission
          </button>
        </div>
      )}
    </div>
  );
};

export default CryptographyBreaker;
