import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const CodingChallenge = ({ difficulty = 'advanced', onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(difficulty === 'basic' ? 1800 : difficulty === 'intermediate' ? 2700 : 3600); 
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [questionScores, setQuestionScores] = useState([]);
  
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userCode, setUserCode] = useState('');
  const [userCodes, setUserCodes] = useState({});
  
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null);

  const [hintQuery, setHintQuery] = useState('');
  const [hint, setHint] = useState(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  const startGame = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.post('/coding/generate/', {
        difficulty: difficulty,
        language: selectedLanguage
      });
      
      const generatedQuestions = res.data.questions;
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("Failed to generate questions. Please try again.");
      }

      setQuestions(generatedQuestions);
      setQuestionScores(new Array(generatedQuestions.length).fill(0));
      setScore(0);
      setTimeLeft(difficulty === 'basic' ? 1800 : difficulty === 'intermediate' ? 2700 : 3600);
      setCurrentIndex(0);
      setUserCode(generatedQuestions[0].stub);
      setUserCodes({});
      setConsoleOutput(null);
      setIsConsoleOpen(false);
      setHint(null);
      setIsPlaying(true);
      setIsGameOver(false);
    } catch (err) {
      alert("Failed to load challenges from AI. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setIsGameOver(true);
    }
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (isGameOver && questions.length > 0) {
      const saveResult = async () => {
        try {
          await axios.post('/coding/submit/', {
            scores: questionScores,
            questions: questions,
            difficulty: difficulty
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        } catch (e) {
          console.error("Failed to save coding result", e);
        }
      };
      saveResult();
    }
  }, [isGameOver]);

  const handleRun = async () => {
    const currentQ = questions[currentIndex];
    setIsRunning(true);
    setIsConsoleOpen(true);
    setConsoleOutput({ type: 'loading', message: 'Running sample test case...' });
    
    try {
      const fullCode = userCode + "\n" + currentQ.test_harness;
      const res = await axios.post('/coding/execute/', {
        code: fullCode,
        language: selectedLanguage,
        input: currentQ.sample_input
      });
      
      const result = res.data;

      if (result.status.id === 6) { // Compilation Error
        setConsoleOutput({ type: 'error', message: `Compilation Error:\n${result.compile_output}` });
      } else if (result.status.id === 4 || result.status.id === 500) { // Runtime Error
        let errorMsg = result.stderr || result.stdout;
        setConsoleOutput({ type: 'error', message: `Runtime Error:\n${errorMsg}` });
      } else {
        const got = result.stdout.trim();
        const expected = String(currentQ.sample_output).trim();
        if (got !== expected) {
          setConsoleOutput({ 
            type: 'error', 
            message: `Wrong Answer!\nInput: ${currentQ.sample_input}\nExpected: ${expected}\nGot: ${got}`
          });
        } else {
          setConsoleOutput({ type: 'success', message: `Success! Output matched expected.\nOutput: ${got}` });
        }
      }
    } catch (err) {
      setConsoleOutput({ type: 'error', message: "Failed to connect to execution engine." });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    const currentQ = questions[currentIndex];
    setIsSubmitting(true);
    setIsConsoleOpen(true);
    setConsoleOutput({ type: 'loading', message: 'Running hidden test cases...' });
    
    try {
      let allPassed = true;
      let failedTest = null;
      let compilerError = null;
      let runtimeError = null;

      const fullCode = userCode + "\n" + currentQ.test_harness;

      for (let test of currentQ.hidden_tests) {
        const res = await axios.post('/coding/execute/', {
          code: fullCode,
          language: selectedLanguage,
          input: test.input
        });
        
        const result = res.data;

        if (result.status.id === 6) {
          allPassed = false;
          compilerError = result.compile_output;
          break;
        }
        
        if (result.status.id === 4 || result.status.id === 500) {
          allPassed = false;
          runtimeError = result.stderr || result.stdout;
          break;
        }

        if (result.stdout.trim() !== String(test.output).trim()) {
          allPassed = false;
          failedTest = { input: test.input, expected: test.output, got: result.stdout.trim() };
          break;
        }
      }

      if (allPassed) {
        setConsoleOutput({ type: 'success', message: 'All hidden test cases passed! +50 pts' });
        setScore(s => s + 50);
        setQuestionScores(prev => {
          const newScores = [...prev];
          newScores[currentIndex] = 50;
          return newScores;
        });
        
        setTimeout(() => {
          if (currentIndex + 1 < questions.length) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setUserCode(userCodes[nextIdx] || questions[nextIdx].stub);
            setConsoleOutput(null);
            setIsConsoleOpen(false);
            setHint(null);
          } else {
            setIsPlaying(false);
            setIsGameOver(true);
          }
        }, 1500);

      } else {
        if (compilerError) {
          setConsoleOutput({ type: 'error', message: `Compilation Error:\n${compilerError}` });
        } else if (runtimeError) {
          let errorMsg = runtimeError;
          setConsoleOutput({ type: 'error', message: `Runtime Error:\n${errorMsg}` });
        } else if (failedTest) {
          setConsoleOutput({ 
            type: 'error', 
            message: `Test Failed on Hidden Case!\nInput: ${failedTest.input}\nExpected: ${failedTest.expected}\nGot: ${failedTest.got}`
          });
        }
        setScore(s => Math.max(0, s - 10));
      }

    } catch (err) {
      setConsoleOutput({ type: 'error', message: "Failed to connect to execution engine." });
      setScore(s => Math.max(0, s - 10));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHintRequest = async (e) => {
    e.preventDefault();
    if (!hintQuery.trim()) return;
    setIsHintLoading(true);
    try {
      const res = await axios.post('/coding/hint/', {
        title: questions[currentIndex].title,
        description: hintQuery
      });
      setHint(res.data.hint);
      setHintQuery('');
    } catch (err) {
      setHint("Failed to load hint from AI.");
    } finally {
      setIsHintLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isPlaying && !isGameOver) {
    return (
      <div className="relative flex flex-col h-full w-full bg-black text-white p-8 md:p-16 font-sans selection:bg-white/20 selection:text-white">
        <div className="z-20">
          <button onClick={onBack} disabled={isGenerating} className="group flex items-center gap-4 text-xs font-bold tracking-[0.3em] uppercase text-gray-500 hover:text-white transition-all w-fit disabled:opacity-50">
            <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
            Return
          </button>
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-start text-left max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 ml-2">Module 12</div>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-none mb-8 uppercase">Coding<br/>Sandbox</h1>
          <p className="text-gray-400 font-light max-w-lg text-base md:text-xl mb-12">
            Pick your language. AI will generate 5 {difficulty === 'basic' ? 'easy' : difficulty === 'intermediate' ? 'medium' : 'hard'} coding challenges for you. Write the code, run the tests, and score points.
          </p>
          
          <div className="mb-12 flex flex-col gap-4 text-left w-full max-w-md">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.5em]">Select Language</label>
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 text-white p-4 outline-none focus:border-white transition-colors font-mono appearance-none cursor-pointer"
              disabled={isGenerating}
            >
              <option value="python" className="bg-[#111]">Python 3</option>
              <option value="javascript" className="bg-[#111]">JavaScript (Node.js)</option>
              <option value="java" className="bg-[#111]">Java</option>
              <option value="cpp" className="bg-[#111]">C / C++</option>
            </select>
          </div>

          <button onClick={startGame} disabled={isGenerating} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit disabled:opacity-50">
            {isGenerating ? "Generating..." : "Initiate Sandbox"}
            {!isGenerating && <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white text-gray-900 font-sans absolute inset-0 z-50">
      {/* Top Navbar */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to go back? Your current progress will be lost.")) {
                onBack();
              }
            }} 
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-6 w-6"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <span className="font-bold text-[#0b1528] tracking-widest uppercase text-sm">Coding Sandbox</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-0.5">Time Left</div>
            <div className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-[#0b1528]'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-0.5">Score</div>
            <div className="text-lg font-bold text-blue-600">{score}</div>
          </div>
        </div>
      </div>

      {isPlaying && questions[currentIndex] && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
          
          {/* Sidebar (INDEX SCHEME) */}
          <div className="w-24 border-r border-gray-200 bg-white p-4 overflow-y-auto shrink-0 hidden md:block">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6 block text-center">INDEX</span>
            <div className="flex flex-col gap-3">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setUserCode(userCodes[idx] || questions[idx].stub);
                    setConsoleOutput(null);
                    setIsConsoleOpen(false);
                    setHint(null);
                  }}
                  className={`h-12 w-full flex items-center justify-center font-bold text-sm border transition-all ${
                    currentIndex === idx 
                      ? 'bg-[#0b1528] border-[#0b1528] text-white' 
                      : 'bg-white border-gray-200 text-[#0b1528] hover:border-gray-400'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Left Panel: Problem Description */}
          <div className="w-full md:w-[45%] h-full flex flex-col border-r border-gray-200 bg-[#fbfbfb]">
            <div className="flex-1 overflow-y-auto p-8">
              <h1 className="text-2xl text-[#0b1528] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                {questions[currentIndex].title}
              </h1>
              
              <div 
                className="prose prose-sm max-w-none mb-8 text-gray-700 leading-relaxed 
                           prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-pink-600 prose-code:font-mono prose-code:border-gray-200"
                dangerouslySetInnerHTML={{ __html: questions[currentIndex].description }}
              />
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Input Format</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{questions[currentIndex].input_format}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Output Format</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{questions[currentIndex].output_format}</p>
              </div>
              
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Constraints</h4>
                <div 
                  className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-600 font-mono"
                  dangerouslySetInnerHTML={{ __html: questions[currentIndex].constraints }}
                />
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Sample Example</h4>
                <div className="bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm mb-4">
                  <div className="px-4 py-2 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">Input</div>
                  <div className="p-4 text-gray-800 whitespace-pre-wrap">{questions[currentIndex].sample_input}</div>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm">
                  <div className="px-4 py-2 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">Output</div>
                  <div className="p-4 text-gray-800 whitespace-pre-wrap">{questions[currentIndex].sample_output}</div>
                </div>
              </div>
            </div>

            {/* AI Hint Section at Bottom Left */}
            <div className="border-t border-gray-200 bg-white p-4 shrink-0">
              {hint && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg relative">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 flex justify-between items-center">
                    <span>AI Assistant</span>
                    <button onClick={() => setHint(null)} className="text-gray-400 hover:text-gray-600">×</button>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{hint}</div>
                </div>
              )}
              <form onSubmit={handleHintRequest} className="relative">
                <input 
                  type="text" 
                  value={hintQuery}
                  onChange={(e) => setHintQuery(e.target.value)}
                  placeholder="Type your message here (AI Hint)..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg py-3 px-4 pr-12 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  disabled={isHintLoading}
                />
                <button type="submit" disabled={isHintLoading || !hintQuery.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 disabled:opacity-50 p-2">
                  {isHintLoading ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Code Editor & Console */}
          <div className="w-full md:w-[55%] flex flex-col min-h-0 bg-white">
            <div className="flex-1 min-h-0 pt-4">
              <Editor
                height="100%"
                language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'python' ? 'python' : 'javascript'}
                theme="light"
                value={userCode}
                onChange={(value) => {
                  setUserCode(value);
                  setUserCodes(prev => ({ ...prev, [currentIndex]: value }));
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineHeight: 24,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on"
                }}
              />
            </div>

            {/* Console Drawer */}
            <div className={`border-t border-gray-200 bg-gray-50 flex flex-col transition-all duration-300 ease-in-out ${isConsoleOpen ? 'h-[250px]' : 'h-0 border-t-0'}`}>
              {isConsoleOpen && (
                <div className="p-4 overflow-y-auto h-full font-mono text-sm">
                  {consoleOutput ? (
                    <div className={`p-4 rounded border ${
                      consoleOutput.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
                      consoleOutput.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-white text-gray-600 border-gray-200'
                    }`}>
                      <div className="font-bold mb-2 uppercase tracking-widest text-xs flex items-center gap-2">
                        {consoleOutput.type === 'loading' && <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {consoleOutput.type === 'success' && 'Accepted'}
                        {consoleOutput.type === 'error' && 'Execution Error'}
                        {consoleOutput.type === 'loading' && 'Running Code'}
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed">{consoleOutput.message}</div>
                    </div>
                  ) : (
                    <div className="text-gray-400 p-4">Console is empty. Run your code to see output.</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Action Bar (Bottom Right) */}
            <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
              <button 
                onClick={() => setIsConsoleOpen(!isConsoleOpen)} 
                className="text-gray-500 hover:text-gray-800 font-bold text-sm flex items-center gap-2 transition-colors px-3 py-2 rounded hover:bg-gray-100"
              >
                Console
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className={`h-4 w-4 transform transition-transform ${isConsoleOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting}
                  className="px-6 py-2.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  Run
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting}
                  className="px-6 py-2.5 rounded bg-[#0b1528] hover:bg-[#15233c] text-white font-bold text-sm transition-colors disabled:opacity-50 shadow"
                >
                  Submit
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to terminate the session early?")) {
                      setIsPlaying(false);
                      setIsGameOver(true);
                    }
                  }}
                  className="px-6 py-2.5 rounded bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow ml-4"
                >
                  Terminate Session
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {isGameOver && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white p-12 rounded-2xl shadow-xl text-center border border-gray-100 max-w-md w-full">
            <div className="text-6xl font-black text-blue-600 mb-6">{score}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Time's Up!
            </h2>
            <p className="text-gray-500 mb-8">You completed the coding session.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setIsGameOver(false); setIsPlaying(false); }} className="w-full py-3 rounded-lg bg-[#0b1528] hover:bg-[#15233c] text-white font-bold transition-colors">
                Play Again
              </button>
              <button onClick={onBack} className="w-full py-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold transition-colors">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingChallenge;
