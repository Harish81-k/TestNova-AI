import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const [user, setUser] = useState({ username: 'Loading...', email: '', location: '', bio: '', planType: 'Free Plan' });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', location: '', bio: '', profilePic: '' });
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
    // Clear the input value so the same file can be uploaded again if needed
    e.target.value = null;
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [userRes, statsRes] = await Promise.all([
        axios.get('/users/profile').catch(() => ({ data: JSON.parse(localStorage.getItem('user')) || { username: 'User' } })),
        axios.get('/analytics/dashboard').catch(() => ({ data: null }))
      ]);
      
      setUser(userRes.data);
      setStats(statsRes.data);
      setEditForm({
        username: userRes.data.username || '',
        email: userRes.data.email || '',
        location: userRes.data.location || '',
        bio: userRes.data.bio || '',
        profilePic: userRes.data.profilePic || ''
      });
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting edit form", editForm);
    setUpdateStatus({ type: '', message: '' });
    try {
      const res = await axios.put('/users/profile', editForm);
      setUser(res.data);
      
      // Keep localStorage in sync but avoid storing large base64 image strings to prevent QuotaExceeded errors
      const userToStore = { ...res.data };
      delete userToStore.profilePic;
      localStorage.setItem('user', JSON.stringify(userToStore)); 
      
      setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditing(false);
        setUpdateStatus({ type: '', message: '' });
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile', err);
      setUpdateStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update profile' });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Compile recent activity feed
  const activityFeed = [];
  if (stats?.assessmentHistory) {
    stats.assessmentHistory.forEach(a => activityFeed.push({
      type: 'assessment',
      title: `Completed ${a.topic} Assessment`,
      score: `${a.percentage || 0}%`,
      date: new Date(a.createdAt)
    }));
  }
  if (stats?.codingHistory) {
    stats.codingHistory.forEach(c => activityFeed.push({
      type: 'coding',
      title: `Completed ${c.difficulty} Coding Challenge`,
      score: `${c.percentage || 0}%`,
      date: new Date(c.createdAt)
    }));
  }
  
  activityFeed.sort((a, b) => b.date - a.date);

  const chartData = {
    labels: stats?.assessment_dates || [],
    datasets: [
      {
        label: 'Assessment Scores',
        data: stats?.assessment_scores || [],
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#6b7280', font: { family: 'Inter, sans-serif' } }, grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false } },
      x: { ticks: { color: '#6b7280', font: { family: 'Inter, sans-serif' } }, grid: { display: false, drawBorder: false } }
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-black overflow-y-auto font-sans text-white relative p-4 md:p-8 z-0">
      
      {/* Background Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden">
        <div className="text-[30vw] font-black text-white/[0.02] tracking-tighter select-none">
          PR
        </div>
      </div>

      <div className="max-w-5xl mx-auto pb-20">
        
        {/* Header - Minimalist with Profile Image */}
        <div data-aos="fade-down" className="flex flex-col md:flex-row items-center md:items-center justify-center gap-10 md:gap-32 mt-16 mb-24 relative">
          
          {/* Profile Image */}
          <div 
            className="relative group cursor-pointer" 
            onClick={() => { 
              if (!isEditing) {
                setUpdateStatus({ type: '', message: '' });
                setIsEditing(true);
              }
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
          >
            <div className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center text-white font-light text-4xl shrink-0 bg-black overflow-hidden relative">
              {(user.profilePic && user.profilePic !== "null" && user.profilePic !== "undefined") || (isEditing && editForm.profilePic && editForm.profilePic !== "null" && editForm.profilePic !== "undefined") ? (
                <img src={isEditing && editForm.profilePic ? editForm.profilePic : user.profilePic} alt="Profile" className="w-full h-full object-cover opacity-90 group-hover:opacity-40 transition-opacity duration-300" />
              ) : (
                <span className="opacity-90 group-hover:opacity-40 transition-opacity duration-300">{getInitials(user.username)}</span>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6 text-white mb-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span className="text-[8px] tracking-widest font-bold uppercase text-white">Upload</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">{user.planType || 'FREE PLAN'}</span>
            </div>

            {/* Name & Bio */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {user.username}
            </h1>
            <p className="text-gray-400 text-sm max-w-lg mb-8 leading-relaxed">
              {user.bio ? user.bio : user.email}
            </p>

            {/* Action Button */}
            <button 
              className="group border border-white/20 px-8 py-3 text-xs tracking-[0.2em] text-white uppercase hover:bg-white/5 transition-all duration-300 flex items-center gap-4"
              onClick={() => {
                setUpdateStatus({ type: '', message: '' });
                setIsEditing(true);
              }}
            >
              EDIT PROFILE
              <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditing(false)}></div>
            <div className="relative bg-[#0a0a0a] border border-white/10 p-8 sm:p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-white tracking-[0.15em] uppercase">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white transition-colors">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {updateStatus.message && (
                <div className={`mb-6 p-3 text-xs tracking-widest uppercase border ${updateStatus.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                  {updateStatus.message}
                </div>
              )}
              
              <div className="space-y-6">
                
                {/* Profile Picture Upload Section */}
                <div className="flex flex-col items-center mb-6">
                  <div 
                    className="relative group cursor-pointer" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center text-white font-light text-2xl shrink-0 bg-black overflow-hidden relative transition-all duration-300 group-hover:border-white/40 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      {editForm.profilePic && editForm.profilePic !== "null" && editForm.profilePic !== "undefined" ? (
                        <img src={editForm.profilePic} alt="Profile" className="w-full h-full object-cover opacity-90 group-hover:opacity-30 transition-opacity duration-300" />
                      ) : user.profilePic && user.profilePic !== "null" && user.profilePic !== "undefined" ? (
                        <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover opacity-90 group-hover:opacity-30 transition-opacity duration-300" />
                      ) : (
                        <span className="opacity-90 group-hover:opacity-30 transition-opacity duration-300">{getInitials(user.username)}</span>
                      )}
                      
                      {/* Always visible subtle camera icon */}
                      <div className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full border border-white/20 pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-3 h-3 text-white"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      </div>

                      {/* Hover text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5 text-white mb-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span className="text-[8px] tracking-[0.2em] uppercase font-bold text-white">Upload</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 tracking-[0.15em] font-semibold uppercase mt-3">Profile Image</span>
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-2">Username / Name</label>
                  <input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 focus:bg-black transition-colors" placeholder="Enter your username" />
                </div>
                
                <div>
                  <label className="block text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-2">Email Address</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 focus:bg-black transition-colors" placeholder="Enter your email" />
                </div>
                
                <div>
                  <label className="block text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-2">Location</label>
                  <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 focus:bg-black transition-colors" placeholder="e.g. San Francisco, CA" />
                </div>
                
                <div>
                  <label className="block text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-2">Bio</label>
                  <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 focus:bg-black transition-colors resize-none h-20" placeholder="Tell us about yourself..." />
                </div>
                
                <div className="flex gap-4 justify-end pt-6 border-t border-white/5 mt-8">
                  <button type="button" onClick={() => setIsEditing(false)} className="text-[10px] tracking-[0.2em] font-bold text-gray-500 hover:text-white uppercase transition-colors px-4 py-2">
                    Cancel
                  </button>
                  <button type="button" onClick={handleEditSubmit} className="bg-white text-black px-6 py-2 text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-gray-200 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row - Monochromatic and Centered */}
        {stats && (
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 mb-24 w-full" data-aos="fade-up" data-aos-delay="100">
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl font-light text-white mb-3">{stats.streak || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Days Active</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl font-light text-white mb-3">{stats.assessment_scores?.length || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Quizzes Taken</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl font-light text-white mb-3">{stats.coding_scores?.length || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Code Challenges</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl font-light text-white mb-3">
                {stats.assessment_scores?.length ? Math.round(stats.assessment_scores.reduce((a,b)=>a+b,0)/stats.assessment_scores.length) : 0}%
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Avg Score</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12 w-full" data-aos="fade-up" data-aos-delay="200">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 flex flex-col">
            <h2 className="text-sm font-bold text-white mb-8 tracking-[0.2em] uppercase text-center md:text-left">Performance History</h2>
            <div className="flex-1 w-full min-h-[300px] flex items-center justify-center relative">
              {stats?.assessment_scores?.length > 0 ? (
                <div className="w-full h-[300px] absolute inset-0">
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">Not enough data to display performance history. Take some assessments!</div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-white mb-8 tracking-[0.2em] uppercase text-center md:text-left">Recent Activity</h2>
            <div className="flex-1 overflow-y-auto pr-4 space-y-8 max-h-[350px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10">
              {activityFeed.length > 0 ? (
                activityFeed.slice(0, 10).map((activity, i) => (
                  <div key={i} className="flex gap-4 items-start relative group">
                    <div className="mt-1.5 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] shrink-0 z-10 transition-colors duration-300 bg-white group-hover:bg-blue-400">
                    </div>
                    <div>
                      <div className="text-[15px] font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">{activity.title}</div>
                      <div className="text-xs text-gray-400 flex gap-2 items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${activity.type === 'assessment' ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'}`}>{activity.type}</span>
                        <span>{activity.score}</span>
                        <span>•</span>
                        <span>{activity.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm italic">No recent activity.</div>
              )}
            </div>
          </div>

        </div>

      </div>
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
    </div>
  );
};

export default Profile;
