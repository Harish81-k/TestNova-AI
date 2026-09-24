import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useNavigate } from 'react-router-dom';

const ChatInterface = ({ refreshGlobalHistory }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editInput, setEditInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
             setInput(prev => prev + event.results[i][0].transcript + ' ');
          }
        }
      };
      
      recognition.onerror = (e) => {
        console.error('Speech recognition error', e);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert('Voice typing is not supported in your browser. Please try Chrome or Edge.');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (id) {
      loadSession(id);
    } else {
      setMessages([]);
    }
  }, [id]);

  const loadSession = async (sessionId) => {
    try {
      const res = await axios.get(`/chat/sessions/${sessionId}`);
      setMessages(res.data.messages);
    } catch (error) {
      console.error('Failed to load session', error);
      navigate('/'); // if invalid session, go back
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newAttachments = [];
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB limit to avoid MongoDB 16MB document limit
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE && !file.type.startsWith('image/')) {
        alert(`File ${file.name} is too large. Please select a document under 4MB.`);
        continue;
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        
        const img = new Image();
        img.src = dataUrl;
        await new Promise(r => img.onload = r);
        
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1024;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const base64Str = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        newAttachments.push({
          data: base64Str,
          mimeType: 'image/jpeg',
          name: file.name
        });
      } else {
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        
        const base64Str = dataUrl.split(',')[1];
        newAttachments.push({
          data: base64Str,
          mimeType: file.type || 'text/plain',
          name: file.name
        });
      }
    }
    
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if ((!userMessage && attachments.length === 0) || isLoading) return;

    setInput('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    
    const newMessages = [...messages, { role: 'user', content: userMessage, attachments: currentAttachments }];
    setMessages(newMessages);

    // Check if user is logged in before proceeding
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessages([...newMessages, { role: 'model', content: "Please login to ask." }]);
      return;
    }

    setIsLoading(true);

    let activeSessionId = id;

    try {
      if (!activeSessionId) {
        // Create new session first
        const createRes = await axios.post('/chat/sessions', {
          title: userMessage.substring(0, 30) + '...',
          messages: newMessages
        });
        activeSessionId = createRes.data._id;
        
        // Tell Layout to fetch new history, then navigate to the new URL
        if (refreshGlobalHistory) refreshGlobalHistory();
        navigate(`/chat/${activeSessionId}`, { replace: true });
      }

      const res = await axios.post('/chat', {
        message: userMessage,
        history: messages,
        attachments: currentAttachments,
        isThinkingMode
      });

      const updatedMessages = [...newMessages, { role: 'model', content: res.data.response }];
      setMessages(updatedMessages);

      // Save to database
      await axios.put(`/chat/sessions/${activeSessionId}`, {
        messages: updatedMessages
      });

    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (index) => {
    if (!editInput.trim() || isLoading) return;

    const newText = editInput.trim();
    setEditingIndex(null);
    setEditInput('');
    setIsLoading(true);

    const historyUpTo = messages.slice(0, index);
    const existingAttachments = messages[index].attachments || [];
    const newMessages = [...historyUpTo, { role: 'user', content: newText, attachments: existingAttachments }];
    setMessages(newMessages);

    // Check auth
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessages([...newMessages, { role: 'model', content: "Please login to ask." }]);
      return;
    }

    let activeSessionId = id;

    try {
      if (!activeSessionId) {
        const createRes = await axios.post('/chat/sessions', {
          title: newText.substring(0, 30) + '...',
          messages: newMessages
        });
        activeSessionId = createRes.data._id;
        if (refreshGlobalHistory) refreshGlobalHistory();
        navigate(`/chat/${activeSessionId}`, { replace: true });
      }

      const res = await axios.post('/chat', {
        message: newText,
        history: historyUpTo,
        attachments: existingAttachments,
        isThinkingMode
      });

      const updatedMessages = [...newMessages, { role: 'model', content: res.data.response }];
      setMessages(updatedMessages);

      if (activeSessionId) {
        await axios.put(`/chat/sessions/${activeSessionId}`, {
          messages: updatedMessages
        });
      }
    } catch (error) {
      console.error('Chat Error:', error);
      if (error.response) console.error('Server responded with:', error.response.status, error.response.data);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (index, type) => {
    const newMessages = [...messages];
    newMessages[index].feedback = newMessages[index].feedback === type ? null : type;
    setMessages(newMessages);
    if (id) {
      try {
        await axios.put(`/chat/sessions/${id}`, { messages: newMessages });
      } catch (err) {
        console.error('Failed to save feedback', err);
      }
    }
  };

  const handleRegenerate = async (index) => {
    if (isLoading) return;
    const userMsgIndex = index - 1;
    if (userMsgIndex < 0 || messages[userMsgIndex].role !== 'user') return;
    
    const historyUpTo = messages.slice(0, userMsgIndex);
    const userMessage = messages[userMsgIndex].content;
    const existingAttachments = messages[userMsgIndex].attachments || [];
    
    const newMessages = [...historyUpTo, messages[userMsgIndex]];
    setMessages(newMessages);

    // Check auth
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessages([...newMessages, { role: 'model', content: "Please login to ask." }]);
      return;
    }

    setIsLoading(true);

    let activeSessionId = id;
    try {
      const res = await axios.post('/chat', {
        message: userMessage,
        history: historyUpTo,
        attachments: existingAttachments,
        isThinkingMode
      });

      const updatedMessages = [...newMessages, { role: 'model', content: res.data.response }];
      setMessages(updatedMessages);

      if (activeSessionId) {
        await axios.put(`/chat/sessions/${activeSessionId}`, { messages: updatedMessages });
      }
    } catch (error) {
      console.error('Regenerate Error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranch = async (index) => {
    const branchedMessages = messages.slice(0, index + 1);
    try {
      const title = branchedMessages.find(m => m.role === 'user')?.content.substring(0, 30) + '...' || 'Branched Chat';
      const createRes = await axios.post('/chat/sessions', {
        title,
        messages: branchedMessages
      });
      if (refreshGlobalHistory) refreshGlobalHistory();
      navigate(`/chat/${createRes.data._id}`);
    } catch (error) {
      console.error('Failed to branch chat', error);
      alert('Failed to branch chat');
    }
  };

  const handleShare = async (content) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TestNova AI Response',
          text: content
        });
      } catch (err) {
        console.log('Share dismissed or failed', err);
      }
    } else {
      navigator.clipboard.writeText(content);
      alert('Response copied to clipboard!');
    }
  };

  const handleReadAloud = (content, index) => {
    if ('speechSynthesis' in window) {
      if (speakingIndex === index) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
        return;
      }

      const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, '');
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      utterance.onend = () => {
        setSpeakingIndex(null);
      };
      utterance.onerror = () => {
        setSpeakingIndex(null);
      };

      window.speechSynthesis.speak(utterance);
      setSpeakingIndex(index);
    } else {
      alert('Read aloud is not supported in this browser.');
    }
  };

  const handleViewSources = () => {
    alert("Generated by TestNova AI (Gemini 2.5 Flash). No external web sources referenced.");
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex((prev) => (prev === index ? null : prev));
    }, 2000);
  };

  const renderInputArea = () => (
    <>
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto p-2 bg-[#202020] rounded-xl border border-white/5">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group flex-shrink-0">
              {att.mimeType.startsWith('image/') ? (
                <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-white/20" />
              ) : (
                <div className="w-16 h-16 bg-white/10 flex items-center justify-center rounded-lg border border-white/20 text-xs text-center p-1 overflow-hidden break-words">
                  {att.name}
                </div>
              )}
              <button 
                type="button" 
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                className="absolute -top-2 -right-2 bg-black rounded-full p-1 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative flex items-center w-full bg-[#202020] rounded-full shadow-lg pl-3 pr-2 py-2 border border-white/5 transition-all duration-300 hover:border-white/10 focus-within:border-white/20">
        
        {/* Plus Button */}
        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf,.txt,.js,.json,.csv,.md" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0 rounded-full hover:bg-white/5">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        
        {/* Textarea */}
        <div className="flex-1 flex items-center min-h-[40px] px-2">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = '24px';
              const scrollHeight = e.target.scrollHeight;
              e.target.style.height = Math.min(scrollHeight, 200) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
                e.target.style.height = '24px';
              }
            }}
            placeholder="Ask anything"
            className="w-full border-0 bg-transparent py-0 px-1 focus:ring-0 focus:outline-none text-white placeholder:text-gray-400 font-sans text-base outline-none flex items-center [&::-webkit-scrollbar]:hidden"
            style={{ height: '24px', overflowY: 'auto', resize: 'none', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            rows="1"
          />
        </div>
        
        {/* Right Side Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button 
            type="button" 
            onClick={() => setIsThinkingMode(!isThinkingMode)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 !rounded-full appearance-none transition-colors text-sm font-medium ${isThinkingMode ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            {/* Brain/Think Icon */}
            <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" className="h-4 w-4"><path d="M12 3a4.5 4.5 0 0 0-4.5 4.5v1.07a5 5 0 0 0-1.8 8.8A3.5 3.5 0 1 0 12 19a3.5 3.5 0 1 0 6.3-1.63 5 5 0 0 0-1.8-8.8V7.5A4.5 4.5 0 0 0 12 3z"></path><line x1="12" y1="3" x2="12" y2="19"></line><path d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path></svg>
            Think
          </button>
          <button 
            type="button" 
            onClick={toggleRecording}
            className={`p-2 !rounded-full appearance-none transition-all duration-300 ${isRecording ? 'text-red-500 bg-red-500/20 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {/* Microphone Icon */}
            <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" className="h-5 w-5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          </button>
          <button 
            type="submit" 
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className={`ml-1 w-10 h-10 flex items-center justify-center !rounded-full appearance-none transition-all duration-300 overflow-hidden ${(!input.trim() && attachments.length === 0) || isLoading ? 'bg-[#3b3b3b] text-gray-500 opacity-80' : 'bg-[#2b6ce6] text-white hover:bg-[#3476f0] shadow-md shadow-blue-900/20 scale-105'}`}
          >
            {/* Send Icon (Up Arrow) */}
            <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 translate-y-[1px]">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </form>
      <div className="text-center text-xs text-gray-500 mt-3">
        TestNova AI can make mistakes. Verify critical operations.
      </div>
    </>
  );

  return (
    <div className="flex w-full h-full overflow-hidden bg-black text-white font-sans selection:bg-white/20 relative">
      {/* Background massive watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] md:text-[20vw] font-black leading-none opacity-[0.02] pointer-events-none select-none tracking-tighter">
        TESTNOVA
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full z-10 w-full">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full px-4 mb-[10vh]">
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-8 tracking-tight">What can I help with?</h1>
            <div className="w-full max-w-3xl">
              {renderInputArea()}
            </div>
          </div>
        ) : (
          <>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto w-full flex flex-col items-center pb-32">
              <div className="w-full max-w-3xl p-4 md:p-8 flex flex-col gap-8">
            {messages.map((msg, index) => {
              const isUser = msg.role !== 'model';
              const isEditing = editingIndex === index;

              return (
                <div 
                  key={index} 
                  className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  <div className={`w-full ${isUser ? 'max-w-[70%]' : 'max-w-full'} flex gap-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar Removed per user request */}
                    
                    {/* Message Content */}
                    {isEditing ? (
                      <div className="w-full bg-[#202020] rounded-2xl border border-white/10 p-4 flex flex-col gap-3 shadow-xl">
                        <textarea
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-white font-sans text-sm md:text-base resize-none"
                          rows={Math.max(1, Math.min(10, editInput.split('\n').length))}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button 
                            onClick={() => { setEditingIndex(null); setEditInput(''); }}
                            className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleEditSubmit(index)}
                            disabled={!editInput.trim() || isLoading}
                            className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#2b6ce6] text-white hover:bg-[#3476f0] disabled:opacity-50 transition-colors"
                          >
                            Save & Submit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1 group relative w-full`}>
                        <div className={`${isUser ? 'px-4 py-2.5 rounded-3xl bg-[#22477c] text-white shadow-md inline-block max-w-full' : 'text-gray-300 py-2 w-full'}`}>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={`flex flex-wrap gap-2 ${msg.content ? 'mb-3' : ''}`}>
                               {msg.attachments.map((att, i) => (
                                 att.mimeType.startsWith('image/') ? (
                                   <img key={i} src={`data:${att.mimeType};base64,${att.data}`} alt="attachment" className="max-w-[200px] max-h-[200px] object-cover rounded-xl" />
                                 ) : (
                                   <div key={i} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-sm">
                                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                      <span className="truncate max-w-[150px]">{att.name}</span>
                                   </div>
                                 )
                               ))}
                            </div>
                          )}
                          <div className={`prose prose-invert max-w-none text-sm md:text-base break-words leading-relaxed tracking-wide ${isUser ? '[&>p]:m-0' : ''}`}>
                            {(() => {
                              const content = msg.content || '';
                              const thinkStartIndex = content.indexOf('<think>');
                              
                              const markdownComponents = {
                                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-white underline decoration-white/30 hover:decoration-white transition-colors" />,
                                code: ({node, inline, ...props}) => inline ? <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono" {...props} /> : <code className="bg-black/50 border border-white/10 block p-4 rounded-lg font-mono text-sm overflow-x-auto" {...props} />
                              };

                              if (thinkStartIndex !== -1) {
                                const thinkEndIndex = content.indexOf('</think>');
                                const hasEnd = thinkEndIndex !== -1;
                                
                                const thinkContent = hasEnd 
                                  ? content.slice(thinkStartIndex + 7, thinkEndIndex)
                                  : content.slice(thinkStartIndex + 7);
                                  
                                const mainContent = hasEnd 
                                  ? content.slice(0, thinkStartIndex) + content.slice(thinkEndIndex + 8)
                                  : content.slice(0, thinkStartIndex);

                                return (
                                  <>
                                    <details className="mb-4 bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-inner group" open={!hasEnd}>
                                      <summary className="px-4 py-2.5 text-xs text-gray-400 cursor-pointer hover:bg-white/5 select-none font-medium flex items-center gap-2 outline-none transition-colors">
                                        <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" className="w-4 h-4 text-blue-400 group-open:text-gray-400 transition-colors"><path d="M12 3a4.5 4.5 0 0 0-4.5 4.5v1.07a5 5 0 0 0-1.8 8.8A3.5 3.5 0 1 0 12 19a3.5 3.5 0 1 0 6.3-1.63 5 5 0 0 0-1.8-8.8V7.5A4.5 4.5 0 0 0 12 3z"></path></svg>
                                        {hasEnd ? 'Thought Process' : 'Thinking...'}
                                      </summary>
                                      <div className="p-4 border-t border-white/5 text-gray-400 text-sm leading-relaxed bg-black/40">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                          {thinkContent}
                                        </ReactMarkdown>
                                      </div>
                                    </details>
                                    {mainContent.trim() && (
                                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                        {mainContent}
                                      </ReactMarkdown>
                                    )}
                                  </>
                                );
                              }
                              
                              return (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                  {content}
                                </ReactMarkdown>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {!isUser && !isLoading && (
                          <div className="flex items-center gap-1 text-gray-400 mt-2 px-1 relative w-full">
                            <button onClick={() => handleCopy(msg.content, index)} className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors" title="Copy">
                              {copiedIndex === index ? (
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4 text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              ) : (
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              )}
                            </button>
                            <button onClick={() => handleFeedback(index, 'up')} className={`p-1.5 rounded-lg transition-colors ${msg.feedback === 'up' ? 'text-green-400 bg-white/10' : 'hover:text-white hover:bg-white/10'}`} title="Good response">
                              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            </button>
                            <button onClick={() => handleFeedback(index, 'down')} className={`p-1.5 rounded-lg transition-colors ${msg.feedback === 'down' ? 'text-red-400 bg-white/10' : 'hover:text-white hover:bg-white/10'}`} title="Bad response">
                              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4" style={{ transform: 'rotate(180deg)' }}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            </button>
                            <button onClick={() => handleShare(msg.content)} className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors" title="Share">
                              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            </button>
                            <button onClick={() => handleRegenerate(index)} className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors" title="Regenerate">
                              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                            </button>
                            <div className="relative">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === index ? null : index); }} 
                                className={`p-1.5 rounded-lg transition-colors ${activeDropdown === index ? 'text-white bg-white/10' : 'hover:text-white hover:bg-white/10'}`} 
                                title="More"
                              >
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></svg>
                              </button>
                              
                              {activeDropdown === index && (
                                <div className="absolute left-0 bottom-[120%] mb-1 w-48 bg-[#2f2f2f] border border-white/10 rounded-xl shadow-2xl py-2 z-50 text-sm text-gray-200" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => { handleViewSources(); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
                                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                    View sources
                                  </button>
                                  <button onClick={() => { handleBranch(index); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
                                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M16 3h5v5"></path><path d="M21 3l-7 7"></path><path d="M9 3v4"></path><path d="M9 13v8"></path><path d="M9 13H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"></path></svg>
                                    Branch in new chat
                                  </button>
                                  <button onClick={() => { handleReadAloud(msg.content, index); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
                                    {speakingIndex === index ? (
                                      <>
                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                                        Stop reading
                                      </>
                                    ) : (
                                      <>
                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                                        Read aloud
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {isUser && !isLoading && (
                          <div className="flex items-center gap-1 text-gray-500 mr-2 mt-0.5">
                            <button 
                              onClick={() => handleCopy(msg.content, index)}
                              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                              title="Copy message"
                            >
                              {copiedIndex === index ? (
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4 text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              ) : (
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              )}
                            </button>
                            <button 
                              onClick={() => { setEditingIndex(index); setEditInput(msg.content); }}
                              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                              title="Edit message"
                            >
                              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="w-full flex justify-start animate-in fade-in duration-500">
                <div className="flex gap-6 w-full">
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 bg-black mt-1">
                    <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white/50 animate-spin-slow" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                  </div>
                  <div className="text-gray-500 py-2 flex items-center">
                    <span className="text-xs tracking-[0.3em] uppercase font-bold animate-pulse">Processing...</span>
                  </div>
                </div>
              </div>
            )}
              <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
            </div>
          </div>

          {/* Bottom Input Area for active chat */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-6 pointer-events-none">
            <div className="max-w-3xl mx-auto px-4 pointer-events-auto">
              {renderInputArea()}
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
