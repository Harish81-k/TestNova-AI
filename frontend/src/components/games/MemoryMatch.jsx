import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TECH_TERMS_POOL = [
  { match: 'API', term: 'API', def: 'Application Programming Interface' },
  { match: 'DOM', term: 'DOM', def: 'Document Object Model' },
  { match: 'O(1)', term: 'O(1)', def: 'Constant Time Complexity' },
  { match: 'SQL', term: 'SQL', def: 'Structured Query Language' },
  { match: 'O(n^2)', term: 'O(n^2)', def: 'Quadratic Time Complexity' },
  { match: 'JSON', term: 'JSON', def: 'JavaScript Object Notation' },
  { match: 'JWT', term: 'JWT', def: 'JSON Web Token' },
  { match: 'REST', term: 'REST', def: 'Representational State Transfer' },
  { match: 'HTTP', term: 'HTTP', def: 'HyperText Transfer Protocol' },
  { match: 'CSS', term: 'CSS', def: 'Cascading Style Sheets' },
  { match: 'NPM', term: 'NPM', def: 'Node Package Manager' },
  { match: 'SSH', term: 'SSH', def: 'Secure Shell' },
  { match: 'MVC', term: 'MVC', def: 'Model View Controller' },
  { match: 'URI', term: 'URI', def: 'Uniform Resource Identifier' },
  { match: 'DNS', term: 'DNS', def: 'Domain Name System' },
  { match: 'CI/CD', term: 'CI/CD', def: 'Continuous Integration & Deployment' },
  { match: 'O(log n)', term: 'O(log n)', def: 'Logarithmic Time Complexity' },
  { match: 'OOP', term: 'OOP', def: 'Object-Oriented Programming' },
  { match: 'CORS', term: 'CORS', def: 'Cross-Origin Resource Sharing' },
  { match: 'XSS', term: 'XSS', def: 'Cross-Site Scripting' }
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MemoryMatch = ({ onBack }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const startTimeRef = useRef(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledPool = shuffleArray(TECH_TERMS_POOL).slice(0, 6);
    
    const generatedCards = [];
    shuffledPool.forEach((item, index) => {
      generatedCards.push({ id: index * 2, term: item.term, match: item.match, type: 'term' });
      generatedCards.push({ id: index * 2 + 1, term: item.def, match: item.match, type: 'def' });
    });

    setCards(shuffleArray(generatedCards));
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsGameOver(false);
    startTimeRef.current = Date.now();
  };

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2) return;
    if (flippedIndices.includes(index) || matchedPairs.includes(cards[index].match)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.match === secondCard.match) {
        setMatchedPairs((prev) => {
          const newPairs = [...prev, firstCard.match];
          if (newPairs.length === 6) {
            setTimeout(() => {
              setIsGameOver(true);
              const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
              // Save result
              axios.post('/gaming/result', {
                gameName: 'Tech Memory Match',
                score: 100 - (moves * 2), // Example score logic
                maxScore: 100,
                level: 'easy',
                durationSeconds,
                details: { totalMoves: moves + 1 } // Because moves is updated asynchronously
              }).catch(err => console.error('Failed to save game result', err));
            }, 500);
          }
          return newPairs;
        });
        setFlippedIndices([]);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white font-sans overflow-y-auto overflow-x-hidden selection:bg-white/20">
      
      {/* Header */}
      <div className="flex justify-between items-center p-8 md:p-12 w-full shrink-0 z-20 sticky top-0 bg-black/80 backdrop-blur-md">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-all"
        >
          <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
          Abort
        </button>
        
        <div className="text-right flex gap-12">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold mb-1">Pairs</div>
            <div className="text-2xl font-light text-white">{matchedPairs.length} / 6</div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold mb-1">Moves</div>
            <div className="text-2xl font-light text-white">{moves}</div>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pb-12 flex flex-col items-center justify-center min-h-0">
        {!isGameOver ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 w-full aspect-video max-h-[70vh]">
            {cards.map((card, index) => {
              const isCurrentlyFlipped = flippedIndices.includes(index);
              const isMatched = matchedPairs.includes(card.match);
              const isFlipped = isCurrentlyFlipped || isMatched;

              return (
                <div 
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className="relative perspective-1000 w-full h-full cursor-pointer group"
                >
                  <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front (Closed State) */}
                    <div className="absolute inset-0 backface-hidden w-full h-full bg-black border border-white/20 group-hover:border-white/50 transition-colors flex flex-col items-center justify-center">
                      <span className="font-mono text-xl md:text-3xl tracking-[0.3em] text-gray-700 group-hover:text-white transition-colors">
                        {index.toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* Back (Flipped State) */}
                    <div className={`absolute inset-0 backface-hidden w-full h-full rotate-y-180 flex flex-col justify-center items-center p-4 text-center border-2 overflow-hidden
                      ${isMatched ? 'bg-gray-900 border-gray-800 text-gray-600' : 'bg-white border-white text-black'}
                    `}>
                      <div className="absolute top-2 left-3">
                         <div className={`text-[8px] uppercase tracking-[0.3em] font-bold ${isMatched ? 'text-gray-700' : 'text-gray-400'}`}>
                           {card.type === 'term' ? 'Term' : 'Definition'}
                         </div>
                      </div>
                      
                      <div className={`font-light leading-tight w-full 
                        ${isMatched ? 'text-sm md:text-lg' : (card.type === 'term' ? 'text-lg md:text-2xl font-bold' : 'text-sm md:text-xl')}
                      `}>
                        {card.term}
                      </div>

                      {isMatched && (
                        <div className="absolute bottom-2 right-3">
                           <div className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-700">
                             Verified
                           </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center animate-in fade-in duration-1000 flex flex-col items-center justify-center">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">Complete.</h2>
            <div className="flex flex-col items-center gap-2 my-12">
               <div className="text-7xl font-light mb-2">{moves}</div>
               <div className="text-xs text-gray-500 tracking-[0.3em] uppercase">Total Moves</div>
            </div>
            
            <button 
              onClick={initializeGame} 
              className="group px-12 py-5 border-2 border-white/20 hover:border-white transition-all duration-500"
              style={{ 
                background: 'linear-gradient(to top, white 50%, transparent 50%)',
                backgroundSize: '100% 200%',
                backgroundPosition: 'top left',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundPosition = 'bottom left'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundPosition = 'top left'}
            >
              <span className="relative z-10 text-xs font-bold tracking-[0.3em] uppercase text-white group-hover:text-black transition-colors duration-500">
                Restart Sequence
              </span>
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
};

export default MemoryMatch;
