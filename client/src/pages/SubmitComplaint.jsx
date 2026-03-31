import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, UploadCloud, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_URL } from '../config';

export default function SubmitComplaint() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentDate: '',
    incidentLocation: '',
    accusedName: '',
    accusedDepartment: '',
    severity: 'MEDIUM'
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      files.forEach(file => data.append('evidence', file));

      const res = await axios.post(`${API_URL}/api/complaints`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(res.data.data.trackingCode);
    } catch (err) {
      console.error(err);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="w-20 h-20 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4">Complaint Submitted Successfully</h2>
        <p className="text-slate-300 max-w-md mx-auto mb-8">
          Your report has been securely encrypted and forwarded to the ethics panel. Your identity is hidden.
        </p>
        
        <div className="glass-card bg-white/10 border-white/20 p-6 inline-block mb-8">
          <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Your Tracking Code</p>
          <div className="text-4xl font-mono font-bold tracking-[0.2em] text-primary">{success}</div>
        </div>
        
        <div className="bg-danger/10 border border-danger/30 text-danger px-6 py-4 rounded-xl max-w-lg mb-8 text-sm text-left flex items-start space-x-3">
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <p>Please save this tracking code in a secure location. This is the <strong>ONLY</strong> way to track your complaint status. We cannot recover it for you.</p>
        </div>

        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-xl transition-all"
        >
          Return to Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Submit Complaint</h1>
        <p className="text-slate-400 mt-1">Step {step} of 3</p>
      </header>

      <div className="glass-card p-8">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Incident Overview</h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title / Short Summary</label>
              <input 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Ex. Inappropriate comments during standup"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Detailed Description</label>
              <textarea 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                rows="5"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Please describe what happened in as much detail as possible..."
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Specific Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date of Incident</label>
                <input 
                  type="date"
                  value={formData.incidentDate} onChange={e => setFormData({...formData, incidentDate: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input 
                  value={formData.incidentLocation} onChange={e => setFormData({...formData, incidentLocation: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white"
                  placeholder="Ex. Main Conference Room"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Accused Name</label>
                <input 
                  value={formData.accusedName} onChange={e => setFormData({...formData, accusedName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Accused Department</label>
                <input 
                  value={formData.accusedDepartment} onChange={e => setFormData({...formData, accusedDepartment: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white"
                  placeholder="Sales"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Perceived Severity</label>
              <select 
                value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}
                className="w-full bg-[#1a2234] border border-white/10 rounded-xl py-3 px-4 text-white appearance-none"
              >
                <option value="LOW">Low - Minor infraction</option>
                <option value="MEDIUM">Medium - Needs addressing</option>
                <option value="HIGH">High - Serious violation</option>
                <option value="CRITICAL">Critical - Immediate threat/safety risk</option>
              </select>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Evidence & Review</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Attach Evidence (Optional)</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-sm text-slate-400">Click or drag files here to upload</p>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-400 mt-4 mx-auto file:mx-auto file:block file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primaryHover"
                />
              </div>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-slate-300 font-medium">Selected Files:</p>
                  {files.map((f, i) => (
                    <div key={i} className="text-sm text-slate-400 bg-white/5 p-2 rounded-lg">{f.name}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mt-6">
              <h4 className="font-medium text-primary mb-1">Final Review</h4>
              <p className="text-xs text-slate-300">By submitting this complaint, you certify that the information provided is accurate to the best of your knowledge. False complaints or misuse of the platform may result in account restrictions.</p>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
          <button 
            type="button"
            onClick={() => setStep(step > 1 ? step - 1 : 1)}
            disabled={step === 1 || submitting}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-white'}`}
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          {step < 3 ? (
            <button 
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!formData.title || !formData.description)}
              className="flex items-center space-x-2 bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              <span>Continue</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center space-x-2 bg-secondary hover:bg-green-600 text-white px-8 py-2 rounded-xl transition-all shadow-lg shadow-secondary/20"
            >
              <CheckCircle size={18} />
              <span>{submitting ? 'Submitting...' : 'Submit Complaint'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
