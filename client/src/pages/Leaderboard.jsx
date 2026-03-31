import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Award, Star, Zap, Target } from 'lucide-react';
import { API_URL } from '../config';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/ethics/leaderboard`);
        setLeaders(res.data.data.leaderboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading Rankings...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
          <Award size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">Ethics Panel Leaderboard</h1>
        <p className="text-slate-400 mt-2">Monthly rankings based on resolution speed and consensus matching.</p>
      </header>

      <div className="space-y-4">
        {leaders.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No scoring data available for this month yet.</div>
        ) : (
          leaders.map((leader, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: index * 0.1 }}
              key={leader.id} 
              className={`glass-card p-6 flex items-center justify-between relative overflow-hidden ${index === 0 ? 'border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : ''}`}
            >
              {index === 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-[40px] pointer-events-none" />}
              
              <div className="flex items-center space-x-6 z-10">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                  index === 1 ? 'bg-slate-300 text-slate-800' : 
                  index === 2 ? 'bg-amber-700 text-amber-100' : 
                  'bg-white/10 text-white'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                    {leader.user.email} {index === 0 && <span className="ml-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full uppercase tracking-wider font-bold">Top Evaluator</span>}
                  </h3>
                  <div className="flex space-x-4 text-xs text-slate-400">
                    <span className="flex items-center"><Zap size={12} className="mr-1 text-secondary" /> {leader.fastResolutionsCount} Fast</span>
                    <span className="flex items-center"><Target size={12} className="mr-1 text-primary" /> {leader.majorityMatchesCount} Consensus</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right z-10">
                <div className="text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent flex items-center">
                  <Star size={20} className={`mr-2 ${index === 0 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                  {leader.score}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Total Points</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
