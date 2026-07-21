import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import IntroScreen from './components/IntroScreen';
import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import ActivitiesSection from './components/ActivitiesSection';
import PartnersSection from './components/PartnersSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import ShopPage from './components/ShopPage';


function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function LandingPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [config, setConfig] = useState(null);

  // Fetch portfolio settings config
  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiBaseUrl}/api/portfolio/config?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data);
        }
      })
      .catch(err => console.error('Error fetching portfolio config:', err));
  }, []);

  // Apply SEO Meta Tags when config loads
  useEffect(() => {
    if (config) {
      if (config.metaTitle) document.title = config.metaTitle;
      
      if (config.metaDescription) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = "description";
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = config.metaDescription;
      }

      if (config.metaImage) {
        let metaImg = document.querySelector('meta[property="og:image"]');
        if (!metaImg) {
          metaImg = document.createElement('meta');
          metaImg.setAttribute("property", "og:image");
          document.head.appendChild(metaImg);
        }
        metaImg.content = config.metaImage;
      }
    }
  }, [config]);

  // Disable scrolling while the intro screen is active
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showIntro]);

  return (
    <div className="relative min-h-screen bg-primary-navy font-sans text-slate-800">
      <Navbar isVisible={!showIntro} />
      <AnimatePresence>
        {showIntro && (
          <IntroScreen 
            key="intro" 
            onComplete={() => setShowIntro(false)} 
          />
        )}
      </AnimatePresence>
      
      <main>
        {/* Hero Section is sticky, so sections below will slide over it */}
        <HeroSection isVisible={!showIntro} config={config} />
        
        {/* Layer 1: Slides over Hero */}
        <div className="relative z-20 shadow-[0_-15px_40px_rgba(0,0,0,0.4)] bg-white">
          <AboutSection config={config} />
          <ServicesSection />
          <ActivitiesSection />
        </div>
        
        {/* Layer 2: Partners (scrolls up, then sticks acting as a new background layer) */}
        {(() => {
          const c1 = config?.partnersBgColor1 || '#112A4F';
          const c2 = config?.partnersBgColor2 || '#040C19';
          const c3 = config?.partnersBgColor3 || '#02060C';
          return (
            <div 
              className="sticky top-0 z-10 w-full min-h-[100svh] flex flex-col justify-center overflow-hidden"
              style={{ background: `radial-gradient(ellipse at center, ${c1} 0%, ${c2} 65%, ${c3} 100%)` }}
            >
              <PartnersSection config={config} />
            </div>
          );
        })()}
        
        {/* Layer 3: Slides over Partners */}
        <div className="relative z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] bg-white">
          <ContactSection />
          <Footer />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/shop" element={<ShopPage />} />
      </Routes>
    </>
  );
}

export default App;
