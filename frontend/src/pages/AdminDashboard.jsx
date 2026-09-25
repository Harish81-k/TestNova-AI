import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiEdit2, FiCheck, FiX, FiLogOut, FiActivity, FiShield, FiSearch, FiTrash2 } from 'react-icons/fi';

const AdminDashboard = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit mode state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editPlanType, setEditPlanType] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAdminLoggedIn(true);
      fetchUsers(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/admin/login', { username, password });
      const { token } = res.data;
      localStorage.setItem('admin_token', token);
      setIsAdminLoggedIn(true);
      fetchUsers(token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminLoggedIn(false);
    setUsers([]);
  };

  const fetchUsers = async (token) => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
    setLoading(false);
  };

  const handleEditPlan = (user) => {
    setEditingUserId(user._id);
    setEditPlanType(user.planType);
  };

  const handleSavePlan = async (userId) => {
    const token = localStorage.getItem('admin_token');
    try {
      await axios.put(`/admin/users/${userId}/plan`, { planType: editPlanType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingUserId(null);
      fetchUsers(token);
    } catch (err) {
      console.error(err);
      alert('Failed to update plan');
    }
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to completely DELETE and BAN user "${user.username}"? They will be permanently removed and their credentials will be blocked from future use.`)) {
      const token = localStorage.getItem('admin_token');
      try {
        await axios.delete(`/admin/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers(token);
      } catch (err) {
        console.error(err);
        alert('Failed to delete and ban user');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanBadge = (plan) => {
    switch(plan) {
      case 'Pro Plan':
        return 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'Enterprise Plan':
        return 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.2)]';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-purple-500/20">
              <FiShield size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 text-center tracking-tight">Admin Portal</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">Authenticate to access the management dashboard</p>
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
            <FiX className="shrink-0" /> {error}
          </div>}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Admin ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="Enter admin identifier"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] mt-8"
            >
              Access System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-purple-500/20">
              <FiShield size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">System Admin</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-emerald-400 text-sm font-medium">Network Online</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-slate-500"
              />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl transition-all text-sm font-semibold text-red-400 hover:text-red-300"
            >
              <FiLogOut /> <span className="hidden sm:inline">Terminate</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-400">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-white">{users.length}</h3>
            </div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 text-purple-400">
              <FiActivity size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Pro Subscriptions</p>
              <h3 className="text-2xl font-bold text-white">{users.filter(u => u.planType === 'Pro Plan').length}</h3>
            </div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-4">
            <div className="bg-pink-500/10 p-3 rounded-xl border border-pink-500/20 text-pink-400">
              <FiShield size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Enterprise Clients</p>
              <h3 className="text-2xl font-bold text-white">{users.filter(u => u.planType === 'Enterprise Plan').length}</h3>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h2 className="text-xl font-bold text-white tracking-wide">User Directory</h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-purple-400/70 text-sm font-medium animate-pulse">Syncing Database...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/5">
                    <th className="px-8 py-5">Identity</th>
                    <th className="px-8 py-5">Contact</th>
                    <th className="px-8 py-5">Access Tier</th>
                    <th className="px-8 py-5">Onboarded</th>
                    <th className="px-8 py-5 text-right">Overrides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <FiUsers size={32} className="opacity-20" />
                          <p>No user records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner overflow-hidden">
                              {user.profilePic ? (
                                <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                user.username.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-white block">{user.username}</span>
                              <span className="text-xs text-slate-500 font-mono">ID: {user._id.substring(0, 8)}...</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-slate-400 text-sm">
                          {user.email || <span className="text-slate-600 italic">Unspecified</span>}
                        </td>
                        <td className="px-8 py-5">
                          {editingUserId === user._id ? (
                            <select
                              value={editPlanType}
                              onChange={(e) => setEditPlanType(e.target.value)}
                              className="bg-black/60 border border-purple-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="Free Plan">Free Plan</option>
                              <option value="Pro Plan">Pro Plan</option>
                              <option value="Enterprise Plan">Enterprise Plan</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getPlanBadge(user.planType || 'Free Plan')}`}>
                              {user.planType || 'Free Plan'}
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-slate-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-8 py-5 text-right">
                          {editingUserId === user._id ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSavePlan(user._id)}
                                className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-all"
                                title="Commit Changes"
                              >
                                <FiCheck size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                                title="Abort"
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditPlan(user)}
                                className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                title="Modify Access"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete and Ban User"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
