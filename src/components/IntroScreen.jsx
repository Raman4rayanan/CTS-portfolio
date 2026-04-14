import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function IntroScreen({ onComplete }) {
  useEffect(() => {
    // Automatically transition to the hero section after 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    // Transition immediately if the user attempts to scroll
    const handleScroll = () => {
      onComplete();
    };

    window.addEventListener('wheel', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });

    // We don't listen to 'scroll' strictly because overflow is hidden at this point,
    // so 'wheel' or 'touchmove' are the best ways to detect a scroll intent.

    return () => {
      clearTimeout(timer);
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background-light overflow-hidden"
      initial={{ y: 0 }}
      exit={{
        y: '-100%',
        transition: {
          duration: 1.2,
          ease: [0.76, 0, 0.24, 1]
        }
      }}
    >
      <div
        className="relative cursor-pointer group flex flex-col items-center p-12"
        onClick={onComplete}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-blue-300 rounded-full blur-[100px] opacity-10 transition-opacity duration-700 group-hover:opacity-30 pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative flex flex-col items-center"
        >
          <motion.img
            src="/logo.png"
            alt="CTS Logo"
            className="w-96 md:w-[500px] h-auto drop-shadow-xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-8 text-sm md:text-base tracking-[0.3em] uppercase font-medium"
            style={{ color: '#065F71' }}   // ✅ Updated color here
          >
            Concept Tools and Services
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 text-slate-400 text-xs tracking-widest uppercase flex flex-col items-center opacity-70"
      >
        <span>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-2 text-lg"
        >
          ↓
        </motion.div>
      </motion.div>
    </motion.div>
  );
}