import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import IntroScreen from './components/IntroScreen';
import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import ActivitiesSection from './components/ActivitiesSection';
import PartnersSection from './components/PartnersSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

function App() {
  const [showIntro, setShowIntro] = useState(true);

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
        <HeroSection isVisible={!showIntro} />
        
        {/* Layer 1: Slides over Hero */}
        <div className="relative z-20 shadow-[0_-15px_40px_rgba(0,0,0,0.4)] bg-white">
          <AboutSection />
          <ServicesSection />
          <ActivitiesSection />
        </div>
        
        {/* Layer 2: Partners (scrolls up, then sticks acting as a new background layer) */}
        <div className="sticky top-0 z-10 w-full min-h-[100svh] bg-[radial-gradient(ellipse_at_center,_#112A4F_0%,_#040C19_65%,_#02060C_100%)] flex flex-col justify-center overflow-hidden">
          <PartnersSection />
        </div>
        
        {/* Layer 3: Slides over Partners */}
        <div className="relative z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] bg-white">
          <ContactSection />
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default App;
