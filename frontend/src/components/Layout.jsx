import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Login from '../pages/Login';

const Layout = ({ children, setToken, token }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, bottom: 0, useBottom: false });
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: 'User' };
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const navigate = useNavigate();
  const location = useLocation();

  const isChatRoute = location.pathname === '/' || location.pathname.startsWith('/chat');
  const isAssignmentRoute = location.pathname.startsWith('/assignments');

  const fetchGlobalHistory = async () => {
    try {
      const [chatRes, assignRes] = await Promise.all([
        axios.get('/chat/sessions').catch(() => ({ data: [] })),
        axios.get('/reasoning/history').catch(() => ({ data: [] }))
      ]);
      setChatHistory(chatRes.data || []);
      setAssignmentHistory(assignRes.data || []);
    } catch (error) {
      console.error('Failed to fetch histories:', error);
    }
  };

  useEffect(() => {
    fetchGlobalHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setToken(null);
    }
  };

  const handleDeleteSession = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await axios.delete(`/chat/sessions/${id}`);
        fetchGlobalHistory();
        if (location.pathname === `/chat/${id}`) {
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to delete session', error);
      }
    }
  };

  const handleShareSession = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/chat/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleRenameSession = async (e, id) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await axios.put(`/chat/sessions/${id}`, { title: editTitle.trim() });
      setEditingId(null);
      fetchGlobalHistory();
    } catch (err) {
      console.error('Failed to rename', err);
    }
  };

  const handleTogglePin = async (e, id, currentStatus) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.put(`/chat/sessions/${id}`, { isPinned: !currentStatus });
      fetchGlobalHistory();
      setActiveMenuId(null);
    } catch (err) {
      console.error('Failed to pin', err);
    }
  };

  const handleArchiveSession = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.put(`/chat/sessions/${id}`, { isArchived: true });
      fetchGlobalHistory();
      setActiveMenuId(null);
      if (location.pathname === `/chat/${id}`) {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to archive', err);
    }
  };

  const handleRenameAssignment = async (e, id) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await axios.put(`/reasoning/history/${id}`, { topic: editTitle.trim() });
      setEditingId(null);
      fetchGlobalHistory();
    } catch (err) {
      console.error('Failed to rename assignment', err);
    }
  };

  const handleToggleAssignmentPin = async (e, id, currentStatus) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.put(`/reasoning/history/${id}`, { isPinned: !currentStatus });
      fetchGlobalHistory();
      setActiveMenuId(null);
    } catch (err) {
      console.error('Failed to pin assignment', err);
    }
  };

  const handleArchiveAssignment = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.put(`/reasoning/history/${id}`, { isArchived: true });
      fetchGlobalHistory();
      setActiveMenuId(null);
      if (location.pathname === `/assignments/${id}`) {
        navigate('/assignments');
      }
    } catch (err) {
      console.error('Failed to archive assignment', err);
    }
  };

  const handleMenuOpen = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 220; // Approximate menu height

      if (spaceBelow < menuHeight) {
        // Open upwards
        setMenuPos({ 
          bottom: window.innerHeight - rect.top + 4, 
          left: rect.left,
          useBottom: true 
        });
      } else {
        // Open downwards
        setMenuPos({ 
          top: rect.bottom + 4, 
          left: rect.left,
          useBottom: false 
        });
      }
      setActiveMenuId(id);
    }
  };

  const handleDeleteAssignment = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await axios.delete(`/reasoning/history/${id}`);
        fetchGlobalHistory();
        if (location.pathname === `/assignments/${id}`) {
          navigate('/assignments');
        }
      } catch (error) {
        console.error('Failed to delete assignment', error);
      }
    }
  };

  const handleShareAssignment = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/assignments/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  };

  const unarchivedChats = chatHistory.filter(session => !session.isArchived);
  
  const filteredChatHistory = unarchivedChats.filter(session => 
    session?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const pinnedChats = filteredChatHistory.filter(session => session.isPinned);
  const recentChats = filteredChatHistory.filter(session => !session.isPinned);
  
  const unarchivedAssignments = assignmentHistory.filter(assign => !assign.isArchived);
  
  const filteredAssignmentHistory = unarchivedAssignments.filter(assign => 
    assign?.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const pinnedAssignments = filteredAssignmentHistory.filter(assign => assign.isPinned);
  const recentAssignments = filteredAssignmentHistory.filter(assign => !assign.isPinned);

  const renderAssignmentItem = (assign) => (
    <div key={assign._id} className="relative group">
      <NavLink
        to={`/assignments/${assign._id}`}
        className={({ isActive }) => `w-full text-left p-2.5 rounded-lg text-[14px] transition-colors flex justify-between items-center !no-underline ${isActive ? 'bg-[#2a2b32] !text-white' : '!text-gray-200 hover:bg-[#202123] hover:!text-white'}`}
      >
        {editingId === assign._id ? (
          <form onSubmit={(e) => handleRenameAssignment(e, assign._id)} className="flex-1 mr-2" onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={(e) => handleRenameAssignment(e, assign._id)}
              className="w-full bg-[#343541] text-white outline-none border border-[#565869] rounded px-2 py-0.5 text-sm"
              autoFocus
            />
          </form>
        ) : (
          <span className="truncate flex-1 pr-2 !text-inherit">{assign.topic}</span>
        )}
        
        {!editingId && (
          <div className="hidden group-hover:flex items-center gap-1 shrink-0 text-gray-400 relative">
            <button 
              className="p-1.5 hover:text-white transition-colors"
              onClick={(e) => handleToggleAssignmentPin(e, assign._id, assign.isPinned)}
              title={assign.isPinned ? "Unpin assignment" : "Pin assignment"}
            >
              <svg stroke="currentColor" fill={assign.isPinned ? "currentColor" : "none"} strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1v3.76z"></path></svg>
            </button>
            
            <button 
              className={`p-1.5 hover:text-white transition-colors ${activeMenuId === assign._id ? 'text-white' : ''}`}
              onClick={(e) => handleMenuOpen(e, assign._id)}
            >
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></svg>
            </button>
          </div>
        )}
      </NavLink>

      {activeMenuId === assign._id && (
        <div 
          style={{ 
            ...(menuPos.useBottom ? { bottom: `${menuPos.bottom}px` } : { top: `${menuPos.top}px` }), 
            left: `${menuPos.left}px` 
          }}
          className="fixed w-44 bg-[#2f2f2f] border border-white/10 rounded-xl shadow-2xl py-2 z-[9999] text-sm text-gray-200" 
          onClick={(e) => { e.stopPropagation(); }}
        >
          <button onClick={(e) => { handleShareAssignment(e, assign._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors rounded-t-xl">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            Share
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingId(assign._id); setEditTitle(assign.topic); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Rename
          </button>
          <div className="h-[1px] bg-white/10 my-1 mx-2"></div>
          <button onClick={(e) => handleToggleAssignmentPin(e, assign._id, assign.isPinned)} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1v3.76z"></path></svg>
            {assign.isPinned ? "Unpin chat" : "Pin chat"}
          </button>
          <button onClick={(e) => handleArchiveAssignment(e, assign._id)} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
            Archive
          </button>
          <button onClick={(e) => { handleDeleteAssignment(e, assign._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors text-red-400 rounded-b-xl">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );

  const renderChatItem = (session) => (
    <div key={session._id} className="relative group">
      <NavLink
        to={`/chat/${session._id}`}
        className={({ isActive }) => `w-full text-left p-2.5 rounded-lg text-[14px] transition-colors flex justify-between items-center !no-underline ${isActive ? 'bg-[#2a2b32] !text-white' : '!text-gray-200 hover:bg-[#202123] hover:!text-white'}`}
      >
        {editingId === session._id ? (
          <form onSubmit={(e) => handleRenameSession(e, session._id)} className="flex-1 mr-2" onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={(e) => handleRenameSession(e, session._id)}
              className="w-full bg-[#343541] text-white outline-none border border-[#565869] rounded px-2 py-0.5 text-sm"
              autoFocus
            />
          </form>
        ) : (
          <span className="truncate flex-1 pr-2 !text-inherit">{session.title}</span>
        )}
        
        {!editingId && (
          <div className="hidden group-hover:flex items-center gap-1 shrink-0 text-gray-400 relative">
            <button 
              className="p-1.5 hover:text-white transition-colors"
              onClick={(e) => handleTogglePin(e, session._id, session.isPinned)}
              title={session.isPinned ? "Unpin chat" : "Pin chat"}
            >
              {/* Pin Icon */}
              <svg stroke="currentColor" fill={session.isPinned ? "currentColor" : "none"} strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1v3.76z"></path></svg>
            </button>
            
            <button 
              className={`p-1.5 hover:text-white transition-colors ${activeMenuId === session._id ? 'text-white' : ''}`}
              onClick={(e) => handleMenuOpen(e, session._id)}
            >
              {/* Three Dots Icon */}
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path></svg>
            </button>
          </div>
        )}
      </NavLink>

      {/* DROPDOWN PLACED WITH FIXED POSITIONING */}
      {activeMenuId === session._id && (
        <div 
          style={{ 
            ...(menuPos.useBottom ? { bottom: `${menuPos.bottom}px` } : { top: `${menuPos.top}px` }), 
            left: `${menuPos.left}px` 
          }}
          className="fixed w-44 bg-[#2f2f2f] border border-white/10 rounded-xl shadow-2xl py-2 z-[9999] text-sm text-gray-200" 
          onClick={(e) => { e.stopPropagation(); }}
        >
          <button onClick={(e) => { handleShareSession(e, session._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors rounded-t-xl">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            Share
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingId(session._id); setEditTitle(session.title); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Rename
          </button>
          <div className="h-[1px] bg-white/10 my-1 mx-2"></div>
          <button onClick={(e) => handleTogglePin(e, session._id, session.isPinned)} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1v3.76z"></path></svg>
            {session.isPinned ? "Unpin chat" : "Pin chat"}
          </button>
          <button onClick={(e) => handleArchiveSession(e, session._id)} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
            Archive
          </button>
          <button onClick={(e) => { handleDeleteSession(e, session._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors text-red-400 rounded-b-xl">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#343541] text-[#ececf1] font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed md:relative z-50 w-[260px] h-full bg-black flex flex-col p-3 font-sans transition-all duration-300 shrink-0 shadow-2xl md:shadow-none">
          
          {/* Top Header / Logo */}
          <div className="flex items-center justify-between px-2 py-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full border-[1.5px] border-white/80 shrink-0">
                <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px] text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <span className="font-bold text-[15px] tracking-wide text-white truncate">TestNova AI</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 shrink-0">
              {/* Search Icon */}
              <svg onClick={toggleSearch} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 cursor-pointer transition-colors ${isSearchOpen ? 'text-white' : 'hover:text-white'}`}>
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              {/* Sidebar Toggle Icon */}
              <svg onClick={toggleSidebar} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 hover:text-white cursor-pointer transition-colors">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M9 3v18"></path>
              </svg>
            </div>
          </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-1">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-[14px] !no-underline ${isActive ? 'bg-[#202123] !text-[#f9d863] font-medium' : 'hover:bg-[#202123] !text-white'}`}
            end
          >
            <svg stroke="white" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <span className="!text-inherit">New chat</span>
          </NavLink>

          <NavLink 
            to="/assignments" 
            className={({ isActive }) => `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-[14px] !no-underline ${isActive ? 'bg-[#202123] !text-white font-medium' : 'hover:bg-[#202123] !text-white'}`}
            end
          >
            <svg stroke="white" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className="!text-inherit">Assignments</span>
          </NavLink>

          <NavLink 
            to="/code" 
            className={({ isActive }) => `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-[14px] !no-underline ${isActive ? 'bg-[#202123] !text-white font-medium' : 'hover:bg-[#202123] !text-white'}`}
          >
            <svg stroke="white" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span className="!text-inherit">Code Playground</span>
          </NavLink>

          <NavLink 
            to="/gaming" 
            className={({ isActive }) => `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-[14px] !no-underline ${isActive ? 'bg-[#202123] !text-white font-medium' : 'hover:bg-[#202123] !text-white'}`}
          >
            <svg stroke="white" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M12 12h.01"></path><path d="M17 12h.01"></path><path d="M7 12h.01"></path></svg>
            <span className="!text-inherit">PlayCore</span>
          </NavLink>
        </div>

        {/* Global History Section */}
        <div 
          className="flex-1 overflow-y-auto mt-6 flex flex-col gap-4 pb-4 px-1"
          onScroll={() => { if (activeMenuId) setActiveMenuId(null); }}
        >
          
          {isSearchOpen && (
            <div className="px-2">
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full bg-[#202123] text-white text-[13px] rounded-lg p-2 outline-none border border-white/10 focus:border-white/30 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Chat History */}
          {isChatRoute && filteredChatHistory.length > 0 && (
            <div className="flex flex-col gap-0.5">
              
              {pinnedChats.length > 0 && (
                <>
                  <span className="text-xs font-semibold text-gray-500 mb-1 mt-2 px-2 tracking-wider uppercase">Pinned</span>
                  {pinnedChats.map(session => renderChatItem(session))}
                </>
              )}

              {recentChats.length > 0 && (
                <>
                  <span className="text-xs font-semibold text-gray-500 mb-1 mt-4 px-2 tracking-wider uppercase">Recents</span>
                  {recentChats.map(session => renderChatItem(session))}
                </>
              )}
              
            </div>
          )}

          {/* Assignment History */}
          {isAssignmentRoute && filteredAssignmentHistory.length > 0 && (
            <div className="flex flex-col gap-0.5">
              
              {pinnedAssignments.length > 0 && (
                <>
                  <span className="text-xs font-semibold text-gray-500 mb-1 mt-2 px-2 tracking-wider uppercase">Pinned</span>
                  {pinnedAssignments.map(assign => renderAssignmentItem(assign))}
                </>
              )}

              {recentAssignments.length > 0 && (
                <>
                  <span className="text-xs font-semibold text-gray-500 mb-1 mt-4 px-2 tracking-wider uppercase">Recents</span>
                  {recentAssignments.map(assign => renderAssignmentItem(assign))}
                </>
              )}
              
            </div>
          )}
        </div>

        {/* Bottom User Profile */}
        <div className="mt-2 shrink-0 border-t border-white/10 pt-3 relative">
          
          {token ? (
            <>
              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-[#202123] rounded-lg border border-white/10 py-1 shadow-xl z-50">
                  <button 
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-200 hover:bg-[#343541] hover:text-white transition-colors flex items-center gap-3"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/plans');
                    }}
                  >
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    Choose Plan
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-200 hover:bg-[#343541] hover:text-white transition-colors flex items-center gap-3"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Profile
                  </button>
                  <div className="h-[1px] bg-white/10 my-1 w-full"></div>
                  <button 
                    className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-[#343541] hover:text-red-300 transition-colors flex items-center gap-3"
                    onClick={handleLogout}
                  >
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </button>
                </div>
              )}

              <div 
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${isProfileMenuOpen ? 'bg-[#202123]' : 'hover:bg-[#202123]'}`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_8px_rgba(59,130,246,0.3)] shrink-0">
                    {getInitials(user.username || user.name)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[14px] font-semibold text-white truncate">{user.username || user.name || 'User'}</span>
                    <span className="text-[12px] text-gray-400 truncate">{user.email || 'Free'}</span>
                  </div>
                </div>
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400 shrink-0 ml-2">
                  <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
                </svg>
              </div>
            </>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="group relative w-full flex items-center justify-center py-2.5 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]"
            >
              {/* Premium Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Glassy Inner Border */}
              <div className="absolute inset-0 border border-white/20 rounded-xl"></div>
              
              {/* Shine Animation Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              
              {/* Button Content */}
              <div className="relative z-10 flex items-center gap-2 text-white font-semibold tracking-wide text-[15px]">
                <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] transform group-hover:translate-x-1 transition-transform duration-300">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Login
              </div>
            </button>
          )}
        </div>
      </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-[#343541]">
        
        {/* Reopen Sidebar Button (Desktop) */}
        {!isSidebarOpen && (
          <div className="hidden md:flex absolute top-4 left-4 z-50">
            <svg onClick={toggleSidebar} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 p-1 text-gray-400 hover:text-white cursor-pointer transition-colors">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M9 3v18"></path>
            </svg>
          </div>
        )}

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#343541]">
          <div className="flex items-center gap-3">
            <svg onClick={toggleSidebar} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white cursor-pointer">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span className="font-semibold text-white text-lg">TestNova AI</span>
          </div>
          {token ? (
            <button onClick={handleLogout} className="text-sm">Logout</button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="text-sm text-[#2b6ce6] font-medium">Login</button>
          )}
        </div>

        <div className="flex-1 w-full flex flex-col h-full overflow-hidden">
          {React.Children.map(children, child => 
            React.cloneElement(child, { 
              refreshGlobalHistory: fetchGlobalHistory,
              chatHistory: chatHistory,
              assignmentHistory: assignmentHistory
            })
          )}
        </div>
      </div>
      
      {/* Login Modal Overlay */}
      {showLoginModal && (
        <Login setToken={(newToken) => {
          setToken(newToken);
          setShowLoginModal(false);
        }} onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default Layout;
