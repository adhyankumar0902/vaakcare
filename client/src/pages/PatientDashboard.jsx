import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Languages, LogOut } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your VaakCare assistant. How are you feeling today? Please tell me about any symptoms, pain, or medications you've taken.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  const [medicationTaken, setMedicationTaken] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [step, setStep] = useState(0);
  const [conversationLog, setConversationLog] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || step >= 4) return;

    const userMessageText = input;
    const userMessage = { id: Date.now(), text: userMessageText, sender: 'patient' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    const updatedLog = conversationLog + "Patient: " + userMessageText + "\n";
    setConversationLog(updatedLog);

    if (step < 3) {
      setLoading(true);
      setTimeout(() => {
        let nextQuestion = "";
        if (step === 0) nextQuestion = isHindi ? "क्या आपने हाल ही में कोई नया लक्षण महसूस किया है?" : "Have you experienced any new symptoms recently?";
        if (step === 1) nextQuestion = isHindi ? "1 से 10 के पैमाने पर, आपका दर्द या बेचैनी कैसी है?" : "On a scale of 1-10, how is your pain/discomfort?";
        if (step === 2) nextQuestion = isHindi ? "क्या आपने अपनी नींद या भूख में कोई बदलाव देखा है?" : "Have you noticed any changes in your sleep or appetite?";
        
        setMessages(prev => [...prev, { id: Date.now() + 1, text: nextQuestion, sender: 'ai' }]);
        setStep(step + 1);
        setLoading(false);
      }, 1000);
    } else {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:3001/api/patient/analyze', { text: updatedLog, medicationTaken }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (res.data.risk === 'HIGH') {
          setAlertInfo(`🚨 HIGH RISK DETECTED! Emergency alert sent to guardian: ${user.guardianPhoneNumber || 'Unknown'}`);
        }

        setTimeout(() => {
          let aiResponse = isHindi 
            ? `धन्यवाद। मैंने आपके डॉक्टर को सूचित कर दिया है।\n\nविश्लेषण: ${res.data.summary}\n\nसुझाव: ${res.data.recommendation}` 
            : `Thank you. I have analyzed your responses and updated your doctor.\n\nAnalysis: ${res.data.summary}\n\nRecommendation: ${res.data.recommendation}`;
            
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: aiResponse,
            sender: 'ai'
          }]);
          setStep(4);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, there was an error processing your message.", sender: 'ai' }]);
        setLoading(false);
      }
    }
  };

  const toggleLanguage = () => {
    setIsHindi(!isHindi);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: !isHindi ? "अब हम हिंदी में बात कर सकते हैं।" : "We can now speak in English.",
      sender: 'ai'
    }]);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = isHindi ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="glass-panel border-b border-slate-200 dark:border-slate-800/60 px-6 py-4 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-lg">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-slate-100">{user?.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connected to {user?.hospitalName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Languages size={16} />
            {isHindi ? 'EN' : 'HI'}
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-90">
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl font-bold flex items-center gap-3 z-50"
          >
            {alertInfo}
            <button onClick={() => setAlertInfo(null)} className="ml-4 text-red-200 hover:text-white">✕</button>
          </motion.div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`${msg.sender === 'patient' ? 'chat-bubble-patient' : 'chat-bubble-ai'} whitespace-pre-wrap`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="chat-bubble-ai flex gap-1 items-center h-10">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="glass-panel border-t border-slate-200 dark:border-slate-800/60 p-4 z-10 relative">
        <div className="max-w-4xl mx-auto mb-3 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="medicationCheck"
            checked={medicationTaken} 
            onChange={(e) => setMedicationTaken(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
          />
          <label htmlFor="medicationCheck" className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {isHindi ? "मैंने आज अपनी दवा ले ली है" : "I have taken my medication today"}
          </label>
        </div>
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <button
            type="button"
            className={`absolute left-4 transition ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-brand-500'}`}
            onClick={startListening}
          >
            <Mic size={24} />
          </button>
          <input
            type="text"
            className="w-full bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 border border-transparent dark:border-slate-700 rounded-full pl-14 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition shadow-inner"
            placeholder={isHindi ? "अपना संदेश टाइप करें..." : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || step >= 4}
            className="absolute right-3 text-white bg-gradient-to-r from-brand-600 to-brand-500 p-2.5 rounded-full hover:from-brand-700 hover:to-brand-600 disabled:opacity-50 disabled:from-brand-500 disabled:to-brand-500 transition shadow-lg transform hover:-translate-y-0.5"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default PatientDashboard;
