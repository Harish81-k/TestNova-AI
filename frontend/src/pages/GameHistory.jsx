import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GameHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, recent, highest
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/gaming/history');
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching game history', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedHistory = React.useMemo(() => {
    let sorted = [...history];
    if (filter === 'recent') {
      return sorted.slice(0, 5);
    } else if (filter === 'highest') {
      sorted.sort((a, b) => b.score - a.score);
      return sorted.slice(0, 10);
    }
    return sorted;
  }, [history, filter]);

  return (
    <div className="w-full h-full bg-[#0a0a0f] text-white p-8 overflow-y-auto relative">
      {/* Aesthetic glowing background orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 relative gap-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/gaming')}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              title="Back to Modules"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5 pr-0.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 drop-shadow-md">
              PlayCore <span className="font-light opacity-70">History</span>
            </h1>
          </div>
          <div className="flex gap-2 text-xs uppercase tracking-[0.2em] font-bold">
            {['all', 'recent', 'highest'].map((type) => (
              <button 
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full transition-all border backdrop-blur-md ${filter === type ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`}
              >
                {type === 'highest' ? 'Highest Scores' : type}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-2xl mb-4">No games played yet.</p>
            <button 
              onClick={() => navigate('/gaming')}
              className="px-6 py-2 border border-white/20 rounded hover:bg-white/10 transition-colors"
            >
              PLAY NOW
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {displayedHistory.map((game, index) => (
              <div 
                key={game._id}
                onClick={() => navigate(`/gaming/history/${game._id}`)}
                className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden"
              >
                {/* Glossy overlay */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                {/* Background number watermark */}
                <div className="absolute left-6 text-[100px] md:text-[120px] font-black text-white/5 pointer-events-none group-hover:text-blue-500/10 transition-colors duration-500 translate-y-2 mix-blend-overlay">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                
                <div className="relative z-10 flex-1 md:ml-20 mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${game.score > 0 ? 'bg-green-400 text-green-400' : 'bg-red-400 text-red-400'}`}></span>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </span>
                    {game.level && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-[0.2em] font-bold uppercase ${
                          game.level === 'easy' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                          game.level === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {game.level}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 group-hover:to-blue-400 transition-all duration-300 drop-shadow-md">
                    {game.gameName}
                  </h2>
                </div>
                
                <div className="relative z-10 flex items-center justify-between md:justify-end gap-8 w-full md:w-auto mt-4 md:mt-0 border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-4xl font-light tracking-tighter text-white drop-shadow-md">{game.score}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Score</span>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all group-hover:translate-x-2 duration-300">
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;
