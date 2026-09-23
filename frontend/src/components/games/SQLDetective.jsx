import React, { useState, useEffect } from 'react';

const SQL_QUESTIONS = [
  {
    schema: "users(id, name, age, city)",
    goal: "Get the names of all users older than 18.",
    answer: "SELECT name FROM users WHERE age > 18;",
    options: [
      "SELECT * FROM users WHERE age >= 18;",
      "SELECT name FROM users WHERE age > 18;",
      "SELECT name FROM users HAVING age > 18;",
      "GET name FROM users WHERE age > 18;"
    ]
  },
  {
    schema: "orders(id, user_id, amount, status)",
    goal: "Find the total amount of all 'completed' orders.",
    answer: "SELECT SUM(amount) FROM orders WHERE status = 'completed';",
    options: [
      "SELECT TOTAL(amount) FROM orders WHERE status = 'completed';",
      "SELECT SUM(amount) FROM orders WHERE status = 'completed';",
      "SELECT amount FROM orders WHERE status = 'completed' GROUP BY user_id;",
      "SUM(amount) FROM orders WHERE status = 'completed';"
    ]
  },
  {
    schema: "products(id, name, price, category_id)",
    goal: "Count how many products exist in each category.",
    answer: "SELECT category_id, COUNT(*) FROM products GROUP BY category_id;",
    options: [
      "SELECT category_id, COUNT(*) FROM products;",
      "SELECT COUNT(*) FROM products GROUP BY category_id;",
      "SELECT category_id, COUNT(*) FROM products GROUP BY category_id;",
      "SELECT category_id FROM products GROUP BY category_id COUNT(*);"
    ]
  },
  {
    schema: "employees(id, name, salary, manager_id)",
    goal: "Get the 3 highest paid employees.",
    answer: "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;",
    options: [
      "SELECT name, salary FROM employees ORDER BY salary ASC LIMIT 3;",
      "SELECT name, salary FROM employees LIMIT 3 ORDER BY salary DESC;",
      "SELECT name, salary FROM employees TOP 3 ORDER BY salary DESC;",
      "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;"
    ]
  },
  {
    schema: "users(id, name) \nposts(id, user_id, title)",
    goal: "Get user names and their post titles. (Include users without posts)",
    answer: "SELECT u.name, p.title FROM users u LEFT JOIN posts p ON u.id = p.user_id;",
    options: [
      "SELECT u.name, p.title FROM users u INNER JOIN posts p ON u.id = p.user_id;",
      "SELECT u.name, p.title FROM users u LEFT JOIN posts p ON u.id = p.user_id;",
      "SELECT u.name, p.title FROM users u RIGHT JOIN posts p ON u.id = p.user_id;",
      "SELECT users.name, posts.title FROM users JOIN posts;"
    ]
  }
];

const SQLDetective = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const startGame = () => {
    setQuestions([...SQL_QUESTIONS].sort(() => 0.5 - Math.random()));
    setScore(0);
    setTimeLeft(90);
    setCurrentIndex(0);
    setIsPlaying(true);
    setIsGameOver(false);
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

  const handleGuess = (val) => {
    const q = questions[currentIndex];
    if (val === q.answer) {
      setScore(s => s + 10);
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(c => c + 1);
    } else {
      setQuestions(prev => [...prev].sort(() => 0.5 - Math.random()));
      setCurrentIndex(0);
    }
  };

  const currentOptions = React.useMemo(() => {
    if (!questions[currentIndex]) return [];
    return [...questions[currentIndex].options].sort(() => 0.5 - Math.random());
  }, [currentIndex, questions]);

  if (!isPlaying && !isGameOver) {
    return (
      <div className="relative flex flex-col h-full w-full bg-black text-white p-8 md:p-16 font-sans selection:bg-white/20 selection:text-white">
        <div className="z-20">
          <button onClick={onBack} className="group flex items-center gap-4 text-xs font-bold tracking-[0.3em] uppercase text-gray-500 hover:text-white transition-all w-fit">
            <span className="w-8 h-[1px] bg-gray-500 group-hover:bg-white transition-all group-hover:w-12"></span>
            Return
          </button>
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-start text-left max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 ml-2">Module 09</div>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-none mb-8 uppercase">SQL<br/>Detective</h1>
          <p className="text-gray-400 font-light max-w-lg text-base md:text-xl mb-12">
            Test your database query skills. Select the perfect SQL query to execute the objective against the given schema.
          </p>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            Connect Database
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-black text-white overflow-hidden p-8 md:p-16 font-sans selection:bg-white/20 selection:text-white">
      
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
            <div className={`text-2xl md:text-3xl font-light ${timeLeft <= 10 ? 'text-white animate-pulse' : 'text-gray-300'}`}>{timeLeft}</div>
          </div>
          <div>
            <div className="text-[9px] tracking-[0.3em] text-gray-600 uppercase font-bold mb-1">Score</div>
            <div className="text-2xl md:text-3xl font-light text-white">{score}</div>
          </div>
        </div>
      )}

      {/* Game State - 50/50 Split */}
      {isPlaying && questions[currentIndex] && (
        <div className="flex-1 flex flex-col md:flex-row w-full h-full animate-in fade-in duration-700 pt-24 md:pt-32 pb-12 items-stretch justify-center max-w-[90rem] mx-auto gap-8 md:gap-16">
          
          {/* Left: The Scenario (Schema + Goal) */}
          <div className="w-full md:w-1/2 flex flex-col justify-start pt-0 border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-16">
            
            <div className="mb-12">
              <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-6">Database Schema</div>
              <pre className="text-base md:text-lg font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                {questions[currentIndex].schema}
              </pre>
            </div>

            <div>
              <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-6">Objective</div>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-relaxed tracking-tight">
                {questions[currentIndex].goal}
              </p>
            </div>

          </div>

          {/* Right: The Options (Answers) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center h-full pt-8 md:pt-0 md:pl-8">
            <div className="text-[10px] tracking-[1em] text-gray-600 uppercase font-bold mb-8 md:mb-12">Execute Query</div>
            <div className="flex flex-col gap-6 md:gap-10">
              {currentOptions.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleGuess(opt)}
                  className="group flex items-center gap-6 w-full outline-none text-left"
                >
                  <span className="text-sm md:text-base font-bold text-gray-700 opacity-50 group-hover:opacity-100 transition-opacity w-8 text-right shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-base md:text-lg lg:text-xl font-mono font-light text-white/40 group-hover:text-white transition-all duration-500 bg-left-bottom bg-gradient-to-r from-white to-white bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] pb-2">
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Game Over State */}
      {isGameOver && (
        <div className="flex-1 flex flex-col justify-center items-end text-right animate-in fade-in duration-1000 max-w-5xl mx-auto w-full">
          <div className="text-[10px] tracking-[1em] text-gray-500 uppercase font-bold mb-6 mr-2">Final Query Score</div>
          <div className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-12 text-white">{score}</div>
          
          <button onClick={startGame} className="group relative overflow-hidden inline-flex items-center gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white hover:text-gray-300 transition-all w-fit">
            <span className="w-16 h-[1px] bg-white group-hover:w-32 transition-all duration-700 ease-out"></span>
            Restart Simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default SQLDetective;
