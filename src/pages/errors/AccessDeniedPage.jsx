import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ShieldAlert } from 'lucide-react';
import SeoHead from '../../components/SeoHead';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
      <SeoHead 
        title="403: Access Denied | CTS" 
        description="You do not have permission to view this page."
        robots="noindex, follow"
      />
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl mx-auto flex flex-col items-center"
      >
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="w-32 h-32 bg-red-950/50 border border-red-500/20 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(220,38,38,0.15)]"
        >
          <ShieldAlert size={64} className="text-red-500" />
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Access Denied
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl font-light mb-12 max-w-lg mx-auto">
          You don't have permission to access this area. If you believe this is an error, please contact your administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <Link 
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 group"
          >
            <Home size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
