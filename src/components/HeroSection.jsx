import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const images = [
  '/image1.png',
  '/image2.png',
  '/image3.png'
];

export default function HeroSection({ isVisible }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div
      className="sticky top-0 w-full h-screen overflow-hidden font-sans text-white"
      style={{ backgroundColor: '#016A8A' }}   // ✅ updated base background
    >
      {/* Background Slideshow */}
      {images.map((src, idx) => {
        const isActive = idx === currentIndex;
        return (
          <motion.div
            key={src}
            className="absolute inset-0 z-0 bg-cover bg-center origin-center"
            style={{ backgroundImage: `url(${src})`, filter: 'blur(3px)' }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1.1 : 1.05,
            }}
            transition={{
              opacity: { duration: 1.5, ease: 'easeInOut' },
              scale: { duration: 6, ease: 'linear' },
            }}
          />
        );
      })}

      {/* Updated Overlay */}
      <div
        className="absolute inset-0 z-10 mix-blend-multiply"
        style={{ backgroundColor: '#016A8A', opacity: 0.6 }}   // ✅ replaced navy overlay
      />

      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to right, rgba(18, 41, 44, 1), rgba(0, 0, 0, 0.5), transparent)'
        }}   // ✅ updated gradient
      />

      {/* Hero Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-20 lg:px-32">
        <div className="max-w-4xl">
          {isVisible && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.2, delayChildren: 0.6 }
                }
              }}
            >
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.33, 1, 0.68, 1] } }
                }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              >
                Your Partner in <br />
                <span style={{ color: '#198e9d' }}>Industrial</span> Productivity
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.33, 1, 0.68, 1] } }
                }}
                className="text-base md:text-lg lg:text-xl text-slate-300 font-light max-w-2xl mb-12 leading-relaxed"
              >
                Reliable industrial tools, MRO solutions, safety equipment, and technical support tailored for modern industries.
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                }}
                className="flex flex-col sm:flex-row gap-5"
              >
                <button className="px-8 py-4 bg-primary-blue hover:bg-blue-600 text-white font-semibold tracking-wide rounded border border-transparent shadow-[0_0_20px_rgba(15,76,129,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0, 0, 0, 1)]">
                  Explore Services
                </button>
                <button className="px-8 py-4 bg-transparent border border-white/40 hover:border-white hover:bg-white/5 text-white font-semibold tracking-wide rounded transition-all duration-300 transform hover:-translate-y-1">
                  Contact Us
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}