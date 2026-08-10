import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Mail } from 'lucide-react';
import SeoHead from '../../components/SeoHead';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
      <SeoHead 
        title="Site Under Maintenance | CTS" 
        description="We are currently undergoing scheduled maintenance. Please check back soon."
        robots="noindex, nofollow"
      />
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2796a9] opacity-5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl mx-auto flex flex-col items-center"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 bg-[#2796a9]/10 border border-[#2796a9]/30 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(39,150,169,0.15)]"
        >
          <Wrench size={56} className="text-[#2796a9]" />
        </motion.div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          We'll be back soon!
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl font-light mb-12 max-w-lg mx-auto leading-relaxed">
          Concept Tools and Service is currently undergoing scheduled maintenance to improve our platform. We expect to be back online shortly. Thank you for your patience!
        </p>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md">
          <h3 className="text-slate-200 font-bold mb-2 flex items-center justify-center gap-2">
            <Mail size={16} className="text-[#2796a9]" />
            Need immediate assistance?
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Our support team is still available during this downtime.
          </p>
          <a 
            href="mailto:support@concept-tools.com"
            className="block w-full py-3 bg-[#2796a9] hover:bg-[#1f7a8a] text-white rounded-xl font-bold transition-colors shadow-lg"
          >
            Email Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}
