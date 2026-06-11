import React from 'react';

const partners = [
  { name: 'Bosch Power Tools', src: '/boach-Photoroom.png', scale: 1.25 },
  { name: 'Ingersoll Rand', src: '/inger.png', scale: 1.35 },
  { name: 'Stanley Black & Decker', src: '/stanley.png', scale: 1.00 },
  { name: 'Kärcher', src: '/karcher.png' },
  { name: 'Eibenstock', src: '/elbenstock.png', scale: 2.5 },
  { name: 'Klingspor', src: '/Klingspor-Emblem.png' },
  { name: 'Cromwell Tools Industries', src: '/comwell.png', scale: 1.8 },
  { name: 'KOVAX Abrasive Solutions', src: '/kovax.png' },
  { name: 'Atlas Protective Products', src: '/atlas.png', scale: 2.5 }
];

const customers = [
  { name: 'Nordex India', src: '/nordex-Photoroom.png' },
  { name: 'Senvion India', src: '/Senvion-Photoroom.png' },
  { name: 'Suzlon Energy', src: '/suzlon-Photoroom.png', scale: 1.50 },
  { name: 'Gurit Wind', src: '/gurit-Photoroom.png', scale: 1.35 },
  { name: 'Indocool Composites', src: '/indocool-Photoroom.png' },
  { name: 'Stellantis Avtec Powertrain', src: '/Stellantis-Photoroom.png', scale: 1.35 },
  { name: 'Exeraxis India', src: '/EVERAXIS-Photoroom.png', scale: 2.00 }
];

export default function PartnersSection({ config }) {
  const partnersList = config && config.partners && config.partners.length > 0 ? config.partners : partners;
  const customersList = config && config.customers && config.customers.length > 0 ? config.customers : customers;



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
          .logo-img {
            transform: scale(var(--base-scale, 1));
          }
          .group:hover .logo-img {
            transform: scale(calc(var(--base-scale, 1) * 1.05));
          }
        `}
      </style>

      {/* ----------------- PARTNERS ROW ----------------- */}
      <div className="w-full relative">
        <h3 className="text-center text-lg md:text-xl font-semibold mb-10 uppercase tracking-widest px-6" style={{ color: '#1b809a' }}>
          The Companies We Partner With
        </h3>

        <div
          className="relative flex w-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, white 8rem, white calc(100% - 8rem), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, white 8rem, white calc(100% - 8rem), transparent)'
          }}
        >

          {/* Marquee Track */}
          <div className="flex w-max animate-marquee-left pause-on-hover">
            {/* Set 1 */}
            <div className="flex gap-12 md:gap-20 items-center flex-shrink-0 px-10">
              {partnersList.map((partner, idx) => (
                <div key={`p-set1-${idx}`} className="group flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex items-center justify-center p-2 cursor-pointer">
                  {/*
                     brightness-0 invert = Pure White. 
                     group-hover resets it back to normal with a transition.
                  */}
                  <img
                    src={partner.src}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500 logo-img"
                    style={{ '--base-scale': String(partner.scale || 1) }}
                    title={partner.name}
                  />
                </div>
              ))}
            </div>
            {/* Set 2 */}
            <div className="flex gap-12 md:gap-20 items-center flex-shrink-0 px-10">
              {partnersList.map((partner, idx) => (
                <div key={`p-set2-${idx}`} className="group flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex items-center justify-center p-2 cursor-pointer">
                  <img
                    src={partner.src}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500 logo-img"
                    style={{ '--base-scale': String(partner.scale || 1) }}
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
        <h3 className="text-center text-lg md:text-xl font-semibold mb-10 uppercase tracking-widest px-6" style={{ color: '#1b809a' }}>
          Our Prestigious Customers
        </h3>

        <div
          className="relative flex w-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, white 8rem, white calc(100% - 8rem), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, white 8rem, white calc(100% - 8rem), transparent)'
          }}
        >

          {/* Marquee Track Reverse */}
          <div className="flex w-max animate-marquee-right pause-on-hover">
            {/* Set 1 */}
            <div className="flex gap-12 md:gap-20 items-center flex-shrink-0 px-10">
              {customersList.map((customer, idx) => (
                <div key={`c-set1-${idx}`} className="group flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex items-center justify-center p-2 cursor-pointer">
                  <img
                    src={customer.src}
                    alt={customer.name}
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500 logo-img"
                    style={{ '--base-scale': String(customer.scale || 1) }}
                    title={customer.name}
                  />
                </div>
              ))}
            </div>
            {/* Set 2 */}
            <div className="flex gap-12 md:gap-20 items-center flex-shrink-0 px-10">
              {customersList.map((customer, idx) => (
                <div key={`c-set2-${idx}`} className="group flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex items-center justify-center p-2 cursor-pointer">
                  <img
                    src={customer.src}
                    alt={customer.name}
                    className="max-w-full max-h-full object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-500 logo-img"
                    style={{ '--base-scale': String(customer.scale || 1) }}
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
