import React, { useState } from 'react';
import MemoryMatch from '../components/games/MemoryMatch';
import RapidFireLogic from '../components/games/RapidFireLogic';
import CodeRacer from '../components/games/CodeRacer';
import HexGuesser from '../components/games/HexGuesser';
import PortMatcher from '../components/games/PortMatcher';
import BinaryChallenge from '../components/games/BinaryChallenge';
import RegexGame from '../components/games/RegexGame';
import CSSSniper from '../components/games/CSSSniper';
import GitChallenge from '../components/games/GitChallenge';
import HttpStatusGame from '../components/games/HttpStatusGame';
import SQLDetective from '../components/games/SQLDetective';
import ShortcutsGame from '../components/games/ShortcutsGame';
import AcronymsGame from '../components/games/AcronymsGame';
import CodingChallenge from '../components/games/CodingChallenge';
import SystemDesignArchitect from '../components/games/SystemDesignArchitect';
import CryptographyBreaker from '../components/games/CryptographyBreaker';
import VimNinja from '../components/games/VimNinja';

const GAMES = [
  {
    id: 'memory',
    title: 'Tech Memory Match',
    description: 'Test your knowledge by matching tech terms with their definitions in this classic card flipping game.',
    difficulty: 'easy',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-indigo-400">
        <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    color: 'bg-indigo-500/20'
  },
  {
    id: 'logic',
    title: 'Rapid Fire Logic',
    description: 'Answer as many logical reasoning and math sequences as possible in 60 seconds.',
    difficulty: 'medium',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-orange-500">
        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    color: 'bg-orange-500/20'
  },
  {
    id: 'racer',
    title: 'Code Racer',
    description: 'Improve your muscle memory! Type the provided code snippets as fast and accurately as possible.',
    difficulty: 'easy',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-emerald-400">
        <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    color: 'bg-emerald-500/20'
  },
  {
    id: 'hex',
    title: 'Hex Color Guesser',
    description: 'Test your designer eye. Can you guess the correct Hex code for the displayed color?',
    difficulty: 'easy',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-pink-400">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    color: 'bg-pink-500/20'
  },
  {
    id: 'port',
    title: 'Port Authority',
    description: 'Match the standard network ports to their correct services (HTTP, SSH, FTP, etc).',
    difficulty: 'easy',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-cyan-400">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
    color: 'bg-cyan-500/20'
  },
  {
    id: 'binary',
    title: 'Binary Brain',
    description: 'Convert 8-bit binary numbers into decimal against a countdown timer.',
    difficulty: 'medium',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-lime-400">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
    color: 'bg-lime-500/20'
  },
  {
    id: 'regex',
    title: 'Regex Validator',
    description: 'Find the string that perfectly matches the given regular expression pattern.',
    difficulty: 'medium',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-purple-400">
        <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    color: 'bg-purple-500/20'
  },
  {
    id: 'css',
    title: 'CSS Sniper',
    description: 'Select the exact CSS selector that targets a specific HTML element.',
    difficulty: 'medium',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-blue-400">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      </svg>
    ),
    color: 'bg-blue-500/20'
  },
  {
    id: 'git',
    title: 'Git Guru',
    description: 'Pick the correct Git command for a variety of tricky version control scenarios.',
    difficulty: 'medium',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-orange-400">
        <circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle><path d="M18 9v6"></path>
      </svg>
    ),
    color: 'bg-orange-500/20'
  },
  {
    id: 'http',
    title: 'HTTP Status Decoder',
    description: 'Match the HTTP status code to its correct meaning (200, 404, 500, etc).',
    difficulty: 'easy',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-teal-400">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>
    ),
    color: 'bg-teal-500/20'
  },
  {
    id: 'sql',
    title: 'SQL Detective',
    description: 'Identify the correct SQL query to achieve the specified goal from a schema.',
    difficulty: 'medium',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-rose-400">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      </svg>
    ),
    color: 'bg-rose-500/20'
  },
  {
    id: 'shortcuts',
    title: 'Shortcut Master',
    description: 'How fast can you navigate? Match IDE actions to their keyboard shortcuts.',
    difficulty: 'easy',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-yellow-400">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6" y2="8"></line>
      </svg>
    ),
    color: 'bg-yellow-500/20'
  },
  {
    id: 'acronyms',
    title: 'Tech Acronyms',
    description: 'What do they actually stand for? Expand common tech acronyms before time runs out.',
    difficulty: 'easy',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-indigo-400">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
      </svg>
    ),
    color: 'bg-indigo-500/20'
  },
  {
    id: 'coding_easy',
    title: 'Coding Challenge',
    description: 'Solve basic programming problems like strings, loops, and simple math.',
    difficulty: 'easy',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-green-400">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"></path>
      </svg>
    ),
    color: 'bg-green-500/20'
  },
  {
    id: 'coding_medium',
    title: 'Coding Challenge',
    description: 'Intermediate challenges including hash maps, two pointers, and simple recursion.',
    difficulty: 'medium',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-yellow-400">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"></path>
      </svg>
    ),
    color: 'bg-yellow-500/20'
  },
  {
    id: 'coding_hard',
    title: 'Coding Challenge',
    description: 'Test your deep programming knowledge with complex algorithms and dynamic programming.',
    difficulty: 'hard',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-red-400">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"></path>
      </svg>
    ),
    color: 'bg-red-500/20'
  },
  {
    id: 'system_design',
    title: 'System Design Architect',
    description: 'Design highly available, scalable architectures for global services.',
    difficulty: 'hard',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-indigo-400">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
    color: 'bg-indigo-500/20'
  },
  {
    id: 'crypto_breaker',
    title: 'Cryptography Breaker',
    description: 'Decrypt intercepted payloads, ciphers, and identify hashing algorithms.',
    difficulty: 'hard',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-green-500">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
    color: 'bg-green-500/20'
  },
  {
    id: 'vim_ninja',
    title: 'Vim Ninja',
    description: 'Master the terminal editor. Complete challenges using Vim keystrokes.',
    difficulty: 'hard',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-8 w-8 text-yellow-500">
        <polyline points="4 7 4 4 20 4 20 7"></polyline>
        <line x1="9" y1="20" x2="15" y2="20"></line>
        <line x1="12" y1="4" x2="12" y2="20"></line>
      </svg>
    ),
    color: 'bg-yellow-500/20'
  }
];

