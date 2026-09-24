import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useParams, useNavigate } from 'react-router-dom';

const QuizInterface = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('quiz'); // 'quiz', 'results', 'error'
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60);

  useEffect(() => {
    // Load quiz from localStorage
    const savedQuizData = localStorage.getItem(`quiz_${quizId}`);
    if (savedQuizData) {
      try {
        const parsed = JSON.parse(savedQuizData);
        setQuiz(parsed.quiz);
        setTopic(parsed.topic);
      } catch (e) {
        console.error('Failed to parse quiz data', e);
        setStep('error');
      }
    } else {
      setStep('error');
    }
  }, [quizId]);

  useEffect(() => {
    if (step === 'quiz' && quiz.length > 0 && !isLoading) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, quiz.length, isLoading]);

  useEffect(() => {
    if (timeLeft === 0 && step === 'quiz' && !isLoading) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, step, isLoading]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionChange = (questionIndex, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('/reasoning/submit', {
        quiz,
        answers,
        topic
      });
      setResults(res.data);
      setStep('results');
      
      // Clean up localStorage to save space
      localStorage.removeItem(`quiz_${quizId}`);
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert('Failed to submit assignment.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeWindow = () => {
    window.close();
    // Fallback if window.close() is blocked
    navigate('/assignments');
  };

  if (step === 'error') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fbfbfb] text-[#121c2d]">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Session Expired or Invalid</h2>
          <p className="text-slate-500 mb-8">We couldn't find the requested quiz session.</p>
          <button onClick={closeWindow} className="px-6 py-3 bg-[#0b1528] text-white rounded font-bold">
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#fbfbfb] text-[#121c2d] z-10 overflow-y-auto font-sans">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fbfbfb]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full border-[3px] border-gray-200 border-b-[#0b1528] animate-spin mb-8"></div>
          <h2 className="text-3xl text-[#0b1528] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Evaluating Responses
          </h2>
          <p className="text-sm text-slate-500">
            Analyzing answers against correct parameters...
          </p>
        </div>
      )}

      {step === 'quiz' && quiz.length === 0 && !isLoading && (
        <div className="flex h-screen w-full items-center justify-center bg-[#fbfbfb] text-[#121c2d]">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Generation Failed</h2>
            <p className="text-slate-500 mb-8">We could not generate the questions. The AI service may be overloaded or produced an invalid response format.</p>
            <button onClick={closeWindow} className="px-6 py-3 bg-[#0b1528] text-white rounded font-bold hover:bg-[#15233c] transition-colors">
              Close Window
            </button>
          </div>
        </div>
      )}

      {step === 'quiz' && quiz.length > 0 && (
        <div className="flex flex-col h-screen bg-[#fcfcfc] overflow-hidden">
          {/* Top Bar */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white shadow-sm z-10 shrink-0">
            <div className="text-sm font-bold tracking-[0.2em] uppercase text-[#0b1528]">
              {topic} — EVALUATION SESSION
            </div>
            <div className="flex items-center gap-6 text-xs font-bold tracking-widest text-slate-500 uppercase">
              <span className={timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}>TIME LEFT // {formatTime(timeLeft)}</span>
              <span>PROTOCOL NODE // LIVE</span>
            </div>
          </div>

          {/* Main Layout Area */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Sidebar (INDEX SCHEME) */}
            <div className="w-64 border-r border-gray-200 bg-white p-8 overflow-y-auto shrink-0 hidden md:block">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6 block">INDEX SCHEME</span>
              <div className="grid grid-cols-2 gap-3">
                {quiz.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-12 flex items-center justify-center font-bold text-sm border transition-all ${
                      currentQuestionIndex === idx 
                        ? 'bg-[#0b1528] border-[#0b1528] text-white' 
                        : 'bg-white border-gray-200 text-[#0b1528] hover:border-gray-400'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Question Area */}
            <div className="flex-1 overflow-y-auto p-10 md:p-16 bg-[#fbfbfb]">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16">
                
                {/* Left Side (Question) */}
                <div className="flex-1">
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8 block">VERIFICATION BLOCK // {String(currentQuestionIndex + 1).padStart(2, '0')}</span>
                  
                  <div className="prose max-w-none mb-10 text-lg text-[#0b1528] font-medium leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />,
                        pre({node, children, ...props}) {
                          return <div className="bg-[#f4f1ea] p-6 rounded my-6 border border-[#e8e4db] overflow-x-auto text-sm font-mono text-slate-700"><pre {...props} style={{ margin: 0, padding: 0, background: 'transparent', border: 'none' }}>{children}</pre></div>;
                        },
                        code({node, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '');
                          const isBlock = match || (node?.parent?.tagName === 'pre');
                          return isBlock ? (
                            <code className={className} {...props}>{children}</code>
                          ) : (
                            <code className="bg-[#f4f1ea] px-1.5 py-0.5 rounded border border-[#e8e4db] font-mono text-slate-700" {...props}>{children}</code>
                          )
                        }
                      }}
                    >
                      {quiz[currentQuestionIndex].question}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Right Side (Options) */}
                <div className="flex-1 md:max-w-sm">
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8 block">SELECT DEFINITIVE VARIABLE</span>
                  
                  <div className="flex flex-col w-full">
                    {quiz[currentQuestionIndex].options.map((opt, oIndex) => (
                      <label 
                        key={oIndex} 
                        className="flex flex-row items-center gap-4 py-4 cursor-pointer border-b border-gray-200 hover:border-gray-400 transition-colors group w-full"
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          answers[currentQuestionIndex] === opt ? 'border-[#0b1528]' : 'border-gray-300 group-hover:border-[#0b1528]'
                        }`}>
                          {answers[currentQuestionIndex] === opt && <div className="w-2.5 h-2.5 bg-[#0b1528] rounded-full"></div>}
                        </div>
                        <input 
                          type="radio" 
                          name={`question-${currentQuestionIndex}`} 
                          value={opt}
                          checked={answers[currentQuestionIndex] === opt}
                          onChange={() => handleOptionChange(currentQuestionIndex, opt)}
                          className="hidden"
                        />
                        <span className="text-[#0b1528] text-sm md:text-base leading-tight mt-0.5">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex justify-between items-center border-t border-gray-200 bg-white shrink-0">
            <button onClick={closeWindow} className="px-8 md:px-12 py-6 text-red-600 hover:bg-red-50 font-bold tracking-widest text-xs uppercase transition-colors h-full border-r border-gray-200">
              TERMINATE SESSION
            </button>
            <div className="flex h-full">
              <button 
                onClick={() => {
                  if (currentQuestionIndex < quiz.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                  }
                }}
                className="px-8 md:px-12 py-6 text-[#0b1528] hover:bg-slate-50 font-bold tracking-widest text-xs uppercase transition-colors h-full border-l border-gray-200"
              >
                SKIP MATRIX
              </button>
              <button
                onClick={() => {
                  if (currentQuestionIndex < quiz.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={!answers[currentQuestionIndex]}
                className="px-8 md:px-16 py-6 bg-[#0b1528] text-white hover:bg-[#15233c] font-bold tracking-widest text-xs uppercase transition-colors disabled:opacity-50 h-full"
              >
                {currentQuestionIndex < quiz.length - 1 ? 'COMMIT & ADVANCE' : 'SUBMIT EVALUATION'}
              </button>
            </div>
          </div>

        </div>
      )}

      {step === 'results' && results && (
        <div className="max-w-4xl mx-auto p-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-xl text-center mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#0b1528]"></div>
            <span className="text-xs font-bold tracking-widest text-slate-500 uppercase block mb-4">Evaluation Complete</span>
            <h2 className="text-4xl text-[#0b1528] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>{topic}</h2>
            
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-7xl font-black text-[#0b1528] tracking-tighter">{results.percentage}%</div>
              <div className="text-left border-l-2 border-gray-200 pl-8">
                <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-1">Score</p>
                <p className="text-2xl text-[#0b1528] font-medium">{results.score} / {results.total}</p>
              </div>
            </div>

            <button onClick={closeWindow} className="mt-4 px-10 py-4 rounded-md bg-white border-2 border-[#0b1528] text-[#0b1528] hover:bg-slate-50 font-bold tracking-widest text-sm uppercase transition-colors">
              Close Window
            </button>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase mb-8 border-b border-gray-200 pb-4">Detailed Breakdown</h3>
            {results.results.map((res, idx) => (
              <div key={idx} className={`bg-white border-l-4 rounded-r-xl p-8 shadow-sm ${res.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <div className="prose max-w-none mb-6 font-medium text-lg text-[#0b1528]">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />,
                      pre({node, children, ...props}) {
                        return <div className="bg-[#f4f1ea] p-6 rounded my-6 border border-[#e8e4db] overflow-x-auto text-sm font-mono text-slate-700"><pre {...props} style={{ margin: 0, padding: 0, background: 'transparent', border: 'none' }}>{children}</pre></div>;
                      },
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isBlock = match || (node?.parent?.tagName === 'pre');
                        return isBlock ? (
                          <code className={className} {...props}>{children}</code>
                        ) : (
                          <code className="bg-[#f4f1ea] px-1.5 py-0.5 rounded border border-[#e8e4db] font-mono text-slate-700" {...props}>{children}</code>
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

export default QuizInterface;
