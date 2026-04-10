import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Single portrait card with its own hover spotlight
function ActivityCard({ item, onClick }) {
  const handleCardMove = (e) => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      onMouseMove={handleCardMove}
      onClick={onClick}
      className="group relative w-full h-[480px] rounded-3xl overflow-hidden shadow-xl cursor-pointer flex-1"
      style={{ '--spotlight-color': 'rgba(255,255,255,0.25)' }}
    >
      {/* Spotlight effect on hover */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100 mix-blend-overlay"
        style={{
          background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
        }}
      />

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/95 via-primary-navy/40 to-transparent pointer-events-none" />
      </div>

      {/* Text Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end p-7 text-white">
        <h3 className="text-2xl font-bold mb-2 drop-shadow-md">{item.title}</h3>
        <p className="text-sm text-slate-200 leading-relaxed font-light line-clamp-3 mb-4 drop-shadow-sm">
          {item.subtitle}
        </p>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-300 flex items-center gap-2 group-hover:text-blue-100 transition-colors">
          View Details <ChevronRight size={14} />
        </span>
      </div>
    </motion.article>
  );
}

const ChromaGrid = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const data = items?.length ? items : [];

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % data.length);
  }, [data.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + data.length) % data.length);
  }, [data.length]);

  // Auto-advance (pause on hover or when modal open)
  useEffect(() => {
    if (isHovered || selectedItem) return;
    const timer = setInterval(handleNext, 4500);
    return () => clearInterval(timer);
  }, [handleNext, isHovered, selectedItem]);

  if (!data.length) return null;

  // Show 2 cards — current and the one after it (wraps around)
  const firstItem = data[currentIndex];
  const secondItem = data[(currentIndex + 1) % data.length];

  return (
    <>
      <div
        className="flex flex-col items-center w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-row items-center justify-center w-full max-w-5xl gap-4 md:gap-8">

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="hidden md:flex flex-shrink-0 w-14 h-14 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-md hover:bg-primary-navy hover:border-primary-navy hover:text-white transition-all duration-300 transform hover:-translate-x-1"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Two Cards Side by Side */}
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <AnimatePresence mode="wait">
              <ActivityCard
                key={`card-a-${currentIndex}`}
                item={firstItem}
                onClick={() => setSelectedItem(firstItem)}
              />
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <ActivityCard
                key={`card-b-${(currentIndex + 1) % data.length}`}
                item={secondItem}
                onClick={() => setSelectedItem(secondItem)}
              />
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="hidden md:flex flex-shrink-0 w-14 h-14 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-md hover:bg-primary-navy hover:border-primary-navy hover:text-white transition-all duration-300 transform hover:translate-x-1"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Mobile Arrows */}
        <div className="flex md:hidden gap-6 mt-8">
          <button onClick={handlePrev} className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-100">
            <ChevronLeft size={24} />
          </button>
          <button onClick={handleNext} className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-100">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-navy/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="w-full h-64 sm:h-72 relative">
                <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              </div>

              <div className="p-8 md:p-10 flex flex-col items-start text-left">
                <h2 className="text-3xl font-extrabold text-primary-navy mb-4">{selectedItem.title}</h2>
                <p className="text-slate-600 text-lg leading-relaxed">{selectedItem.subtitle}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChromaGrid;
