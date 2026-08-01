import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle, RefreshCcw, Phone } from 'lucide-react';
import SeoHead from '../../components/SeoHead';

export default function ServerErrorPage({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
      <SeoHead 
        title="500: Server Error | CTS" 
        description="An unexpected error occurred."
        robots="noindex, follow"
      />
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#d85c18] opacity-5 rounded-full blur-[100px] pointer-events-none" />

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
          className="w-32 h-32 bg-[#d85c18]/10 border border-[#d85c18]/30 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(216,92,24,0.1)]"
        >
          <AlertTriangle size={64} className="text-[#d85c18]" />
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Unexpected Server Error
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl font-light mb-8 max-w-lg mx-auto">
          We encountered a critical issue while processing your request. Our technical team has been notified.
        </p>

        {error && (
          <div className="mb-12 bg-slate-900 border border-slate-800 p-4 rounded-xl text-left max-w-lg w-full overflow-hidden">
            <p className="text-xs font-mono text-slate-500 mb-1">Error details:</p>
            <p className="text-sm font-mono text-red-400 truncate">{error.message || "Unknown error"}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          {resetErrorBoundary && (
            <button 
              onClick={resetErrorBoundary}
              className="w-full sm:w-auto px-8 py-4 bg-[#d85c18] hover:bg-[#ba4d12] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 group shadow-[0_10px_20px_rgba(216,92,24,0.2)]"
            >
              <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </button>
          )}
          
          <Link 
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all group"
          >
            <Home size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            Return Home
          </Link>

          <a 
            href="mailto:support@concept-tools.com"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all group"
          >
            <Phone size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}
