import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Package, Phone } from 'lucide-react';
import SeoHead from '../../components/SeoHead';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
      <SeoHead 
        title="404: Page Not Found | CTS" 
        description="The page you're looking for cannot be found."
        robots="noindex, follow"
      />
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2796a9] opacity-5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="text-8xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-300 to-slate-600 leading-none drop-shadow-2xl mb-6"
        >
          404
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl font-light mb-12 max-w-lg mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back to where you need to be.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-[#2796a9] hover:bg-[#1f7a8a] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(39,150,169,0.3)] group"
          >
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            Return Home
          </Link>
          
          <Link 
            to="/shop"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all group"
          >
            <Package size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            Browse Products
          </Link>
          
          <a 
            href="mailto:sales@concept-tools.com"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all group"
          >
            <Phone size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            Contact CTS
          </a>
        </div>
      </motion.div>
    </div>
  );
}
