import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header>
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <p className="text-slate-400 mt-1">Report incidents securely and anonymously.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/submit-complaint">
          <div className="glass-card hover:border-primary/50 cursor-pointer group h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Submit New Complaint</h3>
            <p className="text-slate-400 text-sm">
              Report harassment safely. Your identity remains 100% anonymous to the reviewers.
            </p>
          </div>
        </Link>

        <Link to="/track">
          <div className="glass-card hover:border-secondary/50 cursor-pointer group h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Existing Complaint</h3>
            <p className="text-slate-400 text-sm">
              Use the unique tracking code given to you to check the status of your report.
            </p>
          </div>
        </Link>
      </div>

      <div className="glass-card mt-8 p-6 bg-blue-500/10 border-blue-500/20">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">Your Anonymity is Protected</h3>
        <p className="text-sm text-slate-300">
          We use cryptographic hashing to separate your identity from your complaints. Ethics panels make decisions based completely on the facts of the incident, without knowing who submitted it. To maintain safety, the system tracks misuse internally but does not expose original reporter IDs.
        </p>
      </div>
    </motion.div>
  );
}
