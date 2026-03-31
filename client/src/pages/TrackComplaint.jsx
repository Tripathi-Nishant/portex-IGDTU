import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, Clock, CheckCircle2, XCircle, HelpCircle, BarChart as BarChartIcon } from 'lucide-react';
import { API_URL } from '../config';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts';

export default function TrackComplaint() {
  const [code, setCode] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [voteStats, setVoteStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    setError('');
    setComplaint(null);
    
    try {
      const res = await axios.get(`${API_URL}/api/complaints/track/${code.trim()}`);
      setComplaint(res.data.data.complaint);
      setVoteStats(res.data.data.voteStats);
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status, isOverdue) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="text-yellow-400 w-12 h-12" />,
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10 border-yellow-400/20',
          text: isOverdue ? 'Pending (Overdue Review)' : 'Under Investigation'
        };
      case 'SUBSTANTIATED':
        return {
          icon: <CheckCircle2 className="text-secondary w-12 h-12" />,
          color: 'text-secondary',
          bg: 'bg-secondary/10 border-secondary/20',
          text: 'Substantiated (Action Taken)'
        };
      case 'UNSUBSTANTIATED':
        return {
          icon: <XCircle className="text-danger w-12 h-12" />,
          color: 'text-danger',
          bg: 'bg-danger/10 border-danger/20',
          text: 'Unsubstantiated / Closed'
        };
      case 'INCONCLUSIVE':
        return {
          icon: <HelpCircle className="text-slate-400 w-12 h-12" />,
          color: 'text-slate-400',
          bg: 'bg-white/5 border-white/10',
          text: 'Inconclusive'
        };
      default:
        return { icon: null, color: '', bg: '', text: status };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Track Your Report</h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Enter the tracking code you received when you submitted your anonymous complaint to view its current status.
        </p>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card max-w-xl mx-auto p-2 flex">
        <form onSubmit={handleSearch} className="flex w-full">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter tracking code (e.g. A1B2C3D4)"
            className="flex-1 bg-transparent text-white px-6 py-4 focus:outline-none font-mono tracking-widest text-lg placeholder-slate-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primaryHover text-white px-8 rounded-xl font-medium transition-colors flex items-center shadow-lg shadow-primary/20"
          >
            <Search size={20} className="mr-2" />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 max-w-xl mx-auto bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-center">
          {error}
        </motion.div>
      )}

      {complaint && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-12 max-w-xl mx-auto">
          {(() => {
            const display = getStatusDisplay(complaint.status, complaint.isOverdue);
            return (
              <div className={`glass border ${display.bg} rounded-3xl p-8 text-center relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-20" />
                
                <div className="flex justify-center mb-6">
                  {display.icon}
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${display.color}`}>
                  {display.text}
                </h3>
                
                <div className="mt-8 pt-8 border-t border-white/10 text-left space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Incident Summary</p>
                    <p className="font-medium text-lg">{complaint.title}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Submitted On</p>
                      <p className="font-medium">{format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Expected Resolution By</p>
                      <p className="font-medium">{format(new Date(complaint.deadline), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>

                {voteStats && voteStats.total > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/10 text-left">
                    <p className="text-sm text-slate-500 mb-4 flex items-center">
                      <BarChartIcon size={16} className="mr-2" />
                      Judge Consensus Distribution
                    </p>
                    <div className="h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[
                            { name: 'In Favor', value: voteStats.SUBSTANTIATED, color: '#10b981' },
                            { name: 'Against', value: voteStats.UNSUBSTANTIATED, color: '#ef4444' },
                            { name: 'Inconclusive', value: voteStats.INCONCLUSIVE, color: '#64748b' }
                          ].filter(d => d.value > 0)}
                          margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#f8fafc' }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {[
                              { name: 'In Favor', value: voteStats.SUBSTANTIATED, color: '#10b981' },
                              { name: 'Against', value: voteStats.UNSUBSTANTIATED, color: '#ef4444' },
                              { name: 'Inconclusive', value: voteStats.INCONCLUSIVE, color: '#64748b' }
                            ].filter(d => d.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
