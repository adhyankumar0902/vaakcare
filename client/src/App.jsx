import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import useAuthStore from './store/useAuthStore';

import LandingPage from './pages/LandingPage';
import PatientAuth from './pages/PatientAuth';
import DoctorAuth from './pages/DoctorAuth';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDetail from './pages/PatientDetail';
import AlertPopup from './components/AlertPopup';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        {user && user.role === 'doctor' && <AlertPopup />}
        
        <button
          onClick={toggleTheme}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full glass-panel text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-transform hover:scale-110"
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/patient" element={<PatientAuth />} />
          <Route path="/auth/doctor" element={<DoctorAuth />} />
          
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/doctor/patient/:id" element={
            <ProtectedRoute allowedRole="doctor">
              <PatientDetail />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
