import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, ThumbsUp, HardHat } from 'lucide-react';

const journey = [
  { year: '2021', event: 'Founded' },
  { year: '2022', event: 'Expanded Portfolio' },
  { year: '2023', event: 'Engineering & Global Partnerships' },
  { year: '2024', event: 'Presence across Wind Energy Sector' },
];

const reasons = [
  { title: 'High-Quality Products', icon: ShieldCheck,  desc: 'Sourced from best global brands.' },
  { title: 'HSE COMPLIANCE',        icon: HardHat,       desc: 'Highest standards in health & safety.' },
  { title: 'Advanced Technology',   icon: Cpu,           desc: 'State-of-the-art tools and equipment.' },
  { title: 'Reliable Service',      icon: ThumbsUp,      desc: 'Consistent support you can count on.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function AboutSection() {
  const [currentImg, setCurrentImg] = useState(0);
  const aboutImages = ['/about 1.jpg', '/about 2.jpg', '/about 3.jpg', '/about 4.jpg'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % aboutImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="about" className="bg-white py-20 px-6 md:px-16 lg:px-28">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ===== LEFT COLUMN ===== */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Hero image — activity card style with text at bottom */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl h-[560px] bg-primary-navy/10">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={currentImg}
                  src={aboutImages[currentImg]}
                  alt="Concept Tools Workshop"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              {/* Bottom-up gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/90 via-primary-navy/30 to-transparent" />

              {/* Bottom-aligned text — exactly like the reference */}
              <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 text-white">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-lg">
                  Powering Industries with{' '}
                  <span className="text-blue-300">Precision &amp; Reliability</span>
                </h2>
                <p className="mt-3 text-base text-slate-200 leading-relaxed font-light max-w-md">
                  CTS is dedicated to being the most trusted partner for industrial tools and MRO
                  solutions, delivering world-class products paired with over 25 years of hands-on
                  expertise to meet evolving demands with full HSE compliance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ===== RIGHT COLUMN ===== */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="flex flex-col gap-14"
          >

            {/* Our Journey */}
            <div>
              <motion.h3
                variants={fadeUp}
                className="text-2xl md:text-3xl font-bold text-primary-navy mb-8"
              >
                Our Journey
              </motion.h3>

              {/* Timeline */}
              <div className="relative flex flex-col gap-0 pl-6 border-l-2 border-slate-200">
                {journey.map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    className="relative mb-8 last:mb-0"
                  >
                    <span
                      className="absolute -left-[1.45rem] top-1 w-4 h-4 rounded-full border-2 border-white shadow-md bg-primary-blue"
                    />
                    <p className="text-slate-700 text-base leading-snug">
                      <span className="font-bold text-primary-navy">{item.year}:</span> {item.event}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Why Choose Us */}
            <div>
              <motion.h3
                variants={fadeUp}
                className="text-2xl md:text-3xl font-bold text-primary-navy mb-8"
              >
                Why Choose Us
              </motion.h3>

              <div className="grid grid-cols-2 gap-4">
                {reasons.map((reason, idx) => {
                  const Icon = reason.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={fadeUp}
                      className="flex items-center gap-5 p-4 bg-background-light rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-14 h-14 flex-shrink-0 bg-white text-primary-blue rounded-full shadow-sm flex items-center justify-center">
                        <Icon size={26} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary-navy text-sm">{reason.title}:</h4>
                        <p className="text-slate-500 text-sm">{reason.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}
