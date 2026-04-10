import React from 'react';
import { motion } from 'framer-motion';

const customers = [
  { name: 'Nordex India', src: '/nordex-Photoroom.png' },
  { name: 'Senvion India', src: '/Senvion-Photoroom.png' },
  { name: 'Suzlon Energy', src: '/suzlon-Photoroom.png' },
  { name: 'Gurit Wind', src: '/gurit-Photoroom.png' },
  { name: 'Indocool Composites', src: '/indocool-Photoroom.png' },
  { name: 'Stellantis Avtec Powertrain', src: '/Stellantis-Photoroom.png' },
  { name: 'Exeraxis India', src: '/EVERAXIS-Photoroom.png' }
];

export default function CustomersSection() {
  return (
    <section className="bg-white py-20 overflow-hidden border-t border-slate-100">
      <div className="w-full">
        <h2 className="text-center text-3xl font-bold text-primary-navy mb-12 uppercase tracking-wide">
          Our Prestigious Customers
        </h2>
        
        <div className="relative flex w-full overflow-hidden">
          {/* Fading Gradients for smooth edges - pointer-events-none so it doesn't block clicks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Seamless infinite loop container (reverse direction) */}
          <motion.div
            className="flex w-max"
            animate={{
              x: ['-50%', '0%'], // Animates from -50% to 0% to go right
            }}
            transition={{
              duration: 35, // Slightly different duration for visual separation from partners
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{ width: "max-content" }}
          >
            {/* Set 1 */}
            <div className="flex gap-20 items-center flex-shrink-0 px-10">
              {customers.map((customer, idx) => (
                <div
                  key={`set1-${idx}`}
                  className="flex-shrink-0 w-48 h-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100"
                >
                  <img 
                    src={customer.src} 
                    alt={customer.name}
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                    title={customer.name}
                  />
                </div>
              ))}
            </div>

            {/* Set 2 (exact duplicate for seamless loop) */}
            <div className="flex gap-20 items-center flex-shrink-0 px-10">
              {customers.map((customer, idx) => (
                <div
                  key={`set2-${idx}`}
                  className="flex-shrink-0 w-48 h-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100"
                >
                  <img 
                    src={customer.src} 
                    alt={customer.name}
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                    title={customer.name}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
