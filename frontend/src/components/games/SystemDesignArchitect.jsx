import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SCENARIOS = [
  {
    id: 1,
    title: "Global News Site",
    description: "Design an architecture for a read-heavy news website with global traffic. The content is mostly static articles with some dynamic comments. Choose the most optimal 5 components in order of traffic flow from the user to the database.",
    slots: ["Client Request", "Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5"],
    correct: ["DNS", "CDN", "Load Balancer", "App Servers", "Read Replicas"],
    options: ["DNS", "CDN", "Load Balancer", "App Servers", "Redis PubSub", "Read Replicas", "Kafka", "Blob Storage"]
  },
  {
    id: 2,
    title: "Real-time Chat App",
    description: "Design a real-time chat application. You need persistent bi-directional connections, real-time message routing, and a database optimized for heavy writes.",
    slots: ["Client Request", "Slot 1", "Slot 2", "Slot 3", "Slot 4"],
    correct: ["Load Balancer", "WebSocket Servers", "Redis PubSub", "Cassandra"],
    options: ["Load Balancer", "WebSocket Servers", "Redis PubSub", "CDN", "PostgreSQL", "Cassandra", "App Servers"]
  },
  {
    id: 3,
    title: "Video Streaming",
    description: "Design a platform like Netflix. Users request video metadata, and then stream large media files efficiently globally.",
    slots: ["Client Request", "Slot 1", "Slot 2", "Slot 3", "Slot 4"],
    correct: ["API Gateway", "Microservices", "PostgreSQL", "CDN"],
    options: ["API Gateway", "Microservices", "PostgreSQL", "CDN", "WebSocket Servers", "Kafka", "Redis Cache"]
  }
];

const SystemDesignArchitect = ({ onBack }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selections, setSelections] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const startTimeRef = useRef(Date.now());

  const scenario = SCENARIOS[currentScenario];

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      axios.post('/gaming/result', {
        gameName: 'System Design Architect',
        score: score,
        maxScore: SCENARIOS.length * 500,
        level: 'hard',
        durationSeconds,
        details: { scenariosCompleted: currentScenario, reason: 'Time ran out' }
      }).catch(err => console.error('Failed to save game result', err));
    }
  }, [timeLeft, isGameOver]);

  useEffect(() => {
    // Reset selections on new scenario
    setSelections(Array(scenario.slots.length - 1).fill(null));
    setFeedback(null);
  }, [currentScenario, scenario]);

  const handleSelect = (index, component) => {
    const newSelections = [...selections];
    newSelections[index] = component;
    setSelections(newSelections);
  };

  const checkAnswer = () => {
    if (selections.includes(null)) {
      setFeedback({ type: 'error', text: 'INCOMPLETE ARCHITECTURE' });
      return;
    }

    let isCorrect = true;
    for (let i = 0; i < scenario.correct.length; i++) {
      if (selections[i] !== scenario.correct[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      setScore(s => s + 500);
      setFeedback({ type: 'success', text: 'ARCHITECTURE VERIFIED. INITIALIZING NEXT PHASE.' });
      
      setTimeout(() => {
        if (currentScenario < SCENARIOS.length - 1) {
          setCurrentScenario(curr => curr + 1);
        } else {
          setIsGameOver(true);
          const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          axios.post('/gaming/result', {
            gameName: 'System Design Architect',
            score: score + 500, // Include the score from this final round
            maxScore: SCENARIOS.length * 500,
            level: 'hard',
            durationSeconds,
            details: { scenariosCompleted: currentScenario + 1, reason: 'All scenarios completed' }
          }).catch(err => console.error('Failed to save game result', err));
        }
      }, 2000);
    } else {
      setScore(s => Math.max(0, s - 100));
      setFeedback({ type: 'error', text: 'SYSTEM FAILURE. INCORRECT FLOW OR COMPONENTS.' });
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
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8">Scenario {currentScenario + 1} / {SCENARIOS.length}</div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-none uppercase">
              {scenario.title}
            </h2>
            <p className="text-xl md:text-2xl font-light text-gray-400 leading-relaxed">
              {scenario.description}
            </p>
          </div>

          {/* Right: Architecture Flow & Options */}
          <div className="w-full md:w-1/2 flex flex-col justify-start h-full pt-8 md:pt-0 md:pl-8">
            
            <div className="flex flex-col gap-16">
              
              {/* Flow Slots */}
              <div>
                <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8">Architecture Flow</div>
                <div className="flex flex-col gap-6">
                  {scenario.slots.map((slotLabel, index) => {
                    if (index === 0) {
                      return (
                        <div key="client" className="flex items-center gap-6 group">
                          <span className="text-sm font-bold text-gray-700 opacity-50 w-8 text-right">00</span>
                          <span className="text-xl md:text-2xl font-mono font-light text-white uppercase tracking-wider">{slotLabel}</span>
                        </div>
                      );
                    }
                    const slotIndex = index - 1;
                    const selected = selections[slotIndex];
                    return (
                      <div key={index} className="flex items-center gap-6 group">
                        <span className="text-sm font-bold text-gray-700 opacity-50 w-8 text-right">{String(index).padStart(2, '0')}</span>
                        <div className="flex-1 flex items-center justify-between border-b border-white/20 pb-4 group-hover:border-white/50 transition-colors">
                          {selected ? (
                            <span className="text-xl md:text-2xl font-mono font-light text-white uppercase tracking-wider">{selected}</span>
                          ) : (
                            <span className="text-xl md:text-2xl font-mono font-light text-white/20 italic">{slotLabel}</span>
                          )}
                          {selected && (
                            <button 
                              onClick={() => handleSelect(slotIndex, null)} 
                              className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div>
                <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8">Available Components</div>
                <div className="flex flex-wrap gap-x-8 gap-y-6">
                  {scenario.options.map((opt) => {
                    const isSelected = selections.includes(opt);
                    return (
                      <button
                        key={opt}
                        disabled={isSelected}
                        onClick={() => {
                          const firstEmpty = selections.findIndex(s => s === null);
                          if (firstEmpty !== -1) {
                            handleSelect(firstEmpty, opt);
                          }
                        }}
                        className={`group flex items-center gap-4 text-sm md:text-base font-mono font-light tracking-wide uppercase transition-all outline-none ${
                          isSelected 
                            ? 'text-gray-800 cursor-not-allowed line-through' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {!isSelected && <span className="w-4 h-[1px] bg-gray-600 group-hover:bg-white transition-all"></span>}
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action / Feedback */}
              <div className="mt-8">
                {feedback && (
                  <div className={`text-xs font-bold tracking-[0.3em] uppercase mb-8 ${feedback.type === 'success' ? 'text-white' : 'text-gray-500'}`}>
                    {feedback.text}
                  </div>
                )}
                <button 
                  onClick={checkAnswer}
                  disabled={selections.includes(null)}
                  className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all disabled:opacity-30 disabled:hover:text-white"
                >
                  Deploy Architecture
                  <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Game Over State */}
      {isGameOver && (
        <div className="flex-1 flex flex-col justify-center items-end text-right animate-in fade-in duration-1000 max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 mr-2">Final Evaluation</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={() => { setCurrentScenario(0); setScore(0); setTimeLeft(300); setIsGameOver(false); startTimeRef.current = Date.now(); }} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
            Restart Simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemDesignArchitect;
