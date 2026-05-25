import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/login`, {
        username: credentials.username,
        password: credentials.password
      }, { withCredentials: true });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        toast.success('Welcome back, Admin');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-primary-text min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000&auto=format&fit=crop')] opacity-5 bg-cover bg-center mix-blend-screen" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-primary-text mb-2" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            FITZONE<span className="text-luxury-gold">.</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-text">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary-text">
              <User size={18} />
            </div>
            <input 
              type="text" 
              required
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full bg-transparent border-b border-black/20 pb-2 pl-8 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
              placeholder="Username"
            />
          </div>

          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary-text">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full bg-transparent border-b border-black/20 pb-2 pl-8 focus:outline-none focus:border-luxury-gold transition-colors text-sm font-mono tracking-widest"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-text text-white py-4 mt-8 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors group disabled:opacity-80"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>Access Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
