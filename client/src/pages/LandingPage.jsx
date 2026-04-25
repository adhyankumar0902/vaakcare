import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, User, Stethoscope, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-6 text-brand-600 dark:text-brand-500 drop-shadow-sm">
          <Activity size={56} strokeWidth={2.5} />
          <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">VaakCare</h1>
        </div>
        <p className="text-2xl font-medium text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Smart Healthcare, Anytime Anywhere
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl relative z-10">
        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          onClick={() => navigate('/auth/patient')}
          className="glass-panel rounded-[2rem] p-10 cursor-pointer flex flex-col items-center text-center group hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-brand-100 to-brand-50 dark:from-slate-800 dark:to-slate-700 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:from-brand-500 group-hover:to-brand-600 group-hover:text-white transition-all duration-300 rotate-3 group-hover:rotate-0">
            <User size={48} strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">Patient Portal</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">Log in to report symptoms and connect with your doctor.</p>
          <div className="mt-auto flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            Enter Portal <ArrowRight size={20} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          onClick={() => navigate('/auth/doctor')}
          className="glass-panel rounded-[2rem] p-10 cursor-pointer flex flex-col items-center text-center group hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-slate-800 dark:to-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 -rotate-3 group-hover:rotate-0">
            <Stethoscope size={48} strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">Doctor Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">Monitor patients, view AI summaries, and manage alerts.</p>
          <div className="mt-auto flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            Enter Dashboard <ArrowRight size={20} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
