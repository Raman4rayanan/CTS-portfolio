import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import SeoHead from './components/SeoHead';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/errors/NotFoundPage';
import OfflinePage from './pages/errors/OfflinePage';
import MaintenancePage from './pages/errors/MaintenancePage';

// Lazy load heavy route components
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const ShopPage = lazy(() => import('./components/ShopPage'));


function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function LandingPage() {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('hasSeenIntro'));
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

  // Apply SEO Meta Tags when config loads (handled by SeoHead now)
  const metaTitle = config?.metaTitle || 'CONCEPT TOOLS AND SERVICES';
  const metaDescription = config?.metaDescription || 'Premium Industrial & E-commerce solutions.';
  const metaImage = config?.metaImage || '';
  const currentUrl = window.location.href;
  const googleSiteVerification = config?.googleSiteVerification || '';
  const bingSiteVerification = config?.bingSiteVerification || '';
  const ga4Id = config?.ga4Id || '';
  const gtmId = config?.gtmId || '';
  const companyEmail = config?.companyEmail || 'sales@concept-tools.com';

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Concept Tools and Services (CTS)",
    "url": currentUrl,
    "logo": metaImage || `${currentUrl}logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": companyEmail,
      "contactType": "customer service"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": currentUrl,
    "name": "Concept Tools and Services"
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Concept Tools and Services (CTS)",
    "image": metaImage || `${currentUrl}logo.png`,
    "url": currentUrl,
    "telephone": config?.companyPhone || "",
    "email": companyEmail,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config?.companyAddress || "",
      "addressCountry": "QA"
    }
  };

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
      <SeoHead 
        title={metaTitle}
        description={metaDescription}
        imageUrl={metaImage}
        pageUrl={currentUrl}
        canonicalUrl={currentUrl}
        googleSiteVerification={googleSiteVerification}
        bingSiteVerification={bingSiteVerification}
        ga4Id={ga4Id}
        gtmId={gtmId}
        schema={[orgSchema, websiteSchema, localBusinessSchema]}
      />
      <Navbar isVisible={!showIntro} />
      <AnimatePresence>
        {showIntro && (
          <IntroScreen 
            key="intro" 
            onComplete={() => {
              sessionStorage.setItem('hasSeenIntro', 'true');
              setShowIntro(false);
            }} 
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return <OfflinePage />;
  }

  // Maintenance Mode toggle via environment variable
  if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
    return <MaintenancePage />;
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-950 text-white font-bold text-2xl tracking-widest animate-pulse">LOADING...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/product/:productId" element={<ShopPage />} />
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
