import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Users, Search, Bell, LogOut, ChevronRight, Activity } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const DoctorDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/doctor/patients', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();

    const socket = io('http://localhost:3001');
    socket.emit('join-doctor-room', user._id);

    socket.on('new-health-log', (data) => {
      // Refresh patient list to get latest logs
      fetchPatients();
    });

    return () => socket.disconnect();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return 'bg-red-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      <header className="glass-panel border-b border-slate-200 dark:border-slate-800/60 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3 text-brand-600">
          <Activity size={32} strokeWidth={2.5} />
          <div>
            <h1 className="font-bold text-xl text-slate-800">Doctor Dashboard</h1>
            <p className="text-xs text-slate-500">{user?.name} • {user?.hospital}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative text-slate-400 focus-within:text-brand-500 transition-colors">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="relative text-slate-400 hover:text-slate-600 transition">
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition font-medium">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Patients</h2>
            <p className="text-slate-500">Monitor their health status and AI triage summaries.</p>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl flex gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> High Risk</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span> Medium Risk</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Low Risk</div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((skel) => (
              <div key={skel} className="glass-panel rounded-2xl p-6 h-48 flex flex-col justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full skeleton-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 skeleton-pulse"></div>
                    <div className="h-3 w-20 skeleton-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 w-full skeleton-pulse"></div>
                  <div className="h-3 w-4/5 skeleton-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient, idx) => {
              const latestLog = patient.latestLog;
              const risk = latestLog ? latestLog.risk : 'LOW';
              
              return (
                <motion.div
                  key={patient._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                  className="glass-panel rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg border border-brand-100 dark:border-slate-700">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{patient.name}</h3>
                        <p className="text-xs text-slate-500">ID: {patient._id.substring(18)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getRiskColor(risk)}`}>
                      {risk}
                    </span>
                  </div>
                  
                  {latestLog ? (
                    <div className="space-y-3">
                      <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 text-sm border border-slate-100 dark:border-slate-700/50">
                        <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">AI Summary:</p>
                        <p className="text-slate-800 dark:text-slate-200 line-clamp-2">{latestLog.summary}</p>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Confidence: {latestLog.confidence}%</span>
                        <span>{new Date(latestLog.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 text-sm border border-slate-100 dark:border-slate-700/50 text-slate-500 italic">
                      No logs available yet.
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end text-brand-600 dark:text-brand-400 group-hover:text-brand-700 transition font-medium text-sm items-center gap-1">
                    View Details <ChevronRight size={16} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
