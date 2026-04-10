import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ChromaGrid = ({
  items,
  className = '',
  radius = 500, // increased radius since it's a large card
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out'
}) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false); // To pause slider on hover

  const data = items?.length ? items : [];

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % data.length);
  }, [data.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + data.length) % data.length);
  }, [data.length]);

  // Slideshow interval (pauses when hovered so user can read)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(handleNext, 3000);
    return () => clearInterval(timer);
  }, [handleNext, isHovered]);

  // Spotlight GSAP effect setup
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = (e) => {
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    setIsHovered(false);
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true
    });
  };

  const handleEnter = () => {
    setIsHovered(true);
  };

  const handleCardMove = (e) => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  if (!data.length) return null;

  const currentItem = data[currentIndex];

  return (
    <div className="flex flex-col items-center w-full">
      <div
        ref={rootRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onPointerEnter={handleEnter}
        className={`relative w-full max-w-5xl h-[450px] flex justify-center items-center overflow-hidden rounded-3xl shadow-xl border border-slate-100 ${className}`}
        style={{
          '--r': `${radius}px`,
          '--x': '50%',
          '--y': '50%',
          background: currentItem.gradient || 'transparent'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.article
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            onMouseMove={handleCardMove}
            className="group absolute inset-0 flex flex-col md:flex-row w-full h-full cursor-pointer overflow-hidden transition-colors duration-300"
            style={{
              '--spotlight-color': 'rgba(255,255,255,0.2)'
            }}
          >
            {/* Spotlight Core Effect over Card */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100 mix-blend-overlay"
              style={{
                background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
              }}
            />
            
            {/* Image side */}
            <div className="w-full md:w-1/2 h-full relative z-10 flex-shrink-0">
               <img 
                 src={currentItem.image} 
                 alt={currentItem.title} 
                 loading="lazy" 
                 className="w-full h-full object-cover rounded-l-3xl shadow-lg" 
                 onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = '#e2e8f0';
                    e.target.parentElement.style.display = 'flex';
                    e.target.parentElement.style.alignItems = 'center';
                    e.target.parentElement.style.justifyContent = 'center';
                    e.target.parentElement.innerHTML = `<span style="color:#64748b;font-size:1.25rem;font-weight:600">Image Placeholder</span>`;
                  }}
               />
               {/* Fade gradient from image to text side */}
               <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Text side */}
            <div className="flex-1 relative z-10 p-12 flex flex-col justify-center text-white bg-black/5 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
               <h3 className="m-0 text-3xl md:text-4xl font-bold mb-6 drop-shadow-md">{currentItem.title}</h3>
               <p className="m-0 text-lg opacity-90 leading-relaxed font-light drop-shadow-sm">{currentItem.subtitle}</p>
            </div>
          </motion.article>
        </AnimatePresence>
        
        {/* Chroma Grayscale Overlay layers required by snippet */}
        <div
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            backdropFilter: 'grayscale(1) brightness(0.78)',
            WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
            background: 'rgba(0,0,0,0.001)',
            maskImage:
              'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)',
            WebkitMaskImage:
              'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)'
          }}
        />
        <div
          ref={fadeRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
          style={{
            backdropFilter: 'grayscale(1) brightness(0.78)',
            WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
            background: 'rgba(0,0,0,0.001)',
            maskImage:
              'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
            opacity: 1
          }}
        />
      </div>

      {/* Navigation Layer */}
      <div className="flex gap-6 mt-12 flex-row items-center justify-center relative z-50">
         <button 
           onClick={handlePrev} 
           className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-slate-200 text-slate-500 hover:bg-primary-navy hover:border-primary-navy hover:text-white transition-all duration-300 transform hover:scale-105"
         >
           <ChevronLeft size={24} />
         </button>
         
         <div className="flex gap-3 mx-2">
           {data.map((_, idx) => (
             <button 
               key={idx} 
               onClick={() => setCurrentIndex(idx)}
               className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-primary-navy scale-125' : 'bg-slate-300 hover:bg-slate-400'}`} 
               aria-label={`Go to slide ${idx + 1}`}
             />
           ))}
         </div>
         
         <button 
           onClick={handleNext} 
           className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-slate-200 text-slate-500 hover:bg-primary-navy hover:border-primary-navy hover:text-white transition-all duration-300 transform hover:scale-105"
         >
           <ChevronRight size={24} />
         </button>
      </div>
    </div>
  );
};

export default ChromaGrid;
