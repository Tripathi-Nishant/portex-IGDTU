import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';

export default function EthicsDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/complaints`);
        setComplaints(res.data.data.complaints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const pendingComplaints = complaints.filter(c => c.status === 'PENDING');
  const resolvedComplaints = complaints.filter(c => c.status !== 'PENDING');

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Ethics Panel Dashboard</h1>
          <p className="text-slate-400 mt-1">Review active incidents and submit your evaluations.</p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Pending</div>
            <div className="text-2xl font-semibold text-yellow-400">{pendingComplaints.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Resolved</div>
            <div className="text-2xl font-semibold text-secondary">{resolvedComplaints.length}</div>
          </div>
        </div>
      </header>

      <div>
        <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Requires Review</h2>
        {pendingComplaints.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50 text-secondary" />
            <p>All clear! No pending complaints require your attention right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingComplaints.map(complaint => (
              <Link key={complaint.id} to={`/complaints/${complaint.id}`}>
                <div className="glass hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all group flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {complaint.isOverdue ? (
                        <AlertTriangle className="text-danger" size={24} />
                      ) : (
                        <Clock className="text-yellow-400" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white group-hover:text-primary transition-colors">{complaint.title}</h3>
                      <div className="text-sm text-slate-400 mt-1 flex space-x-4">
                        <span>Submitted: {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
                        <span className={complaint.isOverdue ? 'text-danger' : 'text-slate-400'}>
                          Deadline: {format(new Date(complaint.deadline), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-500 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2 mt-12">Recently Resolved</h2>
        <div className="grid grid-cols-1 gap-4">
            {resolvedComplaints.slice(0, 5).map(complaint => (
              <Link key={complaint.id} to={`/complaints/${complaint.id}`}>
                <div className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all flex items-center justify-between opacity-80 hover:opacity-100">
                  <div>
                    <h3 className="font-medium text-white">{complaint.title}</h3>
                    <div className="text-xs text-slate-500 flex space-x-3 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-white/10">{complaint.status}</span>
                      <span>Decided: {format(new Date(complaint.updatedAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
      </div>
    </motion.div>
  );
}
