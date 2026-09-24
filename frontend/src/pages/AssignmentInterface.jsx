import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useParams, useNavigate } from 'react-router-dom';

const AssignmentInterface = ({ refreshGlobalHistory }) => {
  const [step, setStep] = useState('setup'); // 'setup', 'results' (for past history view)
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Midtier');
  const [isLoading, setIsLoading] = useState(false);
  
  const [results, setResults] = useState(null); // Used only for viewing past history here

  const { id } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (id) {
      loadHistoryById(id);
    } else {
      reset();
    }
  }, [id]);

  const loadHistoryById = async (historyId) => {
    setIsLoading(true);
    try {
      const res = await axios.get('/reasoning/history');
      const item = res.data.find(h => h._id === historyId);
      if (item) {
        setTopic(item.topic);
        setResults({
          percentage: item.percentage || 0,
          score: item.score || 0,
          total: item.total_questions || 0,
          results: item.results || []
        });
        setStep('results');
      } else {
        navigate('/assignments');
      }
    } catch (error) {
      console.error('Failed to load history item:', error);
      navigate('/assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const difficulties = ['Novice', 'Basic', 'Midtier', 'Expert', 'Mastery'];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      alert('Please enter a target topic.');
      return;
    }
    
    // Open a blank window immediately inside the click handler to bypass popup blockers
    const quizWindow = window.open('', '_blank');
    if (quizWindow) {
      // Show a loading message with a CSS spinner in the new tab
      quizWindow.document.write(`
        <html style="background-color: #fbfbfb; font-family: sans-serif; height: 100%; margin: 0;">
          <head>
            <title>Synthesizing Board...</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
            <style>
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              .spinner {
                width: 64px; height: 64px;
                border: 3px solid #e5e7eb;
                border-bottom-color: #0b1528;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 32px auto;
              }
            </style>
          </head>
          <body style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; margin: 0; text-align: center; color: #121c2d;">
            <div class="spinner"></div>
            <h2 style="font-size: 30px; font-weight: bold; margin-bottom: 12px; font-family: 'Playfair Display', serif;">Synthesizing Board</h2>
            <p style="color: #64748b; font-size: 14px;">This process involves deep LLM reasoning and may take up to 30 seconds. Please wait...</p>
          </body>
        </html>
      `);
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/reasoning/generate', {
        topic: topic.trim(),
        difficulty
      });
      
      if (!res.data.quiz || res.data.quiz.length === 0) {
        alert('Failed to generate assignment. The AI service may be overloaded or produced invalid format. Please try again.');
        if (quizWindow) quizWindow.close();
        setIsLoading(false);
        return;
      }

      const quizId = Date.now().toString();
      const quizData = {
        quiz: res.data.quiz,
        topic: topic.trim()
      };
      
      localStorage.setItem(`quiz_${quizId}`, JSON.stringify(quizData));
      
      if (quizWindow) {
        quizWindow.location.href = `/quiz/${quizId}`;
      } else {
        window.open(`/quiz/${quizId}`, '_blank');
      }
      
      setTopic('');
      setDifficulty('Midtier');
      
    } catch (error) {
      console.error('Failed to generate assignment:', error);
      alert('Failed to generate assignment. Please try again.');
      if (quizWindow) quizWindow.close();
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep('setup');
    setResults(null);
    setTopic('');
    if (id) navigate('/assignments'); // Clear URL
  };

  return (
    <div className="absolute inset-0 bg-[#fbfbfb] text-[#121c2d] z-10 overflow-y-auto font-sans">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fbfbfb]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full border-[3px] border-gray-200 border-b-[#0b1528] animate-spin mb-8"></div>
          <h2 className="text-3xl text-[#0b1528] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            {step === 'setup' ? 'Synthesizing Board' : 'Evaluating Responses'}
          </h2>
          <p className="text-sm text-slate-500">
            {step === 'setup' ? 'This process involves deep LLM reasoning and may take up to 30 seconds. Please wait...' : 'Analyzing answers against correct parameters...'}
          </p>
        </div>
      )}

      {step === 'setup' && (
        <div className="min-h-full flex flex-col md:flex-row items-stretch">
          
          {/* Left Column */}
          <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 bg-[#fbfbfb]">
            <div className="max-w-md">
              <span className="text-xs font-bold tracking-[0.2em] text-slate-600 uppercase mb-8 block">Core Engine V3</span>
              <h1 className="text-5xl md:text-6xl text-[#0b1528] leading-[1.1] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Generate intelligent <br/>
                <span className="italic text-slate-700">knowledge boards.</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mt-6">
                Our engine cross-references academic paradigms to compile highly accurate evaluations tailored to your exact specifications.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-white">
            <form onSubmit={handleGenerate} className="max-w-md w-full">
              
              <div className="mb-12">
                <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">Target Topic</label>
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. System Design, Quantum Physics"
                  required
                  className="w-full bg-transparent border-0 border-b border-gray-300 pb-3 text-lg text-[#0b1528] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-[#0b1528] transition-colors"
                />
              </div>

              <div className="mb-12">
                <label className="block text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">Depth Strategy</label>
                <div className="flex flex-wrap gap-3">
                  {difficulties.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`px-5 py-2.5 rounded text-sm font-medium transition-all ${
                        difficulty === d 
                          ? 'bg-[#0b1528] text-white shadow-md' 
                          : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="w-full py-4 rounded-md bg-[#0b1528] hover:bg-[#15233c] text-white font-bold tracking-widest text-sm uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-10 shadow-lg shadow-[#0b1528]/20"
              >
                Initialize Board <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>

            </form>
          </div>
        </div>
      )}

      {step === 'results' && results && (
        <div className="max-w-4xl mx-auto p-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-xl text-center mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#0b1528]"></div>
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase block mb-4">Past Evaluation</span>
            <h2 className="text-4xl text-[#0b1528] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>{topic}</h2>
            
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-7xl font-black text-[#0b1528] tracking-tighter">{results.percentage}%</div>
              <div className="text-left border-l-2 border-gray-200 pl-8">
                <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-1">Score</p>
                <p className="text-2xl text-[#0b1528] font-medium">{results.score} / {results.total}</p>
              </div>
            </div>

            <button onClick={reset} className="mt-4 px-10 py-4 rounded-md bg-white border-2 border-[#0b1528] text-[#0b1528] hover:bg-slate-50 font-bold tracking-widest text-sm uppercase transition-colors">
              New Knowledge Board
            </button>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase mb-8 border-b border-gray-200 pb-4">Detailed Breakdown</h3>
            {(results.results || []).map((res, idx) => (
              <div key={idx} className={`bg-white border-l-4 rounded-r-xl p-8 shadow-sm ${res.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="prose max-w-none mb-6 font-medium text-lg text-[#0b1528]">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />,
                      pre({node, children, ...props}) {
                        return <div className="bg-[#f4f1ea] p-6 rounded my-6 border border-[#e8e4db] overflow-x-auto text-sm font-mono text-slate-700 whitespace-pre" {...props}>{children}</div>;
                      },
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isBlock = match || (node?.parent?.tagName === 'pre');
                        return isBlock ? (
                          <span className={className} {...props}>{children}</span>
                        ) : (
                          <span className="bg-[#f4f1ea] px-1.5 py-0.5 rounded border border-[#e8e4db] font-mono text-slate-700" {...props}>{children}</span>
                        )
                      }
                    }}
                  >
                    {`${idx + 1}. ${res.question}`}
                  </ReactMarkdown>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6 bg-slate-50 p-6 rounded-lg">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase block mb-2">Your Answer</span>
                    <p className={`font-medium ${res.is_correct ? 'text-green-700' : 'text-red-700'}`}>{res.user_answer}</p>
                  </div>
                  {!res.is_correct && (
                    <div>
                      <span className="text-xs font-bold tracking-wider text-slate-500 uppercase block mb-2">Correct Answer</span>
                      <p className="font-medium text-green-700">{res.correct_answer}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-500 uppercase block mb-2">Explanation</span>
                  <p className="text-slate-600 leading-relaxed">{res.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AssignmentInterface;
