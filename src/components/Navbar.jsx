import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home',       href: '#' },
  { label: 'About',      href: '#about' },
  { label: 'Services',   href: '#services' },
  { label: 'Activities', href: '#activities' },
  { label: 'Contact',    href: '#contact' },
];

export default function Navbar({ isVisible }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track scroll to switch from transparent to solid background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          key="navbar"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1], delay: 0.4 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled
              ? 'bg-primary-navy/95 backdrop-blur-md shadow-lg shadow-black/20'
              : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20">
            
            {/* Logo */}
            <a href="#" onClick={() => setMobileOpen(false)}>
              <img src="/logo.png" alt="CTS Logo" className="h-10 w-auto object-contain" />
            </a>

            {/* Desktop Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold tracking-wide text-white/80 hover:text-white transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 rounded-full" />
                </a>
              ))}
              <a
                href="#contact"
                className="ml-2 px-5 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-blue-500/30 hover:-translate-y-0.5 transform"
              >
                Get a Quote
              </a>
            </nav>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden bg-primary-navy/98 backdrop-blur-md border-t border-white/10"
              >
                <nav className="flex flex-col px-6 py-4 gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-base font-semibold text-white/80 hover:text-white py-2 border-b border-white/5 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 px-5 py-3 bg-primary-blue text-white text-sm font-bold rounded-lg text-center"
                  >
                    Get a Quote
                  </a>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
