import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const INITIAL_VISIBLE = 3; // number of cards visible before "View More"

// Single portrait card with hover spotlight
function ActivityCard({ item, onClick, index }) {
  const handleCardMove = (e) => {
    const c = e.currentTarget;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1], delay: (index % 3) * 0.1 }}
      onMouseMove={handleCardMove}
      onClick={onClick}
      className="group relative w-full h-[420px] rounded-3xl overflow-hidden shadow-xl cursor-pointer"
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
        <p className="text-sm text-slate-200 leading-relaxed font-light line-clamp-3 drop-shadow-sm">
          {item.subtitle}
        </p>
      </div>
    </motion.article>
  );
}

const ChromaGrid = ({ items }) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const data = items?.length ? items : [];
  const visibleItems = showAll ? data : data.slice(0, INITIAL_VISIBLE);

  if (!data.length) return null;

  return (
    <>
      {/* Static Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <AnimatePresence>
          {visibleItems.map((item, index) => (
            <ActivityCard
              key={item.title + index}
              item={item}
              index={index}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* View More / Show Less Button */}
      {data.length > INITIAL_VISIBLE && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setShowAll(prev => !prev)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-primary-blue text-primary-blue font-semibold text-sm tracking-wide overflow-hidden transition-all duration-300 hover:text-white"
          >
            <span className="absolute inset-0 bg-primary-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            <span className="relative z-10">
              {showAll ? 'Show Less' : `View More (${data.length - INITIAL_VISIBLE} more)`}
            </span>
            <motion.span
              animate={{ rotate: showAll ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 text-lg leading-none"
            >
              ↓
            </motion.span>
          </button>
        </div>
      )}

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
