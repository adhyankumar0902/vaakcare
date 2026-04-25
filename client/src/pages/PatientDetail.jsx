import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/doctor/patients/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPatient(res.data.patient);
        setLogs(res.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, user.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!patient) return <div className="p-8 text-center">Patient not found</div>;

  // Chart data formatting
  const chartData = [...logs].reverse().map(log => {
    let riskVal = 1;
    if (log.risk === 'MEDIUM') riskVal = 2;
    if (log.risk === 'HIGH') riskVal = 3;
    
    return {
      date: new Date(log.createdAt).toLocaleDateString(),
      time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riskVal,
      risk: log.risk,
      confidence: log.confidence
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      <header className="glass-panel border-b border-slate-200 dark:border-slate-800/60 px-8 py-4 flex items-center gap-6 sticky top-0 z-10">
        <button onClick={() => navigate('/doctor/dashboard')} className="text-slate-400 hover:text-slate-800 transition">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xl">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">{patient.name}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Phone size={14} /> {patient.guardianPhoneNumber}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="text-brand-500" /> Interaction History
          </h2>
          
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="glass-panel rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                No logs recorded yet.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  {log.risk === 'HIGH' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
                  {log.risk === 'MEDIUM' && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>}
                  {log.risk === 'LOW' && <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>}
                  
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.risk === 'HIGH' ? 'bg-red-100 text-red-700' :
                      log.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {log.risk} RISK
                    </span>
                  </div>

                  <div className="pl-2 space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Patient Said</p>
                      <p className="text-slate-700 dark:text-slate-300 italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">"{log.transcript}"</p>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wider mb-2">AI Analysis</p>
                      <p className="text-slate-800 dark:text-slate-200 mb-3">{log.summary}</p>
                      
                      {log.issues.length > 0 && (
                        <div className="mb-2 flex gap-2 flex-wrap">
                          {log.issues.map((iss, i) => (
                            <span key={i} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-400">
                              {iss}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 border-t border-slate-200 dark:border-slate-700/50 pt-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Action:</span> {log.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Risk Trend</h3>
            {chartData.length > 1 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis 
                      domain={[0, 4]} 
                      ticks={[1, 2, 3]} 
                      tickFormatter={(val) => val === 1 ? 'LOW' : val === 2 ? 'MED' : 'HIGH'}
                      axisLine={false} 
                      tickLine={false}
                      tick={{fontSize: 12, fill: '#64748b'}}
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Line type="monotone" dataKey="riskVal" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-400 text-sm italic text-center">
                Not enough data to show trend graph.
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Patient Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Hospital</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{patient.hospitalName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Joined</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(patient.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500 dark:text-slate-400">Guardian Contact</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{patient.guardianPhoneNumber}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PatientDetail;