const GamingBoardInterface = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightMode, setIsLightMode] = useState(false);

  const renderGame = () => {
    switch (activeGame) {
      case 'memory': return <MemoryMatch onBack={() => setActiveGame(null)} />;
      case 'logic': return <RapidFireLogic onBack={() => setActiveGame(null)} />;
      case 'racer': return <CodeRacer onBack={() => setActiveGame(null)} />;
      case 'hex': return <HexGuesser onBack={() => setActiveGame(null)} />;
      case 'port': return <PortMatcher onBack={() => setActiveGame(null)} />;
      case 'binary': return <BinaryChallenge onBack={() => setActiveGame(null)} />;
      case 'regex': return <RegexGame onBack={() => setActiveGame(null)} />;
      case 'css': return <CSSSniper onBack={() => setActiveGame(null)} />;
      case 'git': return <GitChallenge onBack={() => setActiveGame(null)} />;
      case 'http': return <HttpStatusGame onBack={() => setActiveGame(null)} />;
      case 'sql': return <SQLDetective onBack={() => setActiveGame(null)} />;
      case 'shortcuts': return <ShortcutsGame onBack={() => setActiveGame(null)} />;
      case 'acronyms': return <AcronymsGame onBack={() => setActiveGame(null)} />;
      case 'coding_easy': return <CodingChallenge difficulty="basic" onBack={() => setActiveGame(null)} />;
      case 'coding_medium': return <CodingChallenge difficulty="intermediate" onBack={() => setActiveGame(null)} />;
      case 'coding_hard': return <CodingChallenge difficulty="advanced" onBack={() => setActiveGame(null)} />;
      case 'system_design': return <SystemDesignArchitect onBack={() => setActiveGame(null)} />;
      case 'crypto_breaker': return <CryptographyBreaker onBack={() => setActiveGame(null)} />;
      case 'vim_ninja': return <VimNinja onBack={() => setActiveGame(null)} />;
      default: return null;
    }
  };

  const ToggleButton = () => (
    <button 
      onClick={() => setIsLightMode(!isLightMode)}
      className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-[100] w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-sm"
      title="Toggle Session Theme"
    >
      {isLightMode ? (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
      )}
    </button>
  );

  if (activeGame) {
    return (
      <div 
        className="flex-1 w-full h-full bg-black overflow-hidden text-white font-sans transition-all duration-700 relative"
        style={{ filter: isLightMode ? 'invert(1) hue-rotate(180deg)' : 'none' }}
      >
        {renderGame()}
        <ToggleButton />
      </div>
    );
  }

  const filteredGames = filter === 'all' 
    ? GAMES 
    : GAMES.filter(g => g.difficulty === filter);

  // Compute a safe index for rendering to prevent out-of-bounds crashes
  const safeIndex = currentIndex >= filteredGames.length ? 0 : currentIndex;
  const currentGame = filteredGames[safeIndex];

  if (!currentGame) return null;

  return (
    <div 
      className="flex-1 flex w-full h-full bg-black text-white overflow-hidden relative font-sans selection:bg-white/20 transition-all duration-700"
      style={{ filter: isLightMode ? 'invert(1) hue-rotate(180deg)' : 'none' }}
    >
      <ToggleButton />
      
      {/* Background massive watermark of the current index */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black leading-none opacity-[0.02] pointer-events-none select-none tracking-tighter">
        {(currentIndex + 1).toString().padStart(2, '0')}
      </div>

      {/* Top Filter Bar */}
      <div className="absolute top-0 left-0 w-full p-8 md:p-12 flex justify-between items-center z-20">
        <h1 className="text-xl md:text-2xl font-bold tracking-tighter">Modules</h1>
        <div className="flex gap-4 md:gap-8">
          {['all', 'easy', 'medium', 'hard'].map(level => (
            <button
              key={level}
              onClick={() => {
                setFilter(level);
                setCurrentIndex(0);
              }}
              className={`text-xs uppercase tracking-[0.2em] font-bold transition-all ${
                filter === level ? 'text-white border-b-2 border-white' : 'text-gray-600 hover:text-white'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Left Navigation Area */}
      <div
        onClick={() => setCurrentIndex((prev) => (prev - 1 + filteredGames.length) % filteredGames.length)}
        className="w-1/4 h-full z-10 cursor-[w-resize] group flex items-center justify-start pl-8 md:pl-16 relative"
      >
        <div className="text-xs uppercase tracking-[0.5em] font-bold text-gray-600 group-hover:text-white transition-all transform -rotate-90 origin-left opacity-0 group-hover:opacity-100 duration-500">
          Previous
        </div>
      </div>

      {/* Center Focused Game Area */}
      <div className="flex-1 flex flex-col justify-center items-center z-20 text-center px-4 relative">
        <div 
          key={currentGame.id} // Forces re-render animation on change
          className="animate-in fade-in zoom-in duration-700 flex flex-col items-center"
        >
          {/* Difficulty Badge */}
          <div className="mb-8 text-[10px] uppercase tracking-[0.4em] font-bold flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${
              currentGame.difficulty === 'easy' ? 'bg-green-500' :
              currentGame.difficulty === 'medium' ? 'bg-orange-500' : 'bg-red-500'
            }`}></span>
            {currentGame.difficulty}
          </div>

          {/* Title */}
          <h2 className="text-6xl md:text-8xl lg:text-[120px] font-black tracking-tighter leading-none mb-8 hover:scale-105 transition-transform duration-500 cursor-default">
            {currentGame.title}
          </h2>

          {/* Description */}
          <p className="max-w-xl text-gray-400 text-sm md:text-base tracking-wide leading-relaxed mb-12">
            {currentGame.description}
          </p>

          {/* Play Button */}
          <button 
            onClick={() => setActiveGame(currentGame.id)}
            className="group px-12 py-5 rounded-full border border-white/20 hover:border-white transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            style={{ 
              background: 'linear-gradient(to top, white 50%, transparent 50%)',
              backgroundSize: '100% 200%',
              backgroundPosition: 'top left',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundPosition = 'bottom left'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundPosition = 'top left'}
          >
            <span className="relative z-10 text-xs font-bold tracking-[0.3em] uppercase text-white group-hover:text-black transition-colors duration-500 flex items-center gap-4">
              Initialize Module
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500 ease-out"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </span>
          </button>
        </div>
      </div>

      {/* Right Navigation Area */}
      <div
        onClick={() => setCurrentIndex((prev) => (prev + 1) % filteredGames.length)}
        className="w-1/4 h-full z-10 cursor-[e-resize] group flex items-center justify-end pr-8 md:pr-16 relative"
      >
        <div className="text-xs uppercase tracking-[0.5em] font-bold text-gray-600 group-hover:text-white transition-all transform rotate-90 origin-right opacity-0 group-hover:opacity-100 duration-500">
          Next
        </div>
      </div>

      {/* Bottom Progress Tracker */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {filteredGames.map((_, idx) => (
          <div 
            key={idx}
            className={`h-[2px] transition-all duration-500 ${
              idx === currentIndex ? 'w-12 bg-white' : 'w-4 bg-white/20'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default GamingBoardInterface;
