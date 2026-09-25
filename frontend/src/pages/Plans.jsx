import React, { useState } from 'react';
import { FiCheck, FiStar, FiZap, FiShield } from 'react-icons/fi';
import axios from 'axios';

const Plans = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSelectPlan = async (planType) => {
    setLoadingPlan(planType);
    setSuccessMsg('');
    try {
      // Get user ID from local storage (we assume it is stored in 'user' object)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Note: the admin endpoint updates plans, but normally a user endpoint should update their own plan.
        // We will just show a simulation or call a user endpoint if it exists.
        // Assuming we have a PUT /api/users/profile or similar.
        const token = localStorage.getItem('access_token');
        await axios.put('/users/profile', { planType }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local storage user
        user.planType = planType;
        localStorage.setItem('user', JSON.stringify(user));
        
        setSuccessMsg(`Successfully upgraded to ${planType}!`);
      } else {
        alert("User not found. Please log in again.");
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update plan. Make sure the backend endpoint exists.');
    }
    setLoadingPlan(null);
  };

  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      period: '/month',
      icon: <FiStar size={24} />,
      color: 'slate',
      features: [
        'Access to basic AI models',
        'Standard execution speed',
        'Community support',
        'Basic coding environments'
      ]
    },
    {
      name: 'Pro Plan',
      price: '$20',
      period: '/month',
      icon: <FiZap size={24} />,
      color: 'purple',
      popular: true,
      features: [
        'Access to GPT-4 & advanced models',
        'Priority execution speed',
        'Email support',
        'Advanced reasoning analytics',
        'Custom test environments'
      ]
    },
    {
      name: 'Enterprise Plan',
      price: '$99',
      period: '/month',
      icon: <FiShield size={24} />,
      color: 'emerald',
      features: [
        'Unlimited AI model access',
        'Dedicated execution nodes',
        '24/7 Phone & Email support',
        'Full platform analytics',
        'Custom integration & SSO'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-4 tracking-tight">Choose Your Plan</h2>
          <p className="text-xl text-slate-400">Unlock the full potential of TestNova AI</p>
          
          {successMsg && (
            <div className="mt-6 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-full text-sm font-medium">
              <FiCheck /> {successMsg}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative bg-white/[0.02] backdrop-blur-xl border rounded-3xl p-8 flex flex-col transition-transform hover:-translate-y-2 ${
                plan.popular ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`text-${plan.color}-400 mb-4`}>
                {plan.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-slate-400 ml-1">{plan.period}</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                    <FiCheck className={`mt-0.5 shrink-0 text-${plan.color}-400`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={loadingPlan !== null}
                className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-purple-500/25' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                } disabled:opacity-50`}
              >
                {loadingPlan === plan.name ? 'Processing...' : `Select ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plans;
