import React from 'react';

const partners = [
  { name: 'Bosch Power Tools', src: '/boach-Photoroom.png' },
  { name: 'Ingersoll Rand', src: '/inger.png' },
  { name: 'Stanley Black & Decker', src: '/stanley.jpg' },
  { name: 'Kärcher', src: '/karcher.png' },
  { name: 'Eibenstock', src: '/elbenstock.png' },
  { name: 'Klingspor', src: '/Klingspor-Emblem.png' },
  { name: 'Cromwell Tools Industries', src: '/comwell.png' },
  { name: 'KOVAX Abrasive Solutions', src: '/kovax.png' },
  { name: 'Atlas Protective Products', src: '/atlas.png' }
];

const customers = [
  { name: 'Nordex India', src: '/nordex-Photoroom.png' },
  { name: 'Senvion India', src: '/Senvion-Photoroom.png' },
  { name: 'Suzlon Energy', src: '/suzlon-Photoroom.png' },
  { name: 'Gurit Wind', src: '/gurit-Photoroom.png' },
  { name: 'Indocool Composites', src: '/indocool-Photoroom.png' },
  { name: 'Stellantis Avtec Powertrain', src: '/Stellantis-Photoroom.png' },
  { name: 'Exeraxis India', src: '/EVERAXIS-Photoroom.png' }
];

export default function PartnersSection() {
  return (
    <section className="py-24 overflow-hidden flex flex-col gap-20">
      
      {/* 
        Inline styles for custom smooth marquees and hover pausing.
        This provides much better control for pausing on hover than standard Framer Motion repeats.
      */}
      <style>
        {`
          @keyframes marqueeLeft {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee-left {
            animation: marqueeLeft 45s linear infinite;
          }
          .animate-marquee-right {
            animation: marqueeRight 40s linear infinite;
          }
          .pause-on-hover:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* ----------------- PARTNERS ROW ----------------- */}
      <div className="w-full relative">
        <h3 className="text-center text-xl font-semibold mb-10 uppercase tracking-widest px-6" style={{ color: '#1b809a' }}>
          The Companies We Partner With
        </h3>
        
        <div className="relative flex w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#040C19] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#040C19] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="flex w-max animate-marquee-left pause-on-hover">
            {/* Set 1 */}
            <div className="flex gap-20 items-center flex-shrink-0 px-10">
              {partners.map((partner, idx) => (
                <div key={`p-set1-${idx}`} className="group flex-shrink-0 w-48 h-24 flex items-center justify-center p-2 cursor-pointer">
                  {/*
                     brightness-0 invert = Pure White. 
                     group-hover resets it back to normal with a transition.
                  */}
                  <img 
                    src={partner.src} 
                    alt={partner.name} 
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105" 
                    title={partner.name} 
                  />
                </div>
              ))}
            </div>
            {/* Set 2 */}
            <div className="flex gap-20 items-center flex-shrink-0 px-10">
              {partners.map((partner, idx) => (
                <div key={`p-set2-${idx}`} className="group flex-shrink-0 w-48 h-24 flex items-center justify-center p-2 cursor-pointer">
                  <img 
                    src={partner.src} 
                    alt={partner.name} 
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105" 
                    title={partner.name} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- CUSTOMERS ROW ----------------- */}
      <div className="w-full relative">
        <h3 className="text-center text-xl font-semibold mb-10 uppercase tracking-widest px-6" style={{ color: '#1b809a' }}>
          Our Prestigious Customers
        </h3>
        
        <div className="relative flex w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#040C19] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#040C19] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track Reverse */}
          <div className="flex w-max animate-marquee-right pause-on-hover">
            {/* Set 1 */}
            <div className="flex gap-20 items-center flex-shrink-0 px-10">
              {customers.map((customer, idx) => (
                <div key={`c-set1-${idx}`} className="group flex-shrink-0 w-48 h-24 flex items-center justify-center p-2 cursor-pointer">
                  <img 
                    src={customer.src} 
                    alt={customer.name} 
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105" 
                    title={customer.name} 
                  />
                </div>
              ))}
            </div>
            {/* Set 2 */}
            <div className="flex gap-20 items-center flex-shrink-0 px-10">
              {customers.map((customer, idx) => (
                <div key={`c-set2-${idx}`} className="group flex-shrink-0 w-48 h-24 flex items-center justify-center p-2 cursor-pointer">
                  <img 
                    src={customer.src} 
                    alt={customer.name} 
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105" 
                    title={customer.name} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
