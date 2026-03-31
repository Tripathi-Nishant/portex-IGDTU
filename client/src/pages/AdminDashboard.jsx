import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ShieldAlert, FileText, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { API_URL } from '../config';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/kpis`);
        setKpis(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  if (loading) return <div>Loading Analytics...</div>;

  const COLORS = ['#7c3aed', '#22c55e', '#ef4444', '#94a3b8'];
  
  const chartData = kpis?.complaintsByStatus.map(item => ({
    name: item.status,
    value: item._count.id
  })) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Admin Analytical Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview, system health, and active alerts.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-t-4 border-primary bg-gradient-to-b from-primary/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Complaints</p>
              <h3 className="text-4xl font-bold mt-2">{kpis?.totalComplaints || 0}</h3>
            </div>
            <div className="p-3 bg-primary/20 rounded-xl text-primary"><FileText size={24} /></div>
          </div>
        </div>

        <div className="glass-card p-6 border-t-4 border-danger bg-gradient-to-b from-danger/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium">Active System Alerts</p>
              <h3 className="text-4xl font-bold mt-2 text-danger">{kpis?.activeAlerts || 0}</h3>
            </div>
            <div className="p-3 bg-danger/20 rounded-xl text-danger"><ShieldAlert size={24} /></div>
          </div>
        </div>

        <div className="glass-card p-6 border-t-4 border-secondary bg-gradient-to-b from-secondary/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 font-medium">Resolution Rate</p>
              <h3 className="text-4xl font-bold mt-2 text-secondary">
                {kpis?.totalComplaints ? 
                  Math.round(((kpis.totalComplaints - (chartData.find(d => d.name === 'PENDING')?.value || 0)) / kpis.totalComplaints) * 100) : 0}%
              </h3>
            </div>
            <div className="p-3 bg-secondary/20 rounded-xl text-secondary"><CheckCircle2 size={24} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center"><TrendingUp size={18} className="mr-2 text-primary" /> Reports by Status</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
            )}
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-4 text-xs font-medium">
            {chartData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="text-slate-300">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-white/0">
          <h3 className="text-lg font-semibold mb-4 flex items-center"><Users size={18} className="mr-2 text-primary" /> Platform Security Info</h3>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            SafeVoice ensures 100% anonymity by utilizing one-way cryptographic hashing for complaint submissions. IP addresses are NOT logged in connection to the complaints.
          </p>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-slate-400">Database Engine</span>
              <span className="text-sm font-medium">PostgreSQL (Prisma)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-slate-400">Encryption Standard</span>
              <span className="text-sm font-medium">Bcrypt & SHA-256</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-slate-400">Misuse Prevention</span>
              <span className="text-sm font-medium text-secondary">Active via AnonMapping</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
