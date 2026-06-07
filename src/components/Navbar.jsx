import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, User, Eye, EyeOff, LogOut, Mail, Lock } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Activities', href: '#activities' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ isVisible }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cts_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Track scroll to switch from transparent to solid background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('cts_user', JSON.stringify(data.user));
        localStorage.setItem('cts_token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Connection error. Is the server running?' };
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('cts_token');
      if (token) {
        await fetch('http://localhost:5000/api/admin/logout', {
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
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          key="navbar"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1], delay: 0.4 }}
          className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'bg-gradient-to-r from-[rgb(3,5,42)] via-[rgb(2,58,81)] to-[rgb(12,91,106)] backdrop-blur-md shadow-lg shadow-black/20'
            : 'bg-transparent'
            }`}
        >
          <div className="w-full px-4 md:px-8 lg:px-12 flex items-center justify-between h-24">

            {/* Logo */}
            <a href="#" onClick={() => setMobileOpen(false)} className="py-2 shrink-0 -translate-x-2 md:-translate-x-4">
              <img src="/logo.png" alt="CTS Logo" className="h-12 md:h-20 lg:h-24 w-auto object-contain origin-left object-left" />
            </a>

            {/* Desktop Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium tracking-[0.3px] normal-case antialiased text-white/80 hover:text-white transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 rounded-full" />
                </a>
              ))}
              <div className="flex items-center gap-6">
                <a
                  href="#shop"
                  className="cta-button px-5 py-2.5 bg-[#04667b] hover:bg-[#2796a9] text-white text-sm font-semibold tracking-[0.3px] normal-case antialiased rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(6,53,67,0.4)] hover:shadow-[0_0_20px_rgba(6,53,67,0.8)] hover:-translate-y-0.5 transform"
                >
                  Shop Now
                </a>
                <div className="relative" ref={dropdownRef}>
                  <button
                    aria-label="Profile"
                    onClick={() => setProfileOpen(prev => !prev)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                      profileOpen
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
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
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
                      className="text-base font-medium tracking-[0.3px] normal-case antialiased text-white/80 hover:text-white py-2 border-b border-white/5 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-3">
                      <a
                        href="#shop"
                        onClick={() => setMobileOpen(false)}
                        className="cta-button flex-1 px-5 py-3 bg-[#063543] hover:bg-[#052b36] text-white text-sm font-semibold tracking-[0.3px] normal-case antialiased rounded-lg text-center transition-all duration-300 shadow-[0_0_10px_rgba(6,53,67,0.4)] hover:shadow-[0_0_20px_rgba(6,53,67,0.8)]"
                      >
                        Shop Now
                      </a>
                      <button
                        aria-label="Profile"
                        onClick={() => setMobileProfileOpen(prev => !prev)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-95 cursor-pointer ${
                          mobileProfileOpen 
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
                          />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

function ProfilePopup({ user, onClose, onLogout, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    } else {
      onClose();
    }
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
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#04667b] to-[#2796a9] flex items-center justify-center text-xl font-bold border border-white/20 shadow-md">
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-white">{user.username || 'User'}</span>
            <span className="text-sm text-white/60 font-light">{user.email}</span>
            <span className="text-xs text-[#2796a9] font-medium mt-1 bg-[#2796a9]/10 px-2 py-0.5 rounded-full self-center">
              {user.role} Account
            </span>
          </div>

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
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <h4 className="text-lg font-bold text-white tracking-wide">
              Welcome Back
            </h4>
            <p className="text-xs text-white/50 font-light">
              Sign in to access your details and dashboard.
            </p>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg font-medium">
              {error}
            </div>
          )}

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
        </form>
      )}
    </motion.div>
  );
}
