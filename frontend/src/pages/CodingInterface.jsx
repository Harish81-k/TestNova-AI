import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const DEFAULT_CODE = {
  python: 'def hello_world():\n    print("Hello from TestNova AI!")\n\nhello_world()',
  javascript: 'function helloWorld() {\n    console.log("Hello from TestNova AI!");\n}\n\nhelloWorld();',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from TestNova AI!");\n    }\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from TestNova AI!" << std::endl;\n    return 0;\n}'
};

const CodingInterface = () => {
  const [language, setLanguage] = useState('python');
  const [codeCache, setCodeCache] = useState(DEFAULT_CODE);
  const [code, setCode] = useState(DEFAULT_CODE['python']);
  const [isRunning, setIsRunning] = useState(false);

  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize Xterm.js
    const term = new Terminal({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
      cursorBlink: true,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) fitAddonRef.current.fit();
    };
    window.addEventListener('resize', handleResize);

    // Initialize Socket.io
    const backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'http://' + window.location.hostname + ':5000'; // Fallback if deployed elsewhere
      
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.on('output', (data) => {
      // Replace newline with \r\n for xterm to display correctly
      const formattedData = data.replace(/\r?\n/g, '\r\n');
      term.write(formattedData);
    });

    socket.on('execution_end', () => {
      setIsRunning(false);
      term.write('\r\n\x1b[33m--- Execution Finished ---\x1b[0m\r\n');
    });

    // Handle typing in terminal
    term.onData((data) => {
      // Replace \r with \n because processes like Python expect \n to submit the input
      socket.emit('input', data.replace(/\r/g, '\n'));
      
      // Local echo
      term.write(data === '\r' ? '\r\n' : data);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      socket.disconnect();
    };
  }, []);

  const handleRunCode = () => {
    if (isRunning) {
        socketRef.current.emit('kill');
        setIsRunning(false);
        return;
    }

    setIsRunning(true);
    termRef.current.clear();
    termRef.current.write('\x1b[32mRunning...\x1b[0m\r\n');
    
    let codeToSend = code;
    if (language === 'java') {
      codeToSend = codeToSend.replace(/public\s+class\s+/, 'class ');
    }
    
    socketRef.current.emit('execute', {
      code: codeToSend,
      language
    });
  };

  return (
    <div className="flex h-full w-full">
      {/* Left Pane: Editor */}
      <div className="w-1/2 flex flex-col border-r border-white/10">
        <div className="flex items-center justify-between p-3 bg-[#2A2B32] border-b border-white/10">
          <select 
            value={language} 
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              setCode(codeCache[newLang]);
              if (termRef.current) {
                termRef.current.clear();
              }
              if (isRunning) {
                socketRef.current.emit('kill');
                setIsRunning(false);
              }
            }}
            className="bg-[#40414F] text-white text-sm rounded px-3 py-1.5 border border-white/10 outline-none"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button 
            onClick={handleRunCode}
            className={`${isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-[#10a37f] hover:bg-[#0e906f]'} text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2`}
          >
            {isRunning ? (
              <>
                <svg className="h-4 w-4 text-white" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M144 144v224c0 17.7-14.3 32-32 32s-32-14.3-32-32V144c0-17.7 14.3-32 32-32s32 14.3 32 32zm224-32c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32s32-14.3 32-32V144c0-17.7-14.3-32-32-32z"></path></svg>
                Stop Execution
              </>
            ) : (
              <>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg>
                Run Code
              </>
            )}
          </button>
        </div>
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => {
              setCode(value);
              setCodeCache(prev => ({ ...prev, [language]: value }));
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              padding: { top: 16 }
            }}
          />
        </div>
      </div>

      {/* Right Pane: Terminal Output */}
      <div className="w-1/2 flex flex-col bg-[#1e1e1e] border-l border-white/10">
        <div className="p-3 bg-[#2A2B32] border-b border-white/10 text-sm font-medium text-gray-300">
          Terminal
        </div>
        <div className="flex-1 overflow-hidden p-2">
          {/* Xterm.js container */}
          <div ref={terminalRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default CodingInterface;
