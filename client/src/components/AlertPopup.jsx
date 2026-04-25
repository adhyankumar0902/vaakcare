import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Bell } from 'lucide-react';

const AlertPopup = () => {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'doctor') return;

    const socket = io('http://localhost:3001');
    socket.emit('join-doctor-room', user._id);

    socket.on('alert', (data) => {
      const newAlert = { id: Date.now(), type: 'critical', ...data };
      setAlerts((prev) => [...prev, newAlert]);
      
      // Auto dismiss after 10s
      setTimeout(() => {
        setAlerts((prev) => prev.filter(a => a.id !== newAlert.id));
      }, 10000);
    });

    socket.on('new-health-log', (data) => {
      const newNotif = { 
        id: Date.now(), 
        type: 'info', 
        message: `Patient ${data.patientName} submitted a new response.` 
      };
      setAlerts((prev) => [...prev, newNotif]);
      
      setTimeout(() => {
        setAlerts((prev) => prev.filter(a => a.id !== newNotif.id));
      }, 10000);
    });

    return () => socket.disconnect();
  }, [user]);

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 w-80 border backdrop-blur-md text-white ${
              alert.type === 'critical' ? 'bg-red-500 border-red-400' : 'bg-brand-600 border-brand-500'
            }`}
          >
            {alert.type === 'critical' ? (
              <AlertCircle className="w-6 h-6 animate-pulse" />
            ) : (
              <Bell className="w-6 h-6 animate-pulse" />
            )}
            <div className="flex-1">
              <h4 className="font-bold">{alert.type === 'critical' ? 'CRITICAL ALERT' : 'NEW RESPONSE'}</h4>
              <p className={`text-sm ${alert.type === 'critical' ? 'text-red-100' : 'text-brand-100'}`}>{alert.message}</p>
            </div>
            <button onClick={() => removeAlert(alert.id)} className="text-red-200 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertPopup;
