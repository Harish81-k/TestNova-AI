import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const GameResultDetails = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResultDetails();
  }, [id]);

  const fetchResultDetails = async () => {
    try {
      const res = await axios.get(`/gaming/history/${id}`);
      setResult(res.data);
    } catch (error) {
      console.error('Error fetching game details', error);
      navigate('/gaming/history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="w-full h-full bg-black text-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => navigate('/gaming/history')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 text-sm uppercase tracking-wider font-bold"
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to History
        </button>

        <div className="flex items-center gap-4 mb-4">
          <span className={`w-3 h-3 rounded-full ${result.score > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm font-bold tracking-widest text-gray-400 uppercase">
            {new Date(result.createdAt).toLocaleString()}
          </span>
        </div>

        <h1 className="text-5xl font-black tracking-tight mb-12">{result.gameName}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Main Score Card */}
          <div className="bg-[#111] p-8 border border-white/10 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-white group-hover:scale-110 transition-transform duration-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-24 h-24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Final Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-light text-white">{result.score}</span>
              {result.maxScore && <span className="text-xl text-gray-500">/ {result.maxScore}</span>}
            </div>
          </div>

          {/* Level/Difficulty Card */}
          {result.level && (
            <div className="bg-[#111] p-8 border border-white/10 rounded-xl">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Difficulty</p>
              <span className="text-4xl font-light text-white capitalize">{result.level}</span>
            </div>
          )}

          {/* Duration Card */}
          {result.durationSeconds !== null && (
            <div className="bg-[#111] p-8 border border-white/10 rounded-xl">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Time Taken</p>
              <span className="text-4xl font-light text-white">{result.durationSeconds}s</span>
            </div>
          )}
        </div>

        {/* Detailed Stats */}
        {result.details && Object.keys(result.details).length > 0 && (
          <div className="bg-[#111] p-8 border border-white/10 rounded-xl">
            <h2 className="text-lg font-bold tracking-widest text-white uppercase mb-6">Detailed Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {Object.entries(result.details).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-white font-medium">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GameResultDetails;
