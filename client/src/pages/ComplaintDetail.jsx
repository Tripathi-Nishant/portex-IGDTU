import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Clock, CheckCircle2, Download, ShieldAlert, BarChart as BarChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [voteStats, setVoteStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vote, setVote] = useState('');
  const [submittingVote, setSubmittingVote] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/complaints/${id}`);
        setComplaint(res.data.data.complaint);
        setVoteStats(res.data.data.voteStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleVote = async () => {
    if (!vote) return;
    setSubmittingVote(true);
    try {
      await axios.post(`http://localhost:5000/api/ethics/vote/${id}`, { decision: vote });
      const res = await axios.get(`http://localhost:5000/api/complaints/${id}`);
      setComplaint(res.data.data.complaint);
      setVoteStats(res.data.data.voteStats);
      alert('Vote submitted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Vote failed');
    } finally {
      setSubmittingVote(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!complaint) return <div>Complaint not found</div>;

  const hasVoted = complaint.votes?.some(v => v.userId === user.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white text-sm mb-4 transition-colors">← Back to Dashboard</button>
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              complaint.severity === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/50' :
              complaint.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50' :
              'bg-blue-500/20 text-blue-500 border border-blue-500/50'
            }`}>
              {complaint.severity}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              complaint.status === 'PENDING' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50' :
              complaint.status === 'SUBSTANTIATED' ? 'bg-secondary/20 text-secondary border border-secondary/50' :
              'bg-slate-500/20 text-slate-300 border border-slate-500/50'
            }`}>
              {complaint.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{complaint.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-300">
        <div className="col-span-2 space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold border-b border-white/10 pb-3 mb-4 flex items-center">
              <AlertCircle size={20} className="mr-2 text-primary" />
              Incident Description
            </h3>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
              {complaint.description}
            </p>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold border-b border-white/10 pb-3 mb-4 flex items-center">
              <Download size={20} className="mr-2 text-primary" />
              Attached Evidence
            </h3>
            {complaint.evidence && complaint.evidence.length > 0 ? (
              <ul className="space-y-3">
                {complaint.evidence.map((ev, idx) => (
                  <li key={ev.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="font-mono text-sm">Evidence_File_{idx+1}.{ev.fileUrl.split('.').pop()}</span>
                    <a href={`http://localhost:5000${ev.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primaryHover text-sm bg-primary/10 px-3 py-1 rounded-lg">View</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 italic">No evidence files attached to this complaint.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-b from-white/5 to-transparent">
            <h3 className="font-semibold text-white mb-4">Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Incident Date</p>
                <p className="font-medium text-white">{format(new Date(complaint.incidentDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-slate-500">Location</p>
                <p className="font-medium text-white">{complaint.incidentLocation || 'Not specified'}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-slate-500 flex items-center"><ShieldAlert size={14} className="mr-1"/> Accused Party</p>
                <p className="font-medium text-white text-lg">{complaint.accusedName || 'Unknown'}</p>
                <p className="text-slate-400">{complaint.accusedDepartment}</p>
              </div>
            </div>
          </div>

          {user.role === 'ETHICS_MEMBER' && complaint.status === 'PENDING' && !hasVoted && (
            <div className="glass-card p-6 border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-primary">
                <BarChartIcon size={100} />
              </div>
              <h3 className="text-lg font-bold mb-2 relative z-10 text-primary">Cast Your Vote</h3>
              <p className="text-xs text-slate-400 mb-4 relative z-10">Review evidence completely before voting. Votes are final.</p>
              
              <div className="space-y-3 relative z-10">
                <label className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/10 border border-transparent has-[:checked]:border-secondary has-[:checked]:bg-secondary/10">
                  <input type="radio" name="vote" value="SUBSTANTIATED" checked={vote === 'SUBSTANTIATED'} onChange={(e) => setVote(e.target.value)} className="form-radio text-secondary bg-transparent border-white/20" />
                  <span className="font-medium">Substantiated</span>
                </label>
                <label className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/10 border border-transparent has-[:checked]:border-danger has-[:checked]:bg-danger/10">
                  <input type="radio" name="vote" value="UNSUBSTANTIATED" checked={vote === 'UNSUBSTANTIATED'} onChange={(e) => setVote(e.target.value)} className="form-radio text-danger bg-transparent border-white/20" />
                  <span className="font-medium">Unsubstantiated</span>
                </label>
                <label className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/10 border border-transparent has-[:checked]:border-slate-500 has-[:checked]:bg-slate-500/10">
                  <input type="radio" name="vote" value="INCONCLUSIVE" checked={vote === 'INCONCLUSIVE'} onChange={(e) => setVote(e.target.value)} className="form-radio text-slate-500 bg-transparent border-white/20" />
                  <span className="font-medium">Inconclusive</span>
                </label>
                <button 
                  onClick={handleVote} 
                  disabled={!vote || submittingVote}
                  className="w-full mt-4 bg-primary hover:bg-primaryHover text-white font-medium py-3 rounded-xl disabled:opacity-50 transition-colors"
                >
                  Submit Decision
                </button>
              </div>
            </div>
          )}

          {(hasVoted || complaint.status !== 'PENDING') && (
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={40} className="text-secondary mb-3" />
              <h3 className="font-bold">Evaluation Complete</h3>
            </div>
          )}

          {voteStats && voteStats.total > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <BarChartIcon size={18} className="mr-2 text-primary" />
                Voting Distribution
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'In Favor', value: voteStats.SUBSTANTIATED, color: '#10b981' }, // secondary
                        { name: 'Against', value: voteStats.UNSUBSTANTIATED, color: '#ef4444' }, // danger
                        { name: 'Inconclusive', value: voteStats.INCONCLUSIVE, color: '#64748b' } // slate-500
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'In Favor', value: voteStats.SUBSTANTIATED, color: '#10b981' },
                        { name: 'Against', value: voteStats.UNSUBSTANTIATED, color: '#ef4444' },
                        { name: 'Inconclusive', value: voteStats.INCONCLUSIVE, color: '#64748b' }
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-slate-500 mb-1">For</p>
                  <p className="font-bold text-secondary">{voteStats.SUBSTANTIATED}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-slate-500 mb-1">Against</p>
                  <p className="font-bold text-danger">{voteStats.UNSUBSTANTIATED}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-slate-500 mb-1">Total</p>
                  <p className="font-bold text-white">{voteStats.total}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
