import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCcw } from 'lucide-react';
import SeoHead from '../../components/SeoHead';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
      <SeoHead 
        title="No Internet Connection | CTS" 
        description="You are currently offline."
        robots="noindex, follow"
      />
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl mx-auto flex flex-col items-center"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="w-32 h-32 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center mb-8 shadow-xl"
        >
          <WifiOff size={50} className="text-slate-400" />
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          You are offline
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl font-light mb-12 max-w-lg mx-auto">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>

        <button 
          onClick={handleRetry}
          className="px-8 py-4 bg-[#2796a9] hover:bg-[#1f7a8a] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(39,150,169,0.3)] group"
        >
          <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          Retry Connection
        </button>
      </motion.div>
    </div>
  );
}
