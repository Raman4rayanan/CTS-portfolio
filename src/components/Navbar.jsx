import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, User, Eye, EyeOff, LogOut, Mail, Lock, Search, History, ShoppingCart, CheckCircle } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Activities', href: '#activities' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ isVisible, isShop, searchQuery, setSearchQuery, onOpenCart, cartCount, currentEcommView, onNavigateEcomm, products = [] }) {
  const isShopPage = isShop || window.location.pathname === '/shop';
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqSearchQuery, setRfqSearchQuery] = useState('');
  const [rfqSearchResult, setRfqSearchResult] = useState(null);
  const [rfqSearchError, setRfqSearchError] = useState('');
  const [localQuotes, setLocalQuotes] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cts_quotes') || '[]');
      setLocalQuotes(saved);

      const syncStatus = async () => {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const updated = await Promise.all(saved.map(async (q) => {
          try {
            const res = await fetch(`${apiBaseUrl}/api/ecomm/orders/track/${q.referenceId}`);
            const data = await res.json();
            if (data.success) {
              return data.data;
            }
          } catch (e) { }
          return q;
        }));
        setLocalQuotes(updated);
        localStorage.setItem('cts_quotes', JSON.stringify(updated));
      };

      if (saved.length > 0) {
        syncStatus();
      }
    } catch (err) {
      console.error(err);
    }
  }, [isRfqModalOpen]);

  const handleRfqSearch = async (e) => {
    e.preventDefault();
    setRfqSearchError('');
    setRfqSearchResult(null);
    if (!rfqSearchQuery.trim()) return;

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBaseUrl}/api/ecomm/orders/track/${rfqSearchQuery.trim()}`);
      const data = await res.json();
      if (data.success) {
        setRfqSearchResult(data.data);
      } else {
        setRfqSearchError(data.error || 'RFQ Reference ID not found. Verify formatting (e.g., CTS-2026-XXXX).');
      }
    } catch (err) {
      console.error(err);
      try {
        const savedQuotes = JSON.parse(localStorage.getItem('cts_quotes') || '[]');
        const found = savedQuotes.find(q => q.referenceId.toLowerCase() === rfqSearchQuery.trim().toLowerCase());
        if (found) {
          setRfqSearchResult(found);
        } else {
          setRfqSearchError('RFQ Reference ID not found. Verify formatting (e.g., CTS-2026-XXXX).');
        }
      } catch (localErr) {
        setRfqSearchError('Connection failure. Could not reach server.');
      }
    }
  };

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cts_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Track scroll to switch from transparent to solid background and auto-hide
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 60);

      if (isShopPage && currentEcommView === 'products') {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setNavHidden(true);
        } else {
          setNavHidden(false);
        }
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isShopPage, currentEcommView]);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset mobile states when drawer closes
  useEffect(() => {
    if (!mobileOpen) {
      setMobileProfileOpen(false);
    }
  }, [mobileOpen]);

  const handleLogin = async (email, password) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      let response = await fetch(`${apiBaseUrl}/api/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      let data = await response.json();
      let customerError = data.error;

      // If customer login fails, try admin login
      if (!data.success) {
        const adminResponse = await fetch(`${apiBaseUrl}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const adminData = await adminResponse.json();
        if (adminData.success) {
          data = adminData;
        }
      }

      if (data.success) {
        localStorage.setItem('cts_user', JSON.stringify(data.user));
        localStorage.setItem('cts_token', data.token);
        setUser(data.user);
        showToast('Successfully signed in!');
        window.location.reload();
        return { success: true };
      } else {
        return { success: false, error: customerError || 'Invalid credentials' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Connection error. Is the server running?' };
    }
  };

  const handleLogout = async () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const token = localStorage.getItem('cts_token');
      const userStr = localStorage.getItem('cts_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      if (token) {
        const endpoint = (currentUser && currentUser.role) ? '/api/admin/logout' : '/api/customer/logout';
        await fetch(`${apiBaseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Logout API error:', err);
    }
    localStorage.removeItem('cts_user');
    localStorage.removeItem('cts_token');
    setUser(null);
    showToast('Successfully signed out!');
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.header
            key="navbar"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: navHidden ? -100 : 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1], delay: 0.4 }}
            className={`navbar ${isShopPage ? 'shop-navbar' : ''} fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isShopPage
              ? 'bg-transparent'
              : (scrolled
                ? 'bg-gradient-to-r from-[rgb(3,5,42)] via-[rgb(2,58,81)] to-[rgb(12,91,106)] backdrop-blur-md shadow-lg shadow-black/20'
                : 'bg-transparent')
              }`}
          >
            <div className="w-full px-4 md:px-8 lg:px-12 flex items-center justify-between md:grid md:grid-cols-3 md:items-center h-24">

              {/* Left: Logo */}
              <div className={`flex justify-start items-center ${(isShopPage && currentEcommView === 'products') ? 'invisible' : ''}`}>
                <Link to="/" onClick={() => setMobileOpen(false)} className="py-2 shrink-0 -translate-x-2 md:-translate-x-4 lg:-translate-x-16 xl:-translate-x-20">
                  <img src="/admin/logo.png" alt="CTS Logo" className="h-20 md:h-20 lg:h-24 w-auto object-contain origin-left object-left" />
                </Link>
              </div>

              {/* Center: Search Bar (Shop Only, Centered) */}
              <div className="flex justify-center items-center w-full">
                {isShopPage && (
                  <div className="w-full max-w-xl relative hidden md:block group">
                    <span className="absolute left-4 top-3.5 text-white/40"><Search size={18} /></span>
                    <input
                      type="text"
                      placeholder="Search for tools, brands, or product categories..."
                      value={searchQuery || ''}
                      onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-[#2796a9] focus:bg-white/10 focus:shadow-[0_0_15px_rgba(39,150,169,0.2)] text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/40 placeholder:font-bold text-white shadow-inner"
                    />

                    {/* Autocomplete Dropdown */}
                    {searchQuery && products.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100] flex flex-col hidden group-focus-within:flex hover:flex">
                        {products
                          .filter(p =>
                            (p.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.product_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .slice(0, 5)
                          .map((p, idx) => (
                            <div
                              key={p.product_id || p._id || idx}
                              onMouseDown={() => {
                                if (setSearchQuery) {
                                  setSearchQuery(p.product_name);
                                  // Optional: if you want to navigate immediately to products view
                                  if (onNavigateEcomm && currentEcommView !== 'products') {
                                    onNavigateEcomm('products');
                                  }
                                }
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 transition-colors"
                            >
                              <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.product_name} className="w-10 h-10 object-contain bg-white rounded p-1 flex-shrink-0" />
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-semibold text-white truncate">{p.product_name}</span>
                                <span className="text-[10px] text-[#2796a9] font-bold uppercase tracking-wider mt-0.5">{p.brand}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Actions / Desktop Links */}
              <div className="flex justify-end items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                  {!isShopPage ? (
                    /* Standard Landing Page links */
                    <div className="flex items-center gap-8 mr-2">
                      {navLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          className="text-base font-semibold tracking-[0.3px] normal-case antialiased text-white/80 hover:text-white transition-colors duration-200 relative group"
                        >
                          {link.label}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 rounded-full" />
                        </a>
                      ))}
                      <Link
                        to="/shop"
                        className="cta-button px-5 py-2.5 bg-[#04667b] hover:bg-[#2796a9] text-white text-sm font-semibold tracking-[0.3px] normal-case antialiased rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(6,53,67,0.4)] hover:shadow-[0_0_20px_rgba(6,53,67,0.8)] hover:-translate-y-0.5 transform whitespace-nowrap shrink-0"
                      >
                        Shop Now
                      </Link>
                    </div>
                  ) : (
                    /* E-commerce MRO Navbar Actions */
                    <div className="flex items-center gap-6">
                      {/* B2B Navigation Links */}
                      <div className="hidden lg:flex items-center gap-8 mr-4">
                        <button
                          onClick={() => onNavigateEcomm ? onNavigateEcomm('home') : null}
                          className={`text-base font-semibold tracking-[0.3px] normal-case antialiased transition-colors duration-200 relative group ${currentEcommView === 'home' ? 'text-[#2796a9] font-bold' : 'text-white/80 hover:text-white'}`}
                        >
                          HOME
                          <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#2796a9] transition-all duration-300 rounded-full ${currentEcommView === 'home' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                        </button>
                        <button
                          onClick={() => onNavigateEcomm ? onNavigateEcomm('products') : null}
                          className={`text-base font-semibold tracking-[0.3px] normal-case antialiased transition-colors duration-200 relative group ${currentEcommView === 'products' ? 'text-[#2796a9] font-bold' : 'text-white/80 hover:text-white'}`}
                        >
                          PRODUCTS
                          <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#2796a9] transition-all duration-300 rounded-full ${currentEcommView === 'products' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                        </button>
                      </div>

                      <button
                        onClick={onOpenCart}
                        className="cta-button px-5 py-2.5 bg-[#04667b] hover:bg-[#2796a9] text-white text-sm font-semibold tracking-[0.3px] normal-case antialiased rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(6,53,67,0.4)] hover:shadow-[0_0_20px_rgba(6,53,67,0.8)] hover:-translate-y-0.5 transform flex items-center gap-2 shrink-0"
                      >
                        <ShoppingCart size={16} />
                        Cart
                        {cartCount > 0 && (
                          <span className="bg-[#2796a9] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white/20">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Profile button (Common) */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      aria-label="Profile"
                      onClick={() => setProfileOpen(prev => !prev)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${profileOpen
                        ? 'bg-[#2796a9]/20 text-[#2796a9] border-[#2796a9] shadow-[0_0_15px_rgba(39,150,169,0.5)]'
                        : 'bg-white/10 text-white border-white/20 hover:bg-[#2796a9]/20 hover:border-[#2796a9] shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(39,150,169,0.3)]'
                        }`}
                    >
                      <User size={18} />
                    </button>
                    <AnimatePresence>
                      {profileOpen && (
                        <div className="absolute right-0 top-14 z-50">
                          <ProfilePopup
                            user={user}
                            onClose={() => setProfileOpen(false)}
                            onLogin={handleLogin}
                            onLogout={handleLogout}
                            setUser={setUser}
                            showToast={showToast}
                          />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
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
                  {isShopPage ? (
                    <nav className="flex flex-col px-6 py-6 gap-4">
                      {/* Mobile Search Input */}
                      <div className="relative w-full mb-2">
                        <span className="absolute left-4 top-3.5 text-white/40"><Search size={18} /></span>
                        <input
                          type="text"
                          placeholder="Search for tools, brands, or product categories..."
                          value={searchQuery || ''}
                          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-[#2796a9] focus:bg-white/10 focus:shadow-[0_0_15px_rgba(39,150,169,0.2)] text-sm font-bold outline-none transition-all duration-300 placeholder:text-white/40 placeholder:font-bold text-white shadow-inner"
                        />
                      </div>
                      <div className="flex flex-col gap-3 mt-2">
                        <button
                          onClick={() => {
                            onNavigateEcomm && onNavigateEcomm('home');
                            setMobileOpen(false);
                          }}
                          className={`text-left text-base font-semibold py-2 border-b border-white/5 transition-colors ${currentEcommView === 'home' ? 'text-[#2796a9]' : 'text-white/80'}`}
                        >
                          Home
                        </button>
                        <button
                          onClick={() => {
                            onNavigateEcomm && onNavigateEcomm('products');
                            setMobileOpen(false);
                          }}
                          className={`text-left text-base font-semibold py-2 border-b border-white/5 transition-colors ${currentEcommView === 'products' ? 'text-[#2796a9]' : 'text-white/80'}`}
                        >
                          Products
                        </button>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => {
                              setMobileOpen(false);
                              onOpenCart && onOpenCart();
                            }}
                            className="cta-button flex-1 px-5 py-3 bg-[#063543] hover:bg-[#052b36] text-white text-sm font-semibold tracking-[0.3px] rounded-lg text-center transition-all duration-300 shadow-[0_0_10px_rgba(6,53,67,0.4)] flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={16} />
                            Cart
                            {cartCount > 0 && (
                              <span className="bg-[#2796a9] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {cartCount}
                              </span>
                            )}
                          </button>
                          <button
                            aria-label="Profile"
                            onClick={() => setMobileProfileOpen(prev => !prev)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-95 cursor-pointer ${mobileProfileOpen
                              ? 'bg-[#2796a9]/20 text-[#2796a9] border-[#2796a9]'
                              : 'bg-white/10 text-white border-white/20'
                              }`}
                          >
                            <User size={20} />
                          </button>
                        </div>

                        <AnimatePresence>
                          {mobileProfileOpen && (
                            <div className="w-full flex justify-center mt-2 pb-4">
                              <ProfilePopup
                                user={user}
                                onClose={() => setMobileProfileOpen(false)}
                                onLogin={handleLogin}
                                onLogout={handleLogout}
                                setUser={setUser}
                                showToast={showToast}
                              />
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </nav>
                  ) : (
                    <nav className="flex flex-col px-6 py-4 gap-4">
                      {navLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-base font-medium tracking-[0.3px] normal-case antialiased text-white/80 hover:text-white py-2 border-b border-white/5 transition-colors"
                        >
                          {link.label}
                        </a>
                      ))}
                      <div className="flex flex-col gap-3 mt-2">
                        <div className="flex items-center gap-3">
                          <Link
                            to="/shop"
                            onClick={() => setMobileOpen(false)}
                            className="cta-button flex-1 px-5 py-3 bg-[#063543] hover:bg-[#052b36] text-white text-sm font-semibold tracking-[0.3px] normal-case antialiased rounded-lg text-center transition-all duration-300 shadow-[0_0_10px_rgba(6,53,67,0.4)]"
                          >
                            Shop Now
                          </Link>
                          <button
                            aria-label="Profile"
                            onClick={() => setMobileProfileOpen(prev => !prev)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-95 cursor-pointer ${mobileProfileOpen
                              ? 'bg-[#2796a9]/20 text-[#2796a9] border-[#2796a9]'
                              : 'bg-white/10 text-white border-white/20'
                              }`}
                          >
                            <User size={20} />
                          </button>
                        </div>

                        <AnimatePresence>
                          {mobileProfileOpen && (
                            <div className="w-full flex justify-center mt-2 pb-4">
                              <ProfilePopup
                                user={user}
                                onClose={() => setMobileProfileOpen(false)}
                                onLogin={handleLogin}
                                onLogout={handleLogout}
                                setUser={setUser}
                                showToast={showToast}
                              />
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </nav>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>

      {/* RFQ TRACKING MODAL */}
      <AnimatePresence>
        {isRfqModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsRfqModalOpen(false);
                setRfqSearchResult(null);
                setRfqSearchError('');
                setRfqSearchQuery('');
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden z-10 shadow-2xl p-6 md:p-8 text-left"
            >
              <button
                onClick={() => {
                  setIsRfqModalOpen(false);
                  setRfqSearchResult(null);
                  setRfqSearchError('');
                  setRfqSearchQuery('');
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <History className="text-[#2796a9]" size={22} />
                Quotation History
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-light">
                View your recent quote requests, submitted MRO items, and processing status.
              </p>

              <form onSubmit={handleRfqSearch} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Search by Quote Reference ID (e.g. CTS-2026-1234)"
                  value={rfqSearchQuery}
                  onChange={(e) => setRfqSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2796a9] text-white transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] text-white text-sm font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Search
                </button>
              </form>

              {rfqSearchError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-6">
                  {rfqSearchError}
                </div>
              )}

              {rfqSearchResult ? (
                <div className="border border-slate-800 rounded-2xl bg-slate-950/40 p-5 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => setRfqSearchResult(null)}
                    className="text-xs text-[#2796a9] hover:underline self-start flex items-center gap-1 cursor-pointer font-semibold bg-transparent border-none outline-none"
                  >
                    ← Back to History List
                  </button>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Reference ID</span>
                      <span className="text-sm font-bold text-white font-mono">{rfqSearchResult.referenceId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold text-right">Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2796a9]/10 text-[#2796a9] border border-[#2796a9]/20">
                        {rfqSearchResult.status || 'Pending Review'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Date & Time:</span>
                      <span className="text-slate-300 font-semibold">
                        {new Date(rfqSearchResult.date).toLocaleDateString()} {new Date(rfqSearchResult.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Requestor / Company:</span>
                      <span className="text-slate-300 font-semibold truncate block text-slate-200" title={`${rfqSearchResult.customerDetails?.name} / ${rfqSearchResult.customerDetails?.company}`}>
                        {rfqSearchResult.customerDetails?.name} / {rfqSearchResult.customerDetails?.company}
                      </span>
                    </div>
                  </div>                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold mb-2">Requested Items ({rfqSearchResult.items?.length || 0})</span>
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-850/60 pr-1 text-xs flex flex-col mb-4">
                      {rfqSearchResult.items?.map((item, idx) => {
                        const hasPrice = item.unitPrice && item.unitPrice > 0;
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 text-slate-300 border-b border-slate-850/40 last:border-0">
                            <div className="flex flex-col gap-0.5 text-left">
                              <span className="font-semibold text-slate-200">{item.product_name}</span>
                              <span className="text-[10px] text-slate-505 font-medium tracking-wide">
                                Brand: {item.brand} | Model: {item.model} | SKU: {item.sku}
                              </span>
                              {hasPrice && (
                                <span className="text-[11px] text-slate-400 mt-0.5">
                                  Price: <span className="text-[#2796a9] font-medium font-mono">${item.unitPrice.toFixed(2)}</span> per unit
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 self-start sm:self-center mt-1 sm:mt-0">
                              <span className="font-semibold text-white/50 text-[10px]">
                                Qty: {item.quantity}
                              </span>
                              {hasPrice && (
                                <span className="font-bold text-white text-xs bg-slate-950 border border-slate-850 px-2 py-1 rounded font-mono">
                                  ${(item.quantity * item.unitPrice).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cost Summary Breakdown */}
                  {rfqSearchResult.items?.some(item => item.unitPrice > 0) ? (
                    <div className="border-t border-slate-800 pt-3 flex flex-col gap-1.5 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className="font-mono text-white">
                          ${rfqSearchResult.items.reduce((acc, item) => acc + (item.quantity * (item.unitPrice || 0)), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping & Handling:</span>
                        <span className="font-mono text-white">${(rfqSearchResult.shippingCost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Tax / GST ({rfqSearchResult.taxRate || 0}%):</span>
                        <span className="font-mono text-white">
                          ${(rfqSearchResult.items.reduce((acc, item) => acc + (item.quantity * (item.unitPrice || 0)), 0) * (rfqSearchResult.taxRate || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm text-[#2796a9]">
                        <span>Grand Total:</span>
                        <span className="font-mono text-white">
                          ${(
                            rfqSearchResult.items.reduce((acc, item) => acc + (item.quantity * (item.unitPrice || 0)), 0) * (1 + (rfqSearchResult.taxRate || 0) / 100) +
                            (rfqSearchResult.shippingCost || 0)
                          ).toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-2 p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] leading-relaxed">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">Payment Terms</span>
                          <span className="text-slate-300 font-semibold">{rfqSearchResult.paymentTerms || 'Net 30'}</span>
                        </div>
                        {rfqSearchResult.validUntil && (
                          <div>
                            <span className="text-slate-505 block text-[9px] uppercase font-semibold">Quote Valid Until</span>
                            <span className="text-slate-300 font-semibold">{new Date(rfqSearchResult.validUntil).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {rfqSearchResult.adminComments && (
                        <div className="mt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[11px] text-slate-300 leading-relaxed text-left">
                          <span className="text-[#2796a9] font-bold block mb-1">Procurement Officer Note:</span>
                          {rfqSearchResult.adminComments}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-[11px] text-slate-400 text-center leading-relaxed">
                      💡 Pricing worksheets are currently being prepared by the procurement desk. Once approved, details will display here in real-time.
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-bold text-[#2796a9] uppercase tracking-wider mb-3">Your Quotation History</h4>
                  {localQuotes.length > 0 ? (
                    <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950/20 divide-y divide-slate-850">
                      {localQuotes.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => setRfqSearchResult(q)}
                          className="w-full text-left p-3.5 hover:bg-slate-950/50 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div>
                            <span className="text-xs font-bold text-white font-mono group-hover:text-[#2796a9] transition-colors">{q.referenceId}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-light">
                              {new Date(q.date).toLocaleDateString()} {new Date(q.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {q.items?.length || 0} item(s)
                            </span>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                            {q.status || 'Pending'}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500 bg-slate-950/10">
                      No quotes found on this browser. Submit a quote request on the checkout screen to start tracking.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-10 right-10 bg-[#2796a9] text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-semibold"
          >
            <CheckCircle size={24} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProfilePopup({ user, onClose, onLogout, onLogin, setUser, showToast }) {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot-password', 'reset-password'
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  useEffect(() => {
    let timeout;
    if (error) timeout = setTimeout(() => setError(''), 2000);
    return () => clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    let timeout;
    if (otpSuccessMsg) timeout = setTimeout(() => setOtpSuccessMsg(''), 2000);
    return () => clearTimeout(timeout);
  }, [otpSuccessMsg]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpSuccessMsg('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/customer/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username: signupUsername || email.split('@')[0]
        })
      });
      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setOtpSuccessMsg('Verification code sent to your email!');
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!enteredOtp) {
      setError('Please enter the verification code.');
      setLoading(false);
      return;
    }

    // Complete sign up and log in against real backend
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: signupUsername || email.split('@')[0],
          companyName: signupCompany,
          phone: signupPhone,
          otp: enteredOtp
        })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('cts_user', JSON.stringify(data.user));
        localStorage.setItem('cts_token', data.token);
        if (setUser) setUser(data.user);
        if (showToast) showToast('Successfully signed up and logged in!');
        onClose();
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const res = await onLogin(email, password);
    setLoading(false);
    if (res && !res.success) {
      setError(res.error);
      if (res.error === 'Incorrect password.') {
        setLoginAttempts(prev => prev + 1);
      } else {
        setLoginAttempts(0);
      }
    } else {
      setLoginAttempts(0);
      onClose();
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpSuccessMsg('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/customer/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setAuthMode('reset-password');
        setOtpSent(true);
        setOtpSuccessMsg('Password reset code sent to your email!');
      } else {
        setError(data.error || 'Failed to send reset OTP.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!enteredOtp) {
      setError('Please enter the verification code.');
      return;
    }
    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/customer/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: enteredOtp, newPassword: password })
      });
      const data = await response.json();
      if (data.success) {
        setOtpSuccessMsg('Password reset successfully! You can now log in.');
        setAuthMode('login');
        setPassword('');
        setLoginAttempts(0);
      } else {
        setError(data.error || 'Password reset failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    companyName: user?.companyName || '',
    phone: user?.phone || ''
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem('cts_user', JSON.stringify(updatedUser));
    if (setUser) setUser(updatedUser);
    setIsEditingProfile(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-[rgba(4,12,25,0.96)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-80 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_30px_rgba(39,150,169,0.1)] text-white flex flex-col gap-4 text-left"
    >
      {user ? (
        <div className="flex flex-col gap-4 text-center">
          {isEditingProfile ? (
            <form onSubmit={handleProfileSave} className="flex flex-col gap-3 text-left">
              <h4 className="text-sm font-bold text-[#2796a9] border-b border-white/10 pb-2 mb-1">Edit Profile</h4>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60">Username</label>
                <input type="text" value={profileData.username} onChange={e => setProfileData({ ...profileData, username: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-[#2796a9] outline-none" required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60">Company Name</label>
                <input type="text" value={profileData.companyName} onChange={e => setProfileData({ ...profileData, companyName: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-[#2796a9] outline-none" placeholder="e.g., Acme Corp" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60">Phone Number</label>
                <input type="tel" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-[#2796a9] outline-none" placeholder="+1 234 567 8900" />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-2 border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-[#04667b] hover:bg-[#2796a9] text-white text-xs font-semibold rounded-lg transition-all shadow-md cursor-pointer">Save</button>
              </div>
            </form>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#04667b] to-[#2796a9] flex items-center justify-center text-xl font-bold border border-white/20 shadow-md mx-auto">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-white">{user.username || 'User'}</span>
                <span className="text-sm text-white/60 font-light">{user.email}</span>
                {user.companyName && <span className="text-xs text-white/80 mt-1">{user.companyName}</span>}
                {user.phone && <span className="text-xs text-white/50">{user.phone}</span>}
                <span className="text-xs text-[#2796a9] font-medium mt-2 bg-[#2796a9]/10 px-2 py-0.5 rounded-full self-center">
                  {user.role} Account
                </span>
              </div>

              <button onClick={() => setIsEditingProfile(true)} className="text-xs text-[#2796a9] hover:text-white underline mt-1 cursor-pointer">Edit Profile</button>

              <div className="h-[1px] w-full bg-white/10 my-1" />

              {user.role === 'Admin' && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 text-white rounded-xl transition-all duration-300 font-semibold text-sm cursor-pointer shadow-md"
                >
                  Admin Panel
                </Link>
              )}

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl transition-all duration-300 font-medium text-sm cursor-pointer"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Sign In / Sign Up switcher tabs */}
          {authMode !== 'forgot-password' && authMode !== 'reset-password' && (
            <div className="flex border-b border-white/10 pb-1 gap-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setOtpSuccessMsg('');
                  setOtpSent(false);
                }}
                className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none ${authMode === 'login'
                  ? 'border-[#2796a9] text-[#2796a9]'
                  : 'border-transparent text-white/50 hover:text-white/80'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                  setOtpSuccessMsg('');
                  setOtpSent(false);
                }}
                className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none ${authMode === 'signup'
                  ? 'border-[#2796a9] text-[#2796a9]'
                  : 'border-transparent text-white/50 hover:text-white/80'
                  }`}
              >
                Sign Up
              </button>
            </div>
          )}



          {authMode === 'login' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Commercial Portal Login
                </h4>
                <p className="text-[11px] text-white/50 font-light leading-relaxed">
                  Secure access to your procurement workspace.
                </p>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><Mail size={16} /></span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(4,102,123,0.3)] cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              {loginAttempts >= 2 && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot-password'); setError(''); setOtpSuccessMsg(''); }}
                    className="text-xs text-[#2796a9] hover:text-white transition-colors text-left cursor-pointer font-medium"
                  >
                    Forgot Password? Reset it here
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setError(''); setOtpSuccessMsg(''); }}
                    className="text-xs text-white/50 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    New to CTS? Sign up
                  </button>
                </div>
              )}
            </form>
          ) : authMode === 'signup' ? (
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Create Commercial Account
                </h4>
                <p className="text-[11px] text-white/50 font-light leading-relaxed">
                  Register your organization to streamline purchasing and quotation requests.
                </p>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><User size={16} /></span>
                <input
                  type="text"
                  placeholder="Username"
                  value={signupUsername}
                  disabled={otpSent}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white disabled:opacity-50"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><Mail size={16} /></span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  disabled={otpSent}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white disabled:opacity-50"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><span className="text-xs">🏢</span></span>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={signupCompany}
                  disabled={otpSent}
                  onChange={(e) => setSignupCompany(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white disabled:opacity-50"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><span className="text-xs">📞</span></span>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={signupPhone}
                  disabled={otpSent}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white disabled:opacity-50"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  disabled={otpSent}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  disabled={otpSent}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white disabled:opacity-50"
                  required
                />
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-2.5 bg-[#04667b] hover:bg-[#2796a9] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(4,102,123,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3.5">
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-white/40"><Mail size={16} /></span>
                    <input
                      type="text"
                      placeholder="Enter 4-Digit OTP"
                      value={enteredOtp}
                      maxLength={4}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white font-mono text-center tracking-widest"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 text-white text-[15px] font-bold rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(4,102,123,0.4)] cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify & Sign Up'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-full py-2.5 border-2 border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Change Details
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : authMode === 'forgot-password' ? (
            <form onSubmit={handleSendResetOtp} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-white tracking-wide">Forgot Password</h4>
                <p className="text-[11px] text-white/50 font-light leading-relaxed">Enter your email to receive a reset code.</p>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><Mail size={16} /></span>
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white" required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(4,102,123,0.3)] cursor-pointer disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
              <button type="button" onClick={() => { setAuthMode('login'); setError(''); setOtpSuccessMsg(''); }} className="text-xs text-[#2796a9] hover:text-white transition-colors mt-2 text-center w-full cursor-pointer underline">Back to Sign In</button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-white tracking-wide">Reset Password</h4>
                <p className="text-[11px] text-white/50 font-light leading-relaxed">Enter the 4-digit code and your new password.</p>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><Mail size={16} /></span>
                <input type="text" placeholder="Enter 4-Digit OTP" value={enteredOtp} maxLength={4} onChange={(e) => setEnteredOtp(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white font-mono text-center tracking-widest" required />
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-white/40"><Lock size={16} /></span>
                <input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all duration-300 placeholder:text-white/30 text-white" required />
                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 text-white/40 hover:text-white transition-colors cursor-pointer">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(4,102,123,0.3)] cursor-pointer disabled:opacity-50">
                {loading ? 'Resetting...' : 'Set New Password'}
              </button>
              <button type="button" onClick={() => { setAuthMode('login'); setOtpSent(false); setError(''); setOtpSuccessMsg(''); }} className="text-xs text-[#2796a9] hover:text-white transition-colors mt-2 text-center w-full cursor-pointer underline">Cancel</button>
            </form>
          )}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-medium text-center">
              {error}
            </div>
          )}

          {otpSuccessMsg && (
            <div className="text-[11px] text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg font-medium leading-relaxed text-center">
              {otpSuccessMsg}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
