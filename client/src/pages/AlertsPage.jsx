import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/alerts');
      setAlerts(res.data.data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/alerts/${id}/acknowledge`);
      fetchAlerts(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading Alerts...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <ShieldAlert className="mr-3 text-danger" size={36} />
          System Escalation Alerts
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Automated warnings regarding severe clusters of complaints against specific individuals or departments. 
          Use these insights to launch official corporate investigations where automated thresholds have been breached.
        </p>
      </header>

      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 flex flex-col items-center">
          <CheckCircle size={48} className="text-secondary mb-4 opacity-70" />
          <p className="text-xl font-medium text-white mb-2">No Active Alerts</p>
          <p>The alert engine has not detected any concerning clusters or thresholds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <motion.div 
              key={alert.id}
              layout
              className={`glass-card p-6 border-l-4 ${
                alert.isAcknowledged ? 'border-slate-500 opacity-60' :
                alert.severity === 'CRITICAL' ? 'border-danger bg-danger/5' :
                alert.severity === 'HIGH' ? 'border-orange-500 bg-orange-500/5' :
                'border-yellow-400 bg-yellow-400/5'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {!alert.isAcknowledged && <AlertTriangle className={
                      alert.severity === 'CRITICAL' ? 'text-danger' :
                      alert.severity === 'HIGH' ? 'text-orange-500' :
                      'text-yellow-400'
                    } size={28} />}
                    {alert.isAcknowledged && <CheckCircle className="text-slate-500" size={28} />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${alert.isAcknowledged ? 'text-slate-400' : 'text-white'}`}>
                      {alert.type} - {alert.severity}
                    </h3>
                    <p className={`mt-2 ${alert.isAcknowledged ? 'text-slate-500' : 'text-slate-300'}`}>
                      {alert.description}
                    </p>
                    <div className="mt-4 flex space-x-6 text-sm">
                      <div>
                        <span className="text-slate-500">Department:</span> <span className="font-semibold">{alert.accusedDepartment}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Detection Date:</span> <span>{format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!alert.isAcknowledged && (
                  <button 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="shrink-0 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                {alert.isAcknowledged && (
                  <span className="text-sm font-medium text-slate-500 bg-white/5 px-4 py-2 rounded-xl">Acknowledged</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
